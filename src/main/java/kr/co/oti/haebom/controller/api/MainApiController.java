package kr.co.oti.haebom.controller.api;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.oti.haebom.dto.MainPageResponseDTO;
import kr.co.oti.haebom.dto.ScenarioListItemDTO;
import kr.co.oti.haebom.dto.SimulationProgressDTO;
import kr.co.oti.haebom.security.MemberPrincipal;
import kr.co.oti.haebom.service.ScenarioService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main")
public class MainApiController {
	
	private final ScenarioService scenarioService; 
	
	@GetMapping
	public MainPageResponseDTO getMainPage(@AuthenticationPrincipal MemberPrincipal principal) {
		
		if (principal == null) {
			return MainPageResponseDTO.loggedOut();
		}
		
		List<ScenarioListItemDTO> scenarioList = scenarioService.getScenarioList(principal.getMemberId());
		ScenarioListItemDTO recentScenario = null;
		LocalDateTime latestStartedAt = null;
		
		for (ScenarioListItemDTO item : scenarioList) {
			
			if (item == null) {
				continue;
			}
			
			SimulationProgressDTO progress = item.getProgress();
			if (progress == null) {
				continue;
			}
			
			if (!"IN_PROGRESS".equals(progress.getProgressStatus())) {
				continue;
			}
			
			LocalDateTime startedAt = progress.getStartedAt();
			if (startedAt == null) {
				continue;
			}
			
			if (latestStartedAt == null || startedAt.isAfter(latestStartedAt)) {
				latestStartedAt = startedAt;
				recentScenario = item;
			}
		}
		
		return new MainPageResponseDTO(true, principal.getMemberName(), recentScenario);
		
	}
}
