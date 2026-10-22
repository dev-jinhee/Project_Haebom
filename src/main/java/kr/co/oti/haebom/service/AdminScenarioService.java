package kr.co.oti.haebom.service;

import java.util.List;

import kr.co.oti.haebom.dto.AdminScenarioDTO;
import kr.co.oti.haebom.dto.AdminScenarioDetailStatsDTO;

public interface AdminScenarioService {

	// 1. 관리자용 전체 시나리오 목록 조회
	List<AdminScenarioDTO> getScenarioList();
	
	// 2. 시나리오 정보 및 운영 상태 수정
	void updateScenario(AdminScenarioDTO scenarioDTO);
	
	// 3. 특정 시나리오의 상세 통계(임시저장 단계별 비율 + 누적 이용 지표) 조회
	AdminScenarioDetailStatsDTO getScenarioDetailStats(Integer scenarioId);
}
