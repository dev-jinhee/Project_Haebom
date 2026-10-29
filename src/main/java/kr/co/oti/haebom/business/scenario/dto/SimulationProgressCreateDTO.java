package kr.co.oti.haebom.business.scenario.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter	
@RequiredArgsConstructor
public class SimulationProgressCreateDTO {
	@Setter
    private Integer progressId; // INSERT 후 생성되는 값

    private final Integer memberId;
    private final Integer scenarioId;
    private final Integer stepId;
}
