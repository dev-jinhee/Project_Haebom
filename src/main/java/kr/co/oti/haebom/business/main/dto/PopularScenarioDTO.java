package kr.co.oti.haebom.business.main.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PopularScenarioDTO {
    private Integer scenarioId;
    private String scenarioTitle;
    private String description;
    private Integer estimatedMinutes;
    private String categoryName;
    private String categoryLabel;
}
