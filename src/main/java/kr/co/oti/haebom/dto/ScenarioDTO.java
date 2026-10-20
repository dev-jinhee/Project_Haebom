package kr.co.oti.haebom.dto;

import lombok.Data;

@Data
public class ScenarioDTO {
	private Integer scenarioId;
	private String scenario_title;
	private String description;
	private Integer estimatedMinutes;
	private Boolean isActive;
	
	private String categoryName;
	//MySQL의 COUNT() 함수가 BIGINT 타입의 값을 반환함으로 Long타입으로 선언
	private Long stepCount;
}
