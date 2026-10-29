package kr.co.oti.haebom.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyPageCompletedScenarioDTO {

	private Integer progressId;
	private Integer scenarioId;
    private String scenarioTitle;
    private String categoryName;
    private String categoryLabel;
    private LocalDateTime completedAt;
}
