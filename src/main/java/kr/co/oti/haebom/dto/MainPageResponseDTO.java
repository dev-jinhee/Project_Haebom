package kr.co.oti.haebom.dto;

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
