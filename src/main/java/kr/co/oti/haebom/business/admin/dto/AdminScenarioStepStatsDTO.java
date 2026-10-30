package kr.co.oti.haebom.business.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminScenarioStepStatsDTO {
	private int stepId; // 시나리오 단계 고유 번호
	private int stepOrder; // 단계 순서
	private String stepTitle; // 단계 제목 (예: "0. 사전 정보 입력")
	private int saveCount; // 해당 단계 임시 저장 건수
	private double saveRate; // 전체 대비 비율 (%)
}
