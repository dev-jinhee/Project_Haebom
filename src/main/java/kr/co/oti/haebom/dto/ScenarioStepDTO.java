package kr.co.oti.haebom.dto;

import lombok.Getter;

@Getter
public class ScenarioStepDTO {
	private Integer stepId;
    private Integer scenarioId;
    private Integer stepOrder;
    private String stepTitle;
    private String stepDescription;
}
