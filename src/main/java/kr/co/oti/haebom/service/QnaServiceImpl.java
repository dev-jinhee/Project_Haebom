package kr.co.oti.haebom.service;

import java.util.List;

import org.springframework.stereotype.Service;

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
}