package kr.co.oti.haebom.business.inquiry.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.oti.haebom.business.inquiry.dto.QnaAnswerDTO;
import kr.co.oti.haebom.business.inquiry.dto.QnaDTO;
import kr.co.oti.haebom.system.security.MemberPrincipal;
import kr.co.oti.haebom.business.inquiry.service.QnaService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryApiController {

	// 주방장 부르기!
	private final QnaService qnaService;

	// 1. 문의글 목록 데이터(JSON) 보내주기
	@GetMapping
	public List<QnaDTO> getInquiryList(@AuthenticationPrincipal MemberPrincipal memberPrincipal) {
		List<QnaDTO> list = qnaService.getQnaList();
		
		Integer currentMemberId = memberPrincipal != null ? memberPrincipal.getMemberId() : null;
		boolean isAdmin = memberPrincipal != null && memberPrincipal.getAuthorities() != null && memberPrincipal.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
		
		// 비밀글 마스킹 보안 처리!
		for (QnaDTO item : list) {
			if (Boolean.TRUE.equals(item.getIsSecret())) {
				boolean isOwner = currentMemberId != null && currentMemberId.equals(item.getMemberId());
				if (!isOwner && !isAdmin) {
					// 작성자 본인도 아니고 관리자도 아니면 제목/내용 마스킹
					item.setQnaTitle("비밀글입니다");
					item.setQnaContent("비밀글은 작성자와 관리자만 열람할 수 있습니다.");
					item.setQnaAnswerContent(null);
				}
			}
		}
		return list;
	}

	// 2. 모달 창에서 보낸 새 문의글 DB에 등록하기!
	@PostMapping
	public ResponseEntity<String> createInquiry(
			@AuthenticationPrincipal MemberPrincipal memberPrincipal, 
			QnaDTO qnaDTO) {
		
		// 비로그인 유저의 직접 API 요청 차단 (401 에러 반환)
		if (memberPrincipal == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body("로그인이 필요한 서비스입니다.");
		}
		qnaDTO.setMemberId(memberPrincipal.getMemberId()); // 로그인 회원 번호 세팅!
		qnaService.createQna(qnaDTO);
		return ResponseEntity.ok("문의글이 성공적으로 등록되었습니다.");
	}

	// 3. 문의글 삭제 API (delete /api/inquiries/{qnaId})
	@DeleteMapping("/{qnaId}")
	public ResponseEntity<String> deleteInquiry(@PathVariable("qnaId") Integer qnaId) {
		qnaService.deleteQna(qnaId);
		return ResponseEntity.ok("문의글이 삭제되었습니다.");
	}

	// 4. 문의글 수정 API (PUT /api/inquiries/{qnaId})
	@PutMapping("/{qnaId}")
	public ResponseEntity<String> updateInquiry(@PathVariable("qnaId") Integer qnaId, QnaDTO qnaDTO) {
		qnaDTO.setQnaId(qnaId);
		qnaService.updateQna(qnaDTO);
		return ResponseEntity.ok("문의글이 수정되었습니다.");
	}

	// 5. 특정 문의글의 모든 답변 목록 조회 (GET /api/inquiries/{qnaId}/answers)
	@GetMapping("/{qnaId}/answers")
	public List<QnaAnswerDTO> getInquiryAnswer(@PathVariable("qnaId") Integer qnaId) {
		return qnaService.getAnswersByQnaId(qnaId);
	}

	// 6. 관리자 새 답변 등록 (POST /api/inquiries/{qnaId}/answers)
	@PostMapping("/{qnaId}/answers")
	public ResponseEntity<String> registerAnswer(@PathVariable("qnaId") Integer qnaId, QnaAnswerDTO answerDTO) {
		qnaService.registerAnswer(qnaId, answerDTO);
		return ResponseEntity.ok("답변이 성공적으로 등록되었습니다.");
	}

	// 7. 관리자 문의 상태 및 분류 변경 (PUT /api/inquiries/{qnaId}/status)
	@PutMapping("/{qnaId}/status")
	public ResponseEntity<String> updateStatus(
			@PathVariable("qnaId") Integer qnaId, 
			@RequestParam(value = "qnaCategoryId", required = false) Integer categoryId, 
			@RequestParam(value = "qnaStatus", required = false) String status) {	
		qnaService.updateInquiryStatusAndCategory(qnaId, categoryId, status);
		return ResponseEntity.ok("문의 상태가 성공적으로 변경되었습니다.");
	}

}