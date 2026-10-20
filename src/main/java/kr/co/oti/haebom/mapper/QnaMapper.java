package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

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
}
