package kr.co.oti.haebom.business.scenario.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
public class SimulationProgressDTO {
	private Integer progressId;
	// 나중에 관리자 페이지를 위하여 생성
	private Integer memberId;
	private Integer scenarioId;
	private Integer stepId;
	private String progressStatus;
	// messages.properties에서 조회한 한글 표시명
	@Setter
	private String progressStatusLabel;

	private LocalDateTime startedAt;
	private LocalDateTime lastSavedAt;
	private LocalDateTime completedAt;

	// JOIN을 통해 가져올 정보
	private Integer stepOrder;
}