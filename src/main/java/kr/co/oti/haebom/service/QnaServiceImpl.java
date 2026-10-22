package kr.co.oti.haebom.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.dto.QnaAnswerDTO;
import kr.co.oti.haebom.dto.QnaDTO;
import kr.co.oti.haebom.mapper.QnaMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QnaServiceImpl implements QnaService {

    private final QnaMapper qnaMapper;

    // 1. 문의글 전체 목록 조회
    @Override
    public List<QnaDTO> getQnaList() {
        return qnaMapper.selectQnaList();
    }

    // 2. 문의글 등록
    @Override
    public void createQna(QnaDTO qnaDTO) {
        // 로그인 연동 전: 작성자 번호가 없으면 기본 1번 회원으로 지정
        if (qnaDTO.getMemberId() == null) {
            qnaDTO.setMemberId(1);
        }
        qnaMapper.insertQna(qnaDTO);
    }
    
    // 3. 문의글 삭제
    @Override
    public void deleteQna(Integer qnaId) {
    	qnaMapper.deleteQna(qnaId);
    }

    // 4. 문의글 수정
    @Override
    public void updateQna(QnaDTO qnaDTO) {
        qnaMapper.updateQna(qnaDTO);
    }
    
    // 5. 관리자 답변 등록 및 문의 상태 'ANSWERED' 자동 변경
    @Override
    @Transactional // 답변 등록과 상태 변경이 동시에 안전하게 실행 되도록 트랜잭션 보장!
    public void registerAnswer(Integer qnaId, QnaAnswerDTO answerDTO) {
    	answerDTO.setQnaId(qnaId);
    	if (answerDTO.getMemberId() == null) {
    		answerDTO.setMemberId(1); // 로그인 연동 전: 기본 1번 관리자로 지정
    	}
    	qnaMapper.insertQnaAnswer(answerDTO);
    	qnaMapper.updateQnaStatus(qnaId, "ANSWERED");
    }
    
    // 6. 특정 문의글의 답변 목록 조회
    @Override
    public List<QnaAnswerDTO> getAnswersByQnaId(Integer qnaId) {
    	return qnaMapper.selectAnswersByQnaId(qnaId);
    }
    
    // 7. 문의글 분류 및 상태 변경
    @Override
    public void updateInquiryStatusAndCategory(Integer qnaId, Integer categoryId, String status) {
    	qnaMapper.updateQnaCategoryAndStatus(qnaId, categoryId, status);
    }
}