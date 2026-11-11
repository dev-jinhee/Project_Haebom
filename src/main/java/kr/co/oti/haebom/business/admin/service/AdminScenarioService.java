package kr.co.oti.haebom.business.admin.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.business.admin.dto.AdminScenarioCategoryDTO;
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
	private final MessageSource messageSource;

	// 1. 전체 시나리오 목록 조회 (messages.properties 기반 한글 카테고리 라벨 매핑)
	public List<AdminScenarioDTO> getScenarioList() {
		List<AdminScenarioDTO> list = adminScenarioMapper.selectScenarioList();

		for (AdminScenarioDTO dto : list) {
			dto.setCategoryLabel(resolveCategoryLabel(dto.getCategoryName()));
		}

		return list;
	}

	// 1-1. 전체 시나리오 카테고리 목록 조회 (category 테이블 + 한글 라벨 매핑)
	public List<AdminScenarioCategoryDTO> getCategoryList() {
		List<AdminScenarioCategoryDTO> categories = adminScenarioMapper.selectCategoryList();
		for (AdminScenarioCategoryDTO category : categories) {
			category.setCategoryLabel(resolveCategoryLabel(category.getCategoryName()));
		}
		return categories;
	}

	private String resolveCategoryLabel(String categoryName) {
		if (categoryName == null || categoryName.isBlank()) {
			return "기타";
		}
		return messageSource.getMessage(
				"category." + categoryName,
				null,
				categoryName,
				LocaleContextHolder.getLocale());
	}

	// 2. 시나리오 정보 수정
	@Transactional
	public void updateScenario(AdminScenarioDTO scenarioDTO, int currentAdminId) {
		if (currentAdminId <= 0) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "관리자 인증 정보가 유효하지 않습니다.");
		}
		if (scenarioDTO == null || scenarioDTO.getScenarioId() == null || scenarioDTO.getScenarioId() <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 시나리오 번호가 아닙니다.");
		}
		if (scenarioDTO.getScenarioTitle() == null || scenarioDTO.getScenarioTitle().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "시나리오 제목을 입력해주세요.");
		}
		if (scenarioDTO.getCategoryId() == null || scenarioDTO.getCategoryId() <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "시나리오 카테고리를 선택해주세요.");
		}
		if (adminScenarioMapper.countCategoryById(scenarioDTO.getCategoryId()) <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 시나리오 카테고리입니다.");
		}
		if (scenarioDTO.getEstimatedMinutes() == null || scenarioDTO.getEstimatedMinutes() <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "예상 소요시간은 1분 이상이어야 합니다.");
		}
		if (scenarioDTO.getIsActive() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "시나리오 운영 여부를 선택해주세요.");
		}

		scenarioDTO.setScenarioTitle(scenarioDTO.getScenarioTitle().trim());
		if (scenarioDTO.getDescription() != null) {
			scenarioDTO.setDescription(scenarioDTO.getDescription().trim());
		}

		int updatedRows = adminScenarioMapper.updateScenario(scenarioDTO);
		if (updatedRows != 1) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 시나리오입니다.");
		}
		adminDashboardService.recordActivity(currentAdminId, "SCENARIO", "UPDATE", scenarioDTO.getScenarioId());
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