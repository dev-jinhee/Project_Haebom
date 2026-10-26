package kr.co.oti.haebom.controller.api;

import java.util.Map;

import javax.servlet.http.HttpSession;
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
import kr.co.oti.haebom.dto.EmailVerificationConfirmRequestDTO;
import kr.co.oti.haebom.dto.EmailVerificationSendRequestDTO;
import kr.co.oti.haebom.dto.MemberJoinRequestDTO;
import kr.co.oti.haebom.service.EmailVerificationService;
import kr.co.oti.haebom.service.MemberService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/members")
@Tag(name = "회원가입", description = "회원가입 관련 API")
public class MemberApiController {

	private final MemberService memberService;
	private final EmailVerificationService emailVerificationService;

	@PostMapping("/join")
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(summary = "회원가입", description = "회원 정보를 입력받아 회원가입을 처리합니다.")
	public void join(@Valid @RequestBody MemberJoinRequestDTO request, HttpSession session) {
		
		String verifiedEmail = (String) session.getAttribute("emailVerification.verifiedEmail");
	    memberService.join(request, verifiedEmail);
	    emailVerificationService.clearVerification(session);
	}
	
	@GetMapping("/id-availability")
	@Operation(summary = "아이디 중복확인", description = "아이디 사용 가능 여부를 확인합니다. 사용 가능하면 available이 true입니다.")
	public Map<String, Boolean> checkLoginIdAvailability(@RequestParam String loginId) {
		
		if (!loginId.matches("^[A-Za-z0-9]{4,16}$")) {
			throw new IllegalArgumentException("아이디는 4~16자의 영문 대소문자와 숫자로 입력해 주세요.");
		}
	
		return Map.of(
				"available",
				memberService.isLoginIdAvailable(loginId)
				);
	}
	
	@Operation(summary = "이메일 인증번호 발송", description = "회원가입에 사용할 이메일로 6자리 인증번호를 발송합니다. 이미 가입된 이메일에는 발송하지 않습니다.")
	@PostMapping("/email-verification/send")
	public Map<String, Boolean> sendEmailCode(
	        @Valid @RequestBody EmailVerificationSendRequestDTO request,
	        HttpSession session) {
	    return Map.of("sent", emailVerificationService.sendCode(request.getEmail(), session));
	}

	@Operation(summary = "이메일 인증번호 확인", description = "이메일과 인증번호를 확인합니다. 발송 후 5분 이내에 인증에 성공하면 해당 이메일을 인증 완료 상태로 저장합니다.")
	@PostMapping("/email-verification/confirm")
	public Map<String, Boolean> confirmEmailCode(
	        @Valid @RequestBody EmailVerificationConfirmRequestDTO request,
	        HttpSession session) {
	    boolean verified = emailVerificationService.verifyCode(
	            request.getEmail(), request.getCode(), session);
	    return Map.of("verified", verified);
	}
	
}
