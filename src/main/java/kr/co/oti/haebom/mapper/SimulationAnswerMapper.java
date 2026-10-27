package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.dto.AnswerResponseDTO;
import kr.co.oti.haebom.dto.AnswerSaveRequestListDTO;

public interface SimulationAnswerMapper {
	 // 입력값 저장 및 수정 (UPSERT)
    int upsertAnswer(
        @Param("progressId") Integer progressId,
        @Param("answer") AnswerSaveRequestListDTO answer
    );

    // 특정 단계의 입력값 조회
    List<AnswerResponseDTO> findByProgressIdAndStepId(
        @Param("progressId") Integer progressId,
        @Param("stepId") Integer stepId
    );

    // 시뮬레이션 전체 입력값 조회
    List<AnswerResponseDTO> findByProgressId(
        @Param("progressId") Integer progressId
    );
}
