package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.dto.QnaAnswerDTO;
import kr.co.oti.haebom.dto.QnaDTO;

@Mapper
public interface QnaMapper {
	
	List<QnaDTO> selectQnaList();
	
	// 문의글 등록 메서드 추가?!(QnaMapper.xml의 id="insertQna"와 연결)
	int insertQna(QnaDTO qnaDTO);
	
	// 문의글 삭제!
	int deleteQna(Integer qnaId);
	
	// 문의글 수정!
	int updateQna(QnaDTO qnaDTO);
	
	// 관리자 답변 등록
	int insertQnaAnswer(QnaAnswerDTO answerDTO);
	
	// 특정 문의글의 답변 목록 조회 (시간순)
	List<QnaAnswerDTO> selectAnswersByQnaId(Integer qnaId);
	
	// 문의글 답변 상태 변경 (WAITING / ANSWERED)
	int updateQnaStatus(@Param("qnaId") Integer qnaId, 
						@Param("qnaStatus") String qnaStatus);
	
	// 문의글 분류 및 상태 동시 변경 (모달 하단 저장용)
	int updateQnaCategoryAndStatus(@Param("qnaId") Integer qnaId, 
									@Param("qnaCategoryId") Integer qnaCategoryId, 
									@Param("qnaStatus") String qnaStatus);
}
