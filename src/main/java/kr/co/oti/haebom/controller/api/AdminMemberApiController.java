package kr.co.oti.haebom.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.oti.haebom.dto.AdminMemberDTO;
import kr.co.oti.haebom.dto.AdminMemberProgressDTO;
import kr.co.oti.haebom.service.AdminMemberService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class AdminMemberApiController {
	
	// 주방장 부르기!!
	private final AdminMemberService adminMemberService;
	
	// 1. 관리자용 전체 회원 목록 조회 API (GET / api/admin/members)
	@GetMapping
	public ResponseEntity<List<AdminMemberDTO>> getMemberList() {
		List<AdminMemberDTO> members = adminMemberService.getMemberList();
		return ResponseEntity.ok(members);
	}
	
	// 2. 관리자용 회원 계정 상태 변경 API (PUT /api/admin/members/{memberId}/status)
	@PutMapping("/{memberId}/status")
	public ResponseEntity<String> updateMemberStatus(
			@PathVariable Integer memberId, 
			@RequestParam("memberStatus") String memberStatus) {
		
		adminMemberService.updateMemberStatus(memberId, memberStatus);
		
		return ResponseEntity.ok("회원 상태가 성공적으로 변경되었습니다.");
	}
	
	// 3. 특정 회원의 시뮬레이션 연습 내역 조회 API (GET /api/admin/members/{memberId}/drafts)
	@GetMapping("/{memberId}/drafts")
	public ResponseEntity<List<AdminMemberProgressDTO>> getMemberProgressList(@PathVariable Integer memberId) {
		List<AdminMemberProgressDTO> progressList = adminMemberService.getMemberProgressList(memberId);
		return ResponseEntity.ok(progressList);
	}
}
