package kr.co.oti.haebom.business.main.dto;


import java.util.List;

import kr.co.oti.haebom.business.scenario.dto.ScenarioListItemDTO;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MainPageResponseDTO {
	
	private boolean loggedIn;
	private String memberName;
	private ScenarioListItemDTO recentScenario;
	private List<PopularScenarioDTO> popularScenarios;
	
	public static MainPageResponseDTO loggedOut(List<PopularScenarioDTO> popularScenarios) {
		return new MainPageResponseDTO(false, null, null, popularScenarios);
	}
}
