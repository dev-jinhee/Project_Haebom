package kr.co.oti.haebom.business.scenario.dto;

import lombok.Data;

@Data
public class ScenarioListItemDTO {
	// 시나리오 기본 정보
    private ScenarioDTO scenario;

    // 회원 진행 정보 (이력이 없으면 null)
    private SimulationProgressDTO progress;
}
