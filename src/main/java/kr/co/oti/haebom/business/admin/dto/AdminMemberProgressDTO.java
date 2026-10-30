package kr.co.oti.haebom.business.admin.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AdminMemberProgressDTO {
	private Integer progressId;
	private Integer memberId;
	private Integer scenarioId;
	private String scenarioTitle;
	private Integer stepId;
	private String stepTitle;
	private Integer progressRate;
	private String progressStatus;
	private LocalDateTime startedAt;
	private LocalDateTime lastSavedAt;
	private LocalDateTime completedAt;
	private LocalDateTime expireDate;
}
