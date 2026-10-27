package kr.co.oti.haebom.controller.api;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.dto.ScenarioDTO;
import kr.co.oti.haebom.dto.ScenarioListItemDTO;
import kr.co.oti.haebom.dto.ScenarioStepDTO;
import kr.co.oti.haebom.security.MemberPrincipal;
import kr.co.oti.haebom.service.ScenarioService;
import kr.co.oti.haebom.service.SimulationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/scenario")
@Tag(name = "시나리오", description = "시나리오 관련 API")
public class ScenarioApiController {
	private final ScenarioService scenarioService;
	private final SimulationService simulationService;
	
	// 공개 시나리오 목록 조회
    @Operation(
        summary = "공개 시나리오 목록 조회",
        description = "공개된 시나리오 목록과 회원별 최신 진행 이력을 조회합니다."
    )
    @ApiResponse(
        responseCode = "200",
        description = "조회 성공"
    )
	@GetMapping
	public List<ScenarioListItemDTO> getScenarioList(@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
	    return scenarioService.getScenarioList(memberPrincipal.getMemberId());
	}
    
    // 선택 시나리오 상세 조회
    @Operation(
        summary = "선택 시나리오 상세 조회",
        description = "선택한 시나리오의 상세 정보를 조회합니다."
    )
    @ApiResponse(
        responseCode = "200",
        description = "조회 성공"
    )
	@GetMapping("/{scenarioId}")
	public ScenarioDTO getScenarioById(@PathVariable("scenarioId") Integer scenarioId) {
	    return scenarioService.getScenarioById(scenarioId);
	}
    
    // 선택 시나리오 단계 조회
    @Operation(
        summary = "선택 시나리오 단계 조회",
        description = "선택한 시나리오의 전체 단계를 순서대로 조회합니다."
    )
    @ApiResponse(
        responseCode = "200",
        description = "조회 성공"
    )
	@GetMapping("/{scenarioId}/steps")
	public List<ScenarioStepDTO> getScenarioSteps(@PathVariable("scenarioId") Integer scenarioId) {
	    return scenarioService.getScenarioStep(scenarioId);
	}
    // 새 진행 이력 생성
    @Operation(
        summary = "새 진행 이력 생성",
        description = "시뮬레이션의 새 진행 이력을 생성합니다."
    )
    @ApiResponse(
        responseCode = "200",
        description = "생성 성공"
    )
	@PostMapping("/{scenarioId}/start")
	public Integer postScenarioStart(@PathVariable("scenarioId") Integer scenarioId, @Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
	    return simulationService.startSimulation(scenarioId, memberPrincipal.getMemberId());
	}
}
