package kr.co.oti.haebom.controller.api;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.dto.AnswerResponseDTO;
import kr.co.oti.haebom.security.MemberPrincipal;
import kr.co.oti.haebom.service.SimulationAnswerService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/simulation/answers")
@Tag(name = "시뮬레이션 답변", description = "시뮬레이션 입력값 저장 및 조회 API")

public class SimulationAnswerApiController {
	private final SimulationAnswerService answerService;

	@GetMapping("/{progressId}/{stepId}")
	public List<AnswerResponseDTO> getAnswer(@PathVariable Integer progressId,
			@PathVariable Integer stepId,
			@Parameter(hidden = true) @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

		// Service 호출
		List<AnswerResponseDTO> answers = answerService.getAnswersByStep(progressId, stepId, memberPrincipal.getMemberId());
		return answers;
	}
}
