package kr.co.oti.haebom.service;

import kr.co.oti.haebom.dto.SimulationProgressDTO;

public interface SimulationService {
	// 시뮬레이션 시작
	Integer startSimulation(Integer scenarioId, Integer memberId);

	// 진행 이력 단건 조회
	SimulationProgressDTO getProgress(Integer progressId, Integer memberId);
	
	// 이전 단계 이동(입력값 저장X)
	void moveToStep(Integer progressId, Integer memberId, Integer targetStepId);

	// 다음 단계 이동 (저장 O)
	void saveAndMoveToStep(Integer progressId, Integer memberId, Integer targetStepId);
	
	// 시뮬레이션 완료 처리 (저장 O)
	void completeSimulation(Integer progressId, Integer memberId);
}
