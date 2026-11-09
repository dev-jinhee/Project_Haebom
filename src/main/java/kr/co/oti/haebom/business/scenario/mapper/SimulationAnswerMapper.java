package kr.co.oti.haebom.business.scenario.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.business.scenario.dto.AnswerResponseDTO;
import kr.co.oti.haebom.business.scenario.dto.AnswerSaveRequestListDTO;

public interface SimulationAnswerMapper {
	// 입력값 저장 및 수정 (UPSERT)
	int upsertAnswer(@Param("progressId") Integer progressId,
			@Param("answer") AnswerSaveRequestListDTO.AnswerSaveRequestDTO answer);

	// 특정 단계의 입력값 조회
	List<AnswerResponseDTO> findAnswerByProgressIdAndStepId(@Param("progressId") Integer progressId,
			@Param("stepId") Integer stepId);

	// 단계별 입력 데이터 물리 삭제
	int deleteSimulationAnswer(Integer progressId);

	// 사용자의 입력 데이터 전부 삭제
	int deleteAnswerByMemberId(Integer memberId);

	// 전입신고 임대차계약서 첨부파일 JSON 조회
	String selectLeaseAttachmentJson(Integer progressId);

	// [진희] 특정 진행 기록(progressId)과 fieldKey로 answer_value 단건 조회 (예: 전입신고 새 주소 currentAddress)
	String selectAnswerValueByFieldKey(@Param("progressId") Integer progressId, @Param("fieldKey") String fieldKey);
}
