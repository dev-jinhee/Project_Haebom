package kr.co.oti.haebom.controller.api;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.domain.SimulationFamily;
import kr.co.oti.haebom.dto.MovePreparationRequestDTO;
import kr.co.oti.haebom.security.MemberPrincipal;
import kr.co.oti.haebom.service.MoveSimulationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/simulation/move")
@Tag(name = "전입신고 시뮬레이션", description = "전입신고 시뮬레이션 관련 API")
public class MoveSimulationApiController {
	private final MoveSimulationService moveSimulationService;

	// 사전정보 생성 및 1단계 이동
	@Operation(summary = "사전정보 생성 및 1단계 이동", description = "전입신고 사전정보를 저장하고 기존 진행 이력을 1단계로 변경합니다.")
	@ApiResponse(responseCode = "204", description = "사전정보 저장 및 단계 이동 성공")
	@PostMapping("/{progressId}/start")
	public ResponseEntity<Void> startMoveSimulation(@PathVariable Integer progressId,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal,
			@Valid @RequestBody MovePreparationRequestDTO requestdto) {

		moveSimulationService.startMoveSimulation(progressId, memberPrincipal.getMemberId(), requestdto);

		return ResponseEntity.noContent().build();
	}

	// 신청인 정보 반환
	@Operation(summary = "전입신고 신청인 정보 조회", description = "로그인 사용자의 진행 이력을 확인한 후 해당 진행 이력에 등록된 신청인 정보를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "신청인 정보 조회 성공")
	@GetMapping("/{progressId}/applicant")
	public SimulationFamily getApplicant(@PathVariable Integer progressId,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
		return moveSimulationService.getApplicant(progressId, memberPrincipal.getMemberId());
	}
}
