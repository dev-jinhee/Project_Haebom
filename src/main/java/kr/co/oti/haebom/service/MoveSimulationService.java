package kr.co.oti.haebom.service;

import java.util.List;

import kr.co.oti.haebom.domain.SimulationFamily;
import kr.co.oti.haebom.dto.MoveFamilyRequestDTO;
import kr.co.oti.haebom.dto.MovePreparationRequestDTO;

public interface MoveSimulationService {
	// 전입신고 0단계 가족 정보 저장 및 1단계 이동
	void startMoveSimulation(Integer progressId, Integer memberId, MovePreparationRequestDTO requestdto);

	// 신청인 정보 조회
	SimulationFamily getApplicant(Integer progressId, Integer memberId);

	// 신청이 전화번호 수정
	void updateApplicantPhone(Integer progressId, Integer memberId, String phoneNum);

	// 가족 정보 조회
	List<SimulationFamily> getFamily(Integer progressId, Integer memberId);
	
	//전입신고 가족 정보 변경- 이사가는 가족정보 및 새 세대주 정보 변경
	void updateFamilyMove(Integer progressId, Integer memberId, MoveFamilyRequestDTO requestDTO);
}
