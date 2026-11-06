package kr.co.oti.haebom.business.inquiry.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.business.admin.service.AdminDashboardService;
import kr.co.oti.haebom.business.common.XssUtils;
import kr.co.oti.haebom.business.inquiry.dto.QnaAnswerDTO;
import kr.co.oti.haebom.business.inquiry.dto.QnaDTO;
import kr.co.oti.haebom.business.inquiry.mapper.QnaMapper;
import kr.co.oti.haebom.system.component.POI;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QnaService {

    private final QnaMapper qnaMapper;
    private final AdminDashboardService adminDashboardService;
    private final POI poi;

    // 1. 문의글 전체 목록 조회
    public List<QnaDTO> getQnaList() {
        return qnaMapper.selectQnaList();
    }

    // 2. 문의글 등록
    public void createQna(QnaDTO qnaDTO) {
        // 로그인 연동 전: 작성자 번호가 없으면 기본 1번 회원으로 지정
        if (qnaDTO.getMemberId() == null) {
            qnaDTO.setMemberId(1);
        }
        // XSS 방어: 제목 및 본문 악성 스크립트 정제
        qnaDTO.setQnaTitle(XssUtils.clean(qnaDTO.getQnaTitle()));
        qnaDTO.setQnaContent(XssUtils.clean(qnaDTO.getQnaContent()));

        qnaMapper.insertQna(qnaDTO);
    }
    
    // 3. 문의글 삭제
    public void deleteQna(Integer qnaId) {
    	qnaMapper.deleteQna(qnaId);
    }

    // 4. 문의글 수정
    public void updateQna(QnaDTO qnaDTO) {
        // XSS 방어: 수정 시에도 제목 및 본문 악성 스크립트 정제
        qnaDTO.setQnaTitle(XssUtils.clean(qnaDTO.getQnaTitle()));
        qnaDTO.setQnaContent(XssUtils.clean(qnaDTO.getQnaContent()));

        qnaMapper.updateQna(qnaDTO);
    }
    
    // 5. 관리자 답변 등록 및 문의 상태 'ANSWERED' 자동 변경
    @Transactional // 답변 등록과 상태 변경이 동시에 안전하게 실행 되도록 트랜잭션 보장!
    public void registerAnswer(Integer qnaId, QnaAnswerDTO answerDTO) {
    	answerDTO.setQnaId(qnaId);
    	if (answerDTO.getMemberId() == null) {
    		answerDTO.setMemberId(1); // 로그인 연동 전: 기본 1번 관리자로 지정
    	}
    	// XSS 방어: 답변 내용 악성 스크립트 정제
    	answerDTO.setQnaAnswerContent(XssUtils.clean(answerDTO.getQnaAnswerContent()));

    	qnaMapper.insertQnaAnswer(answerDTO);
    	qnaMapper.updateQnaStatus(qnaId, "ANSWERED");
    	adminDashboardService.recordActivity(answerDTO.getMemberId(), "QNA", "ANSWER", qnaId);
    }
    
    // 6. 특정 문의글의 답변 목록 조회
    public List<QnaAnswerDTO> getAnswersByQnaId(Integer qnaId) {
    	return qnaMapper.selectAnswersByQnaId(qnaId);
    }
    
    // 7. 문의글 분류 및 상태 변경
    public void updateInquiryStatusAndCategory(Integer qnaId, Integer categoryId, String status) {
    	qnaMapper.updateQnaCategoryAndStatus(qnaId, categoryId, status);
    }

    // 8. 문의글 목록 엑셀 다운로드 (DB 연동 + POI)
    public void downloadQnaListExcel(HttpServletResponse response) throws IOException {
        // 1) DB에서 삭제되지 않은 전체 문의글 조회
        List<QnaDTO> qnaList = qnaMapper.selectQnaList();

        // 2) 엑셀 헤더 컬럼 정의
        List<String> headers = Arrays.asList(
            "순번", "문의 번호", "문의 제목", "비밀글 여부", "문의 분류", 
            "작성자", "답변 상태", "담당자", "등록일시", "문의 내용"
        );

        // 3) 행(Row) 데이터 매핑 및 친절한 한글 변환
        List<List<Object>> rows = new ArrayList<>();
        int seq = 1;
        for (QnaDTO qna : qnaList) {
            String isSecretText = Boolean.TRUE.equals(qna.getIsSecret()) ? "비밀글" : "공개글";
            String categoryName = qna.getQnaCategoryName() != null ? qna.getQnaCategoryName() : "기타 문의";
            String author = qna.getMemberName() != null ? qna.getMemberName() : "익명";
            String statusText = "ANSWERED".equalsIgnoreCase(qna.getQnaStatus()) ? "답변 완료" : "답변 대기";
            String responder = qna.getResponderLoginId() != null ? qna.getResponderLoginId() : 
                               ("ANSWERED".equalsIgnoreCase(qna.getQnaStatus()) ? "관리자" : "미지정");

            List<Object> row = Arrays.asList(
                seq++,
                qna.getQnaId(),
                qna.getQnaTitle() != null ? qna.getQnaTitle() : "",
                isSecretText,
                categoryName,
                author,
                statusText,
                responder,
                qna.getQnaCreatedAt(),
                qna.getQnaContent() != null ? qna.getQnaContent() : ""
            );
            rows.add(row);
        }

        // 4) 파일명 생성 (예: 해봄_문의목록_20261104)
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String fileName = "해봄_문의목록_" + dateStr;

        // 5) POI 컴포넌트를 통해 엑셀 파일 생성 및 브라우저 전송
        poi.exportExcel(response, fileName, "문의목록", headers, rows);
    }
}
