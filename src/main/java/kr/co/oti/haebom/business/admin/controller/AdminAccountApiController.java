package kr.co.oti.haebom.business.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.oti.haebom.business.admin.dto.AdminAccountDTO;
import kr.co.oti.haebom.business.admin.service.AdminAccountService;
import kr.co.oti.haebom.system.security.MemberPrincipal;
import kr.co.oti.haebom.system.security.PrincipalUtils;
import lombok.RequiredArgsConstructor;

/**
 * 관리자 계정 관리 API 컨트롤러 (표준 예외 처리: ResponseStatusException 409, 403 대응)
 */
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/admin/admins")
@RequiredArgsConstructor
public class AdminAccountApiController {

	private final AdminAccountService adminAccountService;
	
	// 1. 관리자 계정 전체 목록 조회 API (GET /api/admin/admins)
	@GetMapping
	public ResponseEntity<List<AdminAccountDTO>> getAdminList() {
		List<AdminAccountDTO> admins = adminAccountService.getAdminList();
		return ResponseEntity.ok(admins);
	}
	
	// 2. 새 관리자 계정 등록 API (POST /api/admin/admins)
    @PostMapping
    public ResponseEntity<String> createAdmin(
            @AuthenticationPrincipal MemberPrincipal principal,
            @ModelAttribute AdminAccountDTO dto) {
        int currentAdminId = PrincipalUtils.requireAdminId(principal);
        adminAccountService.createAdmin(dto, currentAdminId);
        return ResponseEntity.ok("새 관리자 계정이 성공적으로 등록되었습니다.");
    }
    
    // 3. 관리자 계정 상태 변경 API (PUT /api/admin/admins/{adminId}/status)
    @PutMapping("/{adminId}/status")
    public ResponseEntity<String> updateAdminStatus(
            @PathVariable Integer adminId,
            @RequestParam("memberStatus") String memberStatus,
            @AuthenticationPrincipal MemberPrincipal principal) {
        int currentAdminId = PrincipalUtils.requireAdminId(principal);
        adminAccountService.updateAdminStatus(adminId, memberStatus, currentAdminId);
        return ResponseEntity.ok("관리자 계정 상태가 성공적으로 변경되었습니다.");
    }
}
