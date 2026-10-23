package kr.co.oti.haebom.controller.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.oti.haebom.dto.QnaAnswerDTO;
import kr.co.oti.haebom.dto.QnaDTO;
import kr.co.oti.haebom.service.QnaService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryApiController {

	// 주방장 부르기!
	private final QnaService qnaService;

	// 1. 문의글 목록 데이터(JSON) 보내주기
	@GetMapping
	public List<QnaDTO> getInquiryList() {
		return qnaService.getQnaList();
	}

	// 2. 모달 창에서 보낸 새 문의글 DB에 등록하기!
	@PostMapping
	public ResponseEntity<String> createInquiry(@RequestBody QnaDTO qnaDTO) {
		qnaService.createQna(qnaDTO);
		return ResponseEntity.ok("문의글이 성공적으로 등록되었습니다.");
	}

	// 3. 문의글 삭제 API (delete /api/inquiries/{qnaId})
	@DeleteMapping("/{qnaId}")
	public ResponseEntity<String> deleteInquiry(@PathVariable Integer qnaId) {
		qnaService.deleteQna(qnaId);
		return ResponseEntity.ok("문의글이 삭제되었습니다.");
	}

	// 4. 문의글 수정 API (PUT /api/inquiries/{qnaId})
	@PutMapping("/{qnaId}")
	public ResponseEntity<String> updateInquiry(@PathVariable Integer qnaId, @RequestBody QnaDTO qnaDTO) {
		qnaDTO.setQnaId(qnaId);
		qnaService.updateQna(qnaDTO);
		return ResponseEntity.ok("문의글이 수정되었습니다.");
	}

	// 5. 특정 문의글의 모든 답변 목록 조회 (GET /api/inquiries/{qnaId}/answers)
	@GetMapping("/{qnaId}/answers")
	public List<QnaAnswerDTO> getInquiryAnswer(@PathVariable Integer qnaId) {
		return qnaService.getAnswersByQnaId(qnaId);
	}

	// 6. 관리자 새 답변 등록 (POST /api/inquiries/{qnaId}/answers)
	@PostMapping("/{qnaId}/answers")
	public ResponseEntity<String> registerAnswer(@PathVariable Integer qnaId, @RequestBody QnaAnswerDTO answerDTO) {
		qnaService.registerAnswer(qnaId, answerDTO);
		return ResponseEntity.ok("답변이 성공적으로 등록되었습니다.");
	}

	// 7. 관리자 문의 상태 및 분류 변경 (PUT /api/inquiries/{qnaId}/status)
	@PutMapping("/{qnaId}/status")
	public ResponseEntity<String> updateStatus(@PathVariable Integer qnaId, @RequestBody Map<String, Object> params) {
		Integer categoryId = params.get("qnaCategoryId") != null
				? Integer.valueOf(params.get("qnaCategoryId").toString())
				: null;
		String status = params.get("qnaStatus") != null ? params.get("qnaStatus").toString() : null;
		qnaService.updateInquiryStatusAndCategory(qnaId, categoryId, status);
		return ResponseEntity.ok("문의 상태가 성공적으로 변경되었습니다.");
	}

}