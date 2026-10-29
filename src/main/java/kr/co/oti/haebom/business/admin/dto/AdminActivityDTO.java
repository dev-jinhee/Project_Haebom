package kr.co.oti.haebom.business.admin.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminActivityDTO {
	
	private Long logId; // 로그 고유 번호
	private String logType; // "member", "scenario", "inquiry"
	private String actionType; // "UPDATE", "ANSWER", "STATUS_CHANGE" 등
	private String title; // 화면 표시 제목 (예: "전입신고 시나리오를 수정했습니다.")
	private String operatorId; // 관리자 ID (예: "admin")
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime createAt; // 작업 일시
}
