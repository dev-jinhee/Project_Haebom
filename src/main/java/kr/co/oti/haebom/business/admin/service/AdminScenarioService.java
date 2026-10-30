package kr.co.oti.haebom.business.admin.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.business.admin.dto.AdminScenarioDTO;
import kr.co.oti.haebom.business.admin.dto.AdminScenarioDetailStatsDTO;
import kr.co.oti.haebom.business.admin.dto.AdminScenarioStepStatsDTO;
import kr.co.oti.haebom.business.admin.mapper.AdminScenarioMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminScenarioService {

	private final AdminScenarioMapper adminScenarioMapper;
	private final AdminDashboardService adminDashboardService;

	// 1. 전체 시나리오 목록 조회 (한글 카테고리 라벨 매핑)
	public List<AdminScenarioDTO> getScenarioList() {
		List<AdminScenarioDTO> list = adminScenarioMapper.selectScenarioList();

		for (AdminScenarioDTO dto : list) {
			if ("HOUSING".equals(dto.getCategoryName())) {
				dto.setCategoryLabel("주거·이사");
			} else if ("IDENTITY".equals(dto.getCategoryName())) {
				dto.setCategoryLabel("신분증·주민등록");
			} else {
				dto.setCategoryLabel(dto.getCategoryName());
			}
		}

		return list;
	}

	// 2. 시나리오 정보 수정
	@Transactional
	public void updateScenario(AdminScenarioDTO scenarioDTO) {
		adminScenarioMapper.updateScenario(scenarioDTO);
		adminDashboardService.recordActivity(1, "SCENARIO", "UPDATE", scenarioDTO.getScenarioId());
	}

	// 3. 특정 시나리오의 상세 통계(임시저장 단계별 비율 + 누적 이용 지표)조회
    public AdminScenarioDetailStatsDTO getScenarioDetailStats(Integer scenarioId) {
        // 1) 전체 시작/완료 건수 조회
        Map<String, Object> counts = adminScenarioMapper.selectScenarioProgressCounts(scenarioId);
        int totalStarts = 0;
        int totalCompleted = 0;
        if (counts != null) {
            totalStarts = counts.get("totalStarts") != null ? ((Number) counts.get("totalStarts")).intValue() : 0;
            totalCompleted = counts.get("totalCompleted") != null ? ((Number) counts.get("totalCompleted")).intValue() : 0;
        }
        double completionRate = 0.0;
        if (totalStarts > 0) {
            completionRate = Math.round(((double) totalCompleted / totalStarts * 100.0) * 10.0) / 10.0;
        }
        // 2) 단계별 임시 저장 건수 조회
        List<AdminScenarioStepStatsDTO> stepStats = adminScenarioMapper.selectScenarioStepStats(scenarioId);
        if (stepStats == null) {
            stepStats = new ArrayList<>();
        }
        // 전체 임시 저장 건수 합계
        int totalDrafts = 0;
        for (AdminScenarioStepStatsDTO step : stepStats) {
            totalDrafts += step.getSaveCount();
        }
        // 각 단계별 비율(%) 계산 및 최대 이탈 단계 찾기
        String dropoffStepTitle = "—";
        int maxDropoffCount = 0;
        for (AdminScenarioStepStatsDTO step : stepStats) {
            if (totalDrafts > 0) {
                double rate = Math.round(((double) step.getSaveCount() / totalDrafts * 100.0) * 10.0) / 10.0;
                step.setSaveRate(rate);
            } else {
                step.setSaveRate(0.0);
            }
            if (step.getSaveCount() > maxDropoffCount) {
                maxDropoffCount = step.getSaveCount();
                dropoffStepTitle = step.getStepTitle();
            }
        }
        double dropoffRate = 0.0;
        if (totalDrafts > 0 && maxDropoffCount > 0) {
            dropoffRate = Math.round(((double) maxDropoffCount / totalDrafts * 100.0) * 10.0) / 10.0;
        }
        return AdminScenarioDetailStatsDTO.builder()
                .totalStarts(totalStarts)
                .totalCompleted(totalCompleted)
                .completionRate(completionRate)
                .dropoffStepTitle(dropoffStepTitle)
                .dropoffRate(dropoffRate)
                .stepStats(stepStats)
                .build();
    }
}