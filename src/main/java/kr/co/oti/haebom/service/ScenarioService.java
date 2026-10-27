package kr.co.oti.haebom.service;

import java.util.List;

import kr.co.oti.haebom.dto.ScenarioDTO;
import kr.co.oti.haebom.dto.ScenarioListItemDTO;
import kr.co.oti.haebom.dto.ScenarioStepDTO;

public interface ScenarioService {
	 // 공개 시나리오 목록 + 회원별 최신 진행 이력 조회
    List<ScenarioListItemDTO> getScenarioList(Integer memberId);
    
    //시나리오 전체 단계 조회
    List<ScenarioStepDTO> getScenarioStep(Integer scenarioId);
    
    //시나리오 단일 상세 조회
    ScenarioDTO getScenarioById(Integer scenarioId);
}
