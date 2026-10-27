package kr.co.oti.haebom.controller.api;

import java.util.List;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.dto.MoveFamilyRequestDTO;
import kr.co.oti.haebom.dto.MovePreparationRequestDTO;
import kr.co.oti.haebom.dto.SimulationFamilyDTO;
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
	public SimulationFamilyDTO getApplicant(@PathVariable Integer progressId,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
		return moveSimulationService.getApplicant(progressId, memberPrincipal.getMemberId());
	}

	// 가족 정보 반환
	@Operation(summary = "가족 조회", description = "로그인 사용자의 진행 이력을 확인한 후 해당 진행 이력에 등록된 가족 정보를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "가족 정보 조회 성공")
	@GetMapping("/{progressId}/family")
	public List<SimulationFamilyDTO> getFamily(@PathVariable Integer progressId,
			@RequestParam(required = false) String moveStatus,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
		return moveSimulationService.getFamily(progressId, memberPrincipal.getMemberId(), moveStatus);
	}

	// 신청인 휴대전화번호 수정
	@Operation(summary = "전입신고 신청인 휴대전화번호 수정", description = "로그인 사용자의 진행 이력과 완료 여부를 확인한 후 신청인의 휴대전화번호를 수정합니다.")
	@ApiResponse(responseCode = "204", description = "신청인 휴대전화번호 수정 성공")
	@PatchMapping("/{progressId}/applicant/phone")
	public ResponseEntity<Void> updateApplicantPhone(@PathVariable Integer progressId,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal,
			@RequestBody String phoneNum) {
		moveSimulationService.updateApplicantPhone(progressId, memberPrincipal.getMemberId(), phoneNum);
		return ResponseEntity.noContent().build();
	}

	@Operation(summary = "전입신고 가족 이사정보 저장")
	@ApiResponse(responseCode = "204", description = "가족 이사정보 저장 성공")
	@PatchMapping("/{progressId}/family/move")
	public ResponseEntity<Void> updateFamilyMove(@PathVariable Integer progressId,
			@RequestBody MoveFamilyRequestDTO requestDTO,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

		moveSimulationService.updateFamilyMove(progressId, memberPrincipal.getMemberId(), requestDTO);

		return ResponseEntity.noContent().build();
	}

	@Operation(summary = "전입신고 4단계 가족정보 저장", description = "이사 가족의 세대주 여부, 가족관계, 전화번호를 저장합니다.")
	@ApiResponse(responseCode = "204", description = "이사 가족정보 저장 성공")
	@PatchMapping("/{progressId}/family/current")
	public ResponseEntity<Void> updateCurrentFamily(@PathVariable Integer progressId,
			@RequestBody MoveFamilyRequestDTO requestDTO,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {
		moveSimulationService.updateCurrentFamily(progressId, memberPrincipal.getMemberId(), requestDTO);

		return ResponseEntity.noContent().build();
	}
}
