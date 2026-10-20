package kr.co.oti.haebom.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
	public ResponseEntity<String> createInquiry(@RequestBody QnaDTO qnaDTO){
		qnaService.createQna(qnaDTO);
		return ResponseEntity.ok("문의글이 성공적으로 등록되었습니다.");
	}
	
	// 3. 문의글 삭제 API (delete /api/inquiries/{qnaId})
	@DeleteMapping("/{qnaId}")
	public ResponseEntity<String> deleteInquiry(@PathVariable Integer qnaId){
		qnaService.deleteQna(qnaId);
		return ResponseEntity.ok("문의글이 삭제되었습니다.");
	}
	
	// 4. 문의글 수정 API (PUT /api/inquiries/{qnaId})
	@PutMapping("/{qnaId}")
	public ResponseEntity<String> updateInquiry(@PathVariable Integer qnaId, @RequestBody QnaDTO qnaDTO){
		qnaDTO.setQnaId(qnaId);
		qnaService.updateQna(qnaDTO);
		return ResponseEntity.ok("문의글이 수정되었습니다.");
	}
}
