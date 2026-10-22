package kr.co.oti.haebom.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QnaDTO {
	
	private Integer qnaId; //문의 번호 (PK)
	private Integer memberId; //작성자 회원 번호 (FK)
	private Integer qnaCategoryId; //문의 카테고리 번호 (FK)
	private String qnaTitle; //문의 제목
	private String qnaContent; //문의 내용
	private String qnaStatus; //답변 상태
	private Integer isDeleted; //삭제 여부
	private LocalDateTime qnaCreatedAt; //작성일
	private LocalDateTime qnaUpdatedAt; //수정일

	// 화면 표시(JOIN)용 추가 컬럼
	private String qnaCategoryName; // 카테고리 한글 이름 (예 : 시뮬레이션 문의)
	private String memberName; // 작성자 이름
	
	// 관리자 답변(qna_answer) 확인용
	private String qnaAnswerContent; // 관리자 답변 내용
	private LocalDateTime qnaAnswerCreatedAt; // 관리자 답변 등록일시

}
