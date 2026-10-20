package kr.co.oti.haebom.domain;

import lombok.Getter;

@Getter
public class ScenarioStep {
	private Integer stepId;
    private Integer scenarioId;
    private Integer stepOrder;
    private String stepTitle;
    private String stepDescription;
}
