package kr.co.oti.haebom.service;

import kr.co.oti.haebom.domain.SimulationFamily;
import kr.co.oti.haebom.dto.MovePreparationRequestDTO;

public interface MoveSimulationService {
	// 전입신고 0단계 가족 정보 저장 및 1단계 이동
	void startMoveSimulation(Integer progressId, Integer memberId, MovePreparationRequestDTO requestdto);
	//신청인 정보 조회
	SimulationFamily getApplicant(Integer progressId, Integer memberId);
}
