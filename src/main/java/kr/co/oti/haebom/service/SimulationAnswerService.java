package kr.co.oti.haebom.service;

import java.util.List;

import kr.co.oti.haebom.dto.AnswerResponseDTO;

public interface SimulationAnswerService {
	// 특정 단계 입력값 조회
	List<AnswerResponseDTO> getAnswersByStep(Integer progressId, Integer stepId, Integer memberId);

	// 전체 입력값 조회
	List<AnswerResponseDTO> getAnswersByProgress(Integer progressId, Integer memberId);
}
