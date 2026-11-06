package kr.co.oti.haebom.business.inquiry.controller;

import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.business.inquiry.dto.MyPageInquiryItemDTO;
import kr.co.oti.haebom.business.inquiry.dto.MyPageProfileResponseDTO;
import kr.co.oti.haebom.business.inquiry.dto.MyPageScenarioHistoryPageDTO;
import kr.co.oti.haebom.business.inquiry.service.MyPageService;
import kr.co.oti.haebom.system.security.MemberPrincipal;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypage")
@Tag(name = "마이페이지", description = "마이페이지 문의 내역·시나리오 이력·회원정보·비밀번호 변경·탈퇴 API")
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
	
	@Operation(summary = "회원 탈퇴", description = "일반 회원의 개인정보를 비우고 탈퇴 상태로 변경한 뒤 로그아웃합니다.")
	@PostMapping("/withdraw")
	public Map<String, Boolean> withdraw(
			@AuthenticationPrincipal MemberPrincipal memberPrincipal, 
			Authentication authentication, 
			HttpServletRequest request, 
			HttpServletResponse response) {
		
		if (memberPrincipal == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}
		boolean isUser = memberPrincipal.getAuthorities().stream()
				.anyMatch(authority -> "ROLE_USER".equals(authority.getAuthority()));
		if (!isUser) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "일반 회원만 탈퇴할 수 있습니다.");
		}
		
		myPageService.withdraw(memberPrincipal.getMemberId());
		
		new SecurityContextLogoutHandler().logout(request, response, authentication);
		
		return Map.of("withdrawn", true);
	}
	
	@Operation(summary = "비밀번호 변경", description = "현재 비밀번호를 확인하고 새 비밀번호를 저장합니다.")
	@PostMapping("/password")
	public Map<String, Boolean> changePassword(
	        @AuthenticationPrincipal MemberPrincipal memberPrincipal,
	        @RequestParam String currentPassword,
	        @RequestParam String newPassword,
	        @RequestParam String passwordConfirm) {

	    if (memberPrincipal == null) {
	        throw new ResponseStatusException(
	                HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
	    }

	    myPageService.changePassword(
	            memberPrincipal.getMemberId(),
	            currentPassword,
	            newPassword,
	            passwordConfirm);

	    return Map.of("changed", true);
	}
	
	@Operation(summary = "내 문의 내역 조회", description = "로그인한 회원 본인이 작성한 삭제되지 않은 문의 목록을 조회합니다.")
	@GetMapping("/inquiries")
	public List<MyPageInquiryItemDTO> getMyInquiries(@AuthenticationPrincipal MemberPrincipal memberPrincipal) {
		
		if (memberPrincipal == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}
		
		return myPageService.getMyInquiries(memberPrincipal.getMemberId());
	}
	
	@Operation(summary = "내 시나리오 이력 조회", description = "로그인 회원의 진행 중·완료 이력을 최신순으로 조회합니다.")
	@GetMapping("/scenario-history")
	public MyPageScenarioHistoryPageDTO getScenarioHistory(
			@AuthenticationPrincipal MemberPrincipal principal,
			@RequestParam(required = false) Integer scenarioId,
			@RequestParam(defaultValue = "") String keyword,
			@RequestParam(defaultValue = "1") int page) {
		    
		if (principal == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}
		
		return myPageService.getScenarioHistory(principal.getMemberId(), scenarioId, keyword, page);
		
		}
}
