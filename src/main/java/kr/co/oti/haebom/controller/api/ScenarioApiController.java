package kr.co.oti.haebom.controller.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.oti.haebom.dto.ScenarioListItemDTO;
import kr.co.oti.haebom.service.ScenarioService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/scenario")
public class ScenarioApiController {
	private final ScenarioService scenarioService;
	
	@GetMapping
	public List<ScenarioListItemDTO> getScenarioList() {
	    // TODO: 로그인 구현 후 실제 회원 ID 사용
	    return scenarioService.getScenarioList(1);
	}
}
