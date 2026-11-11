package kr.co.oti.haebom.business.main.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.business.main.dto.MainPageResponseDTO;
import kr.co.oti.haebom.business.main.dto.PopularScenarioDTO;
import kr.co.oti.haebom.business.main.service.PopularScenarioService;
import kr.co.oti.haebom.business.scenario.dto.ScenarioListItemDTO;
import kr.co.oti.haebom.business.scenario.dto.SimulationProgressDTO;
import kr.co.oti.haebom.system.security.MemberPrincipal;
import kr.co.oti.haebom.business.scenario.service.ScenarioService;
import lombok.RequiredArgsConstructor;

@Tag(name = "메인페이지", description = "메인 화면 정보 조회 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main")
public class MainApiController {
	
	private final ScenarioService scenarioService;
	private final PopularScenarioService popularScenarioService;
	
	@Operation(summary = "메인페이지 정보 조회", description = "인기 시나리오 목록을 반환하고, 로그인한 경우 회원 이름과 최근 진행 중인 시나리오도 함께 반환합니다.")
	@GetMapping
	public MainPageResponseDTO getMainPage(@AuthenticationPrincipal MemberPrincipal principal) {
		
		List<PopularScenarioDTO> popularScenarios =
		        popularScenarioService.getPopularScenarios();
		
		if (principal == null) {
			return MainPageResponseDTO.loggedOut(popularScenarios);
		}
		
		List<ScenarioListItemDTO> scenarioList = scenarioService.getScenarioList(principal.getMemberId());
		ScenarioListItemDTO recentScenario = null;
		LocalDateTime latestActivityAt = null;
		
		for (ScenarioListItemDTO item : scenarioList) {
		    if (item == null) {
		        continue;
		    }

		    SimulationProgressDTO progress = item.getProgress();
		    if (progress == null
		            || !"IN_PROGRESS".equals(progress.getProgressStatus())) {
		        continue;
		    }

		    LocalDateTime activityAt = progress.getLastSavedAt();
		    if (activityAt == null) {
		        activityAt = progress.getStartedAt();
		    }
		    if (activityAt == null) {
		        continue;
		    }

		    if (latestActivityAt == null || activityAt.isAfter(latestActivityAt)) {
		        latestActivityAt = activityAt;
		        recentScenario = item;
		    }
		}
		
		return new MainPageResponseDTO(true, principal.getMemberName(), recentScenario, popularScenarios);
		
	}
}
