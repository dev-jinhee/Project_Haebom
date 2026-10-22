package kr.co.oti.haebom.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminScenarioDetailStatsDTO {
	// 1. 누적 이용 현황
	private int totalStarts; // 전체 연습 시작 건수
	private int totalCompleted; // 전체 연습 완료 건수
	private double completionRate; // 누적 완료율 (%)
	private String dropoffStepTitle; // 이탈이 많은 단계 제목 (예: "2. 기본 정보" or "-")
	private double dropoffRate; // 이탈 비율 (%)
	
	// 2. 단계별 임시 저장 현황 목록
	private List<AdminScenarioStepStatsDTO> stepStats;
}
