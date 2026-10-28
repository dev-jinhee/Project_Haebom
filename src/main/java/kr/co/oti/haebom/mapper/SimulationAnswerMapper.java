package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.dto.AnswerResponseDTO;
import kr.co.oti.haebom.dto.AnswerSaveRequestListDTO;

public interface SimulationAnswerMapper {
	// 입력값 저장 및 수정 (UPSERT)
	int upsertAnswer(@Param("progressId") Integer progressId,
			@Param("answer") AnswerSaveRequestListDTO.AnswerSaveRequestDTO answer);

	// 특정 단계의 입력값 조회
	List<AnswerResponseDTO> findAnswerByProgressIdAndStepId(@Param("progressId") Integer progressId,
			@Param("stepId") Integer stepId);

	// 시뮬레이션 전체 입력값 조회
	List<AnswerResponseDTO> findAnswerByProgressId(Integer progressId);

	// 단계별 입력 데이터 물리 삭제
	int deleteSimulationAnswer(Integer progressId);

}
