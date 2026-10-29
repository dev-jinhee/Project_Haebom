package kr.co.oti.haebom.business.scenario.controller;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.business.scenario.dto.AnswerSaveRequestListDTO;
import kr.co.oti.haebom.business.scenario.dto.SimulationProgressDTO;
import kr.co.oti.haebom.system.security.MemberPrincipal;
import kr.co.oti.haebom.business.scenario.service.SimulationService;
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
	public SimulationProgressDTO getSimulationProgress(@PathVariable("progressId") Integer progressId,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
		return simulationService.getProgress(progressId, memberPrincipal.getMemberId());
	}

	// 이전 단계 이동
	@Operation(summary = "이전 단계 이동", description = "입력값 저장 없이 이전 단계로 이동합니다.")
	@ApiResponse(responseCode = "204", description = "이동 성공")
	@PatchMapping("/progress/{progressId}/prevStep")
	public ResponseEntity<Void> moveToPrevStep(@PathVariable("progressId") Integer progressId,
			@RequestParam("targetStepId") Integer targetStepId,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

		Integer memberId = memberPrincipal.getMemberId();

		simulationService.moveToStep(progressId, memberId, targetStepId);

		return ResponseEntity.noContent().build();
	}

	// 다음 단계 이동
	@Operation(summary = "다음 단계 이동", description = "입력값 저장 후 다음 단계로 이동합니다.")
	@ApiResponse(responseCode = "204", description = "이동 성공")
	@PatchMapping("/progress/{progressId}/nextStep")
	public ResponseEntity<Void> moveToNextStep(@PathVariable("progressId") Integer progressId,
			@Valid @ModelAttribute AnswerSaveRequestListDTO request, @RequestParam("targetStepId") Integer targetStepId,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

		Integer memberId = memberPrincipal.getMemberId();

		simulationService.saveAndMoveToStep(progressId, memberId, targetStepId, request);

		return ResponseEntity.noContent().build();
	}

	// 시뮬레이션 완료
	@Operation(summary = "시뮬레이션 완료", description = "입력값 저장 후 시뮬레이션 완료처리합니다.")
	@ApiResponse(responseCode = "204", description = "완료 처리 성공")
	@PatchMapping("/progress/{progressId}/complete")
	public ResponseEntity<Void> completeSimulation(@PathVariable("progressId") Integer progressId,
			@Valid @ModelAttribute AnswerSaveRequestListDTO request,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

		Integer memberId = memberPrincipal.getMemberId();

		simulationService.completeSimulation(progressId, memberId, request);

		return ResponseEntity.noContent().build();
	}

	// 시뮬레이션 진행사항 삭제
	@Operation(summary = "시뮬레이션 진행사항 삭제", description = "진행사항을 논리 삭제하고 관련 입력값 및 가족 정보를 물리 삭제합니다.")
	@ApiResponse(responseCode = "204", description = "삭제 처리 성공")
	@DeleteMapping("/progress/{progressId}")
	public ResponseEntity<Void> deleteProgress(@PathVariable("progressId") Integer progressId,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
		simulationService.deleteProgress(progressId, memberPrincipal.getMemberId());
		return ResponseEntity.noContent().build();
	}

	// 시뮬레이션 진행사항 재시작
	@Operation(summary = "시뮬레이션 진행사항 재시작", description = "진행사항을 상태 변경하고 관련 입력값 및 가족 정보를 물리 삭제합니다.")
	@ApiResponse(responseCode = "200", description = "재시작 처리 성공")
	@PostMapping("/progress/{progressId}/restart")
	public Integer restartSimulation(@PathVariable("progressId") Integer progressId,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
		return simulationService.restartSimulation(progressId, memberPrincipal.getMemberId());
	}
}
