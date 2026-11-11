package kr.co.oti.haebom.business.inquiry.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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

    private static final Set<String> ALLOWED_QNA_STATUSES = Set.of("WAITING", "ANSWERED");
    private static final int MAX_QNA_TITLE_LENGTH = 200;

    private final QnaMapper qnaMapper;
    private final AdminDashboardService adminDashboardService;
    private final POI poi;

    // 1. 문의글 전체 목록 조회
    public List<QnaDTO> getQnaList() {
        return qnaMapper.selectQnaList();
    }

    // 2. 문의글 등록
    public void createQna(QnaDTO qnaDTO, int currentMemberId) {
        if (currentMemberId <= 0) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요한 서비스입니다.");
        }
        validateQnaInput(qnaDTO);

        // 클라이언트 조작 방지를 위해 작성자 ID와 초기 상태를 서버에서 강제 지정
        qnaDTO.setMemberId(currentMemberId);
        qnaDTO.setQnaStatus("WAITING");

        qnaMapper.insertQna(qnaDTO);
    }

    // 3. 문의글 삭제 (작성자 본인 또는 관리자만 가능)
    public void deleteQna(Integer qnaId, int currentMemberId, boolean isAdmin) {
        QnaDTO existing = requireActiveQna(qnaId);
        boolean isOwner = existing.getMemberId() != null && existing.getMemberId().equals(currentMemberId);
        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자 본인 또는 관리자만 삭제할 수 있습니다.");
        }

        int deletedRows = qnaMapper.deleteQna(qnaId);
        if (deletedRows != 1) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않거나 이미 삭제된 문의글입니다.");
        }
    }

    // 4. 문의글 수정 (작성자 본인 + 답변 대기 상태만 수정 가능)
    public void updateQna(Integer qnaId, QnaDTO qnaDTO, int currentMemberId) {
        QnaDTO existing = requireActiveQna(qnaId);
        if (existing.getMemberId() == null || !existing.getMemberId().equals(currentMemberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자 본인만 수정할 수 있습니다.");
        }
        if ("ANSWERED".equals(existing.getQnaStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "답변이 완료된 문의글은 수정할 수 없습니다.");
        }

        validateQnaInput(qnaDTO);
        qnaDTO.setQnaId(qnaId);
        qnaDTO.setMemberId(existing.getMemberId());
        qnaDTO.setQnaStatus(existing.getQnaStatus());

        int updatedRows = qnaMapper.updateQna(qnaDTO);
        if (updatedRows != 1) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않거나 이미 삭제된 문의글입니다.");
        }
    }

    // 5. 관리자 답변 등록 및 문의 상태 'ANSWERED' 자동 변경
    @Transactional // 답변 등록과 상태 변경이 동시에 안전하게 실행 되도록 트랜잭션 보장!
    public void registerAnswer(Integer qnaId, QnaAnswerDTO answerDTO, int currentAdminId) {
        if (currentAdminId <= 0) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "관리자 인증 정보가 유효하지 않습니다.");
        }
        requireActiveQna(qnaId);

        if (answerDTO == null || answerDTO.getQnaAnswerContent() == null || answerDTO.getQnaAnswerContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "답변 내용을 입력해주세요.");
        }
        String cleanAnswer = XssUtils.clean(answerDTO.getQnaAnswerContent()).trim();
        if (cleanAnswer.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 답변 내용을 입력해주세요.");
        }

        answerDTO.setQnaId(qnaId);
        answerDTO.setMemberId(currentAdminId);
        answerDTO.setQnaAnswerContent(cleanAnswer);

        qnaMapper.insertQnaAnswer(answerDTO);
        int updatedRows = qnaMapper.updateQnaStatus(qnaId, "ANSWERED");
        if (updatedRows != 1) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않거나 이미 삭제된 문의글입니다.");
        }
        adminDashboardService.recordActivity(currentAdminId, "QNA", "ANSWER", qnaId);
    }

    // 6. 특정 문의글의 답변 목록 조회 (비밀글은 작성자 본인 또는 관리자만 조회 가능)
    public List<QnaAnswerDTO> getAnswersByQnaId(Integer qnaId, Integer currentMemberId, boolean isAdmin) {
        QnaDTO existing = requireActiveQna(qnaId);
        if (Boolean.TRUE.equals(existing.getIsSecret())) {
            boolean isOwner = currentMemberId != null
                    && existing.getMemberId() != null
                    && existing.getMemberId().equals(currentMemberId);
            if (!isOwner && !isAdmin) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비밀글의 답변은 작성자와 관리자만 조회할 수 있습니다.");
            }
        }
        return qnaMapper.selectAnswersByQnaId(qnaId);
    }

    // 7. 문의글 분류 및 상태 변경
    public void updateInquiryStatusAndCategory(Integer qnaId, Integer categoryId, String status) {
        QnaDTO existing = requireActiveQna(qnaId);
        if (categoryId == null && (status == null || status.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "변경할 문의 분류 또는 상태를 입력해주세요.");
        }

        Integer resolvedCategoryId = existing.getQnaCategoryId();
        if (categoryId != null) {
            if (categoryId <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 문의 분류를 선택해주세요.");
            }
            resolvedCategoryId = categoryId;
        }

        String resolvedStatus = existing.getQnaStatus();
        if (status != null && !status.isBlank()) {
            String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
            if (!ALLOWED_QNA_STATUSES.contains(normalizedStatus)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "허용되지 않은 문의 상태입니다.");
            }
            resolvedStatus = normalizedStatus;
        }

        int updatedRows = qnaMapper.updateQnaCategoryAndStatus(qnaId, resolvedCategoryId, resolvedStatus);
        if (updatedRows != 1) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않거나 이미 삭제된 문의글입니다.");
        }
    }

    private QnaDTO requireActiveQna(Integer qnaId) {
        if (qnaId == null || qnaId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 문의 번호가 아닙니다.");
        }
        QnaDTO existing = qnaMapper.selectQnaById(qnaId);
        if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않거나 이미 삭제된 문의글입니다.");
        }
        return existing;
    }

    private void validateQnaInput(QnaDTO qnaDTO) {
        if (qnaDTO == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "문의 정보가 올바르지 않습니다.");
        }
        if (qnaDTO.getQnaCategoryId() == null || qnaDTO.getQnaCategoryId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "문의 분류를 선택해주세요.");
        }
        if (qnaDTO.getQnaTitle() == null || qnaDTO.getQnaTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "문의 제목을 입력해주세요.");
        }
        if (qnaDTO.getQnaContent() == null || qnaDTO.getQnaContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "문의 내용을 입력해주세요.");
        }

        String cleanTitle = XssUtils.clean(qnaDTO.getQnaTitle()).trim();
        String cleanContent = XssUtils.clean(qnaDTO.getQnaContent()).trim();
        if (cleanTitle.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 문의 제목을 입력해주세요.");
        }
        if (cleanTitle.length() > MAX_QNA_TITLE_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "문의 제목은 200자 이내로 입력해주세요.");
        }
        if (cleanContent.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 문의 내용을 입력해주세요.");
        }

        qnaDTO.setQnaTitle(cleanTitle);
        qnaDTO.setQnaContent(cleanContent);
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
