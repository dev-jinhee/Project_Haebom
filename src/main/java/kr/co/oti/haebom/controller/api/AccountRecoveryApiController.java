package kr.co.oti.haebom.controller.api;

import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.dto.EmailVerificationConfirmRequestDTO;
import kr.co.oti.haebom.dto.FindIdSendRequestDTO;
import kr.co.oti.haebom.service.AccountRecoveryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members/recovery")
@Tag(name = "계정 찾기", description = "이메일 인증을 통한 아이디 찾기 API")
public class AccountRecoveryApiController {

	private final AccountRecoveryService recoveryService;
	
	@PostMapping("/find-id/send-code")
	@Operation(summary = "아이디 찾기 인증번호 발송")
	public Map<String, Boolean> sendFindIdCode(@Valid @RequestBody FindIdSendRequestDTO request, HttpSession session) {
		return Map.of("sent", recoveryService.sendFindIdCode(request.getMemberName(), request.getEmail(), session));
	}
	
	
	@PostMapping("/find-id/confirm")
	@Operation(summary = "아이디 찾기 인증번호 확인")
	public Map<String, Object> confirmFindId(@Valid @RequestBody EmailVerificationConfirmRequestDTO request, HttpSession session) {
		String loginId = recoveryService.verifyFindIdCode(request.getEmail(), request.getCode(), session);
		
		if (loginId == null) return Map.of("verified", false);
		
		return Map.of("verified", true, "loginId", loginId);
	}
}
