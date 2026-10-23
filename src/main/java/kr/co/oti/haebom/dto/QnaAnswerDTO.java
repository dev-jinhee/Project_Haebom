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
public class QnaAnswerDTO {
	
	private Integer qnaAnswerId; // 답변 고유 번호(PK)
	private Integer qnaId; // 문의 고유 번호(FK)
	private Integer memberId; // 관리자 회원 번호(FK)
	private String qnaAnswerContent; //답변 내용
	private LocalDateTime qnaAnswerCreatedAt; // 답변 작성 일시
	
	// 회원 표시용 (JOIN)
	private String responderLoginId; // 답변 작성 관리자 Id(예 : admin)
	private String responderName; // 답변 작성 관리자 이름(예 : 관리자1)
}
