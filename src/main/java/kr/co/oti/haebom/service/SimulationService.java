package kr.co.oti.haebom.service;

import kr.co.oti.haebom.dto.SimulationProgressDTO;

public interface SimulationService {
	// 시뮬레이션 시작
	Integer startSimulation(Integer scenarioId, Integer memberId);

	// 진행 이력 단건 조회
	SimulationProgressDTO getProgress(Integer progressId, Integer memberId);
}
