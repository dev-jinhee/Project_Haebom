package kr.co.oti.haebom.controller.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.dto.SimulationProgressDTO;
import kr.co.oti.haebom.service.SimulationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/simulation")
@Tag(name = "시뮬레이션", description = "시뮬레이션 관련 API")
public class SimulationApiController {
	private final SimulationService simulationService;
	
	// 진행정보 조회
    @Operation(
        summary = "진행정보 조회",
        description = "시뮬레이션의 진행 정보를 조회합니다."
    )
    @ApiResponse(
        responseCode = "200",
        description = "조회 성공"
    )
	@GetMapping("/progress/{progressId}")
	public SimulationProgressDTO postScenarioStart(@PathVariable("progressId") Integer progressId) {
    	// TODO: 로그인 구현 후 실제 회원 ID 사용
	    return simulationService.getProgress(progressId, 1);
	}
}
