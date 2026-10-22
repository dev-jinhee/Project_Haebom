package kr.co.oti.haebom.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
	@Operation(summary = "진행정보 조회", description = "시뮬레이션의 진행 정보를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "조회 성공")
	@GetMapping("/progress/{progressId}")
	public SimulationProgressDTO getSimulationProgress(@PathVariable("progressId") Integer progressId) {
		// TODO: 로그인 구현 후 실제 회원 ID 사용
		return simulationService.getProgress(progressId, 1);
	}

	// 이전 단계 이동
	@Operation(summary = "이전 단계 이동", description = "입력값 저장 없이 이전 단계로 이동합니다.")
	@ApiResponse(responseCode = "204", description = "이동 성공")
	@PatchMapping("/progress/{progressId}/prevStep")
	public ResponseEntity<Void> moveToPrevStep(@PathVariable("progressId") Integer progressId,
			@RequestParam("targetStepId") Integer targetStepId) {

		// TODO : Spring Security 로그인 회원 정보 연동
		Integer memberId = 1;

		simulationService.moveToStep(progressId, memberId, targetStepId);

		return ResponseEntity.noContent().build();
	}

	// 다음 단계 이동
	@Operation(summary = "다음 단계 이동", description = "입력값 저장 후 다음 단계로 이동합니다.")
	@ApiResponse(responseCode = "204", description = "이동 성공")
	@PatchMapping("/progress/{progressId}/nextStep")
	public ResponseEntity<Void> moveToNextStep(@PathVariable("progressId") Integer progressId,
			@RequestParam("targetStepId") Integer targetStepId) {

		// TODO : Spring Security 로그인 회원 정보 연동
		Integer memberId = 1;

		simulationService.saveAndMoveToStep(progressId, memberId, targetStepId);

		return ResponseEntity.noContent().build();
	}

	// 시뮬레이션 완료
	@Operation(summary = "시뮬레이션 완료", description = "입력값 저장 후 시뮬레이션 완료처리합니다.")
	@ApiResponse(responseCode = "204", description = "완료 처리 성공")
	@PatchMapping("/progress/{progressId}/complete")
	public ResponseEntity<Void> completeSimulation(@PathVariable("progressId") Integer progressId) {

		// TODO : Spring Security 로그인 회원 정보 연동
		Integer memberId = 1;

		simulationService.completeSimulation(progressId, memberId);

		return ResponseEntity.noContent().build();
	}
}
