package kr.co.oti.haebom.controller.api;

import java.util.Map;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.dto.MemberJoinRequestDTO;
import kr.co.oti.haebom.service.MemberService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/members")
@Tag(name = "회원가입", description = "회원가입 관련 API")
public class MemberApiController {

	private final MemberService memberService;

	@PostMapping("/join")
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(
		    summary = "회원가입",
		    description = "회원 정보를 입력받아 회원가입을 처리합니다."
		)
	public void join(@Valid @RequestBody MemberJoinRequestDTO request) {
		memberService.join(request);
	}
	
	@Operation(
			summary = "아이디 중복확인",
			description = "아이디 사용 가능 여부를 확인합니다. 사용 가능하면 available이 true입니다."
	)
	@GetMapping("/id-availability")
	public Map<String, Boolean> checkLoginIdAvailability(@RequestParam String loginId) {
		
		if (!loginId.matches("^[A-Za-z0-9]{4,16}$")) {
			throw new IllegalArgumentException("아이디는 4~16자의 영문 대소문자와 숫자로 입력해 주세요.");
		}
	
		return Map.of(
				"available",
				memberService.isLoginIdAvailable(loginId)
				);
	}
}
