package kr.co.oti.haebom.business.main.dto;


import kr.co.oti.haebom.business.scenario.dto.ScenarioListItemDTO;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MainPageResponseDTO {
	
	private boolean loggedIn;
	private String memberName;
	private ScenarioListItemDTO recentScenario;
	
	public static MainPageResponseDTO loggedOut() {
		return new MainPageResponseDTO(false, null, null);
	}
}
