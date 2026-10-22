package kr.co.oti.haebom.service;

import java.util.List;

import kr.co.oti.haebom.dto.QnaAnswerDTO;
import kr.co.oti.haebom.dto.QnaDTO;

public interface QnaService {
    
    // 1. 문의글 전체 목록 조회
    List<QnaDTO> getQnaList();
    
    // 2. 문의글 등록
    void createQna(QnaDTO qnaDTO);
    
    // 3. 문의글 삭제
    void deleteQna(Integer qnaId);
    
    // 4. 문의글 수정
    void updateQna(QnaDTO qnaDTO);
    
    void registerAnswer(Integer qnaId, QnaAnswerDTO answerDTO);
    
    List<QnaAnswerDTO> getAnswersByQnaId(Integer qnaId);
    
    void updateInquiryStatusAndCategory(Integer qnaId, Integer category, String status);
}