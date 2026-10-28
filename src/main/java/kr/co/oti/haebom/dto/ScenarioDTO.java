package kr.co.oti.haebom.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
public class ScenarioDTO {
	private Integer scenarioId;
	private String scenarioCode;
	private String scenarioTitle;
	private String description;
	private Integer estimatedMinutes;

	private String categoryName;

	// messages.properties에서 조회한 한글 표시명
	@Setter
	private String categoryLabel;
	// messages.properties에서 조회한 시뮬레이션 안내 문구
	@Setter
	private String simulationGuide;

	// MySQL의 COUNT() 함수가 BIGINT 타입의 값을 반환함으로 Long타입으로 선언
	private Long stepCount;
}
