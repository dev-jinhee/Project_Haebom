package kr.co.oti.haebom.controller.api;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.dto.MyPageProfileResponseDTO;
import kr.co.oti.haebom.security.MemberPrincipal;
import kr.co.oti.haebom.service.MyPageService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
@Tag(name = "마이페이지", description = "마이페이지 회원정보 및 탈퇴 API")
public class MyPageApiController {

	private final MyPageService myPageService;
	
	@Operation(summary = "회원정보 조회", description = "로그인한 회원의 계정 화면에 표시할 정보를 조회합니다.")
    @GetMapping("/profile")
	public MyPageProfileResponseDTO getProfile(@AuthenticationPrincipal MemberPrincipal memberPrincipal) {
		
		if (memberPrincipal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}
		
		return myPageService.getProfile(memberPrincipal.getMemberId());
	}	
	
	@Operation(summary = "회원 탈퇴", description = "로그인한 회원의 개인정보를 비우고 탈퇴 상태로 변경한 뒤 로그아웃합니다.")
	@PostMapping("/withdraw")
	public Map<String, Boolean> withdraw(
			@AuthenticationPrincipal MemberPrincipal memberPrincipal, 
			Authentication authentication, 
			HttpServletRequest request, 
			HttpServletResponse response) {
		
		if (memberPrincipal == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}
		
		myPageService.withdraw(memberPrincipal.getMemberId());
		
		new SecurityContextLogoutHandler().logout(request, response, authentication);
		
		return Map.of("withdrawn", true);
	}
}
