package kr.co.oti.haebom.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.dto.AdminActivityDTO;
import kr.co.oti.haebom.dto.AdminDashboardDTO;
import kr.co.oti.haebom.dto.AdminTrendDTO;
import kr.co.oti.haebom.mapper.AdminDashboardMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final AdminDashboardMapper adminDashboardMapper;

    @Override
    public AdminDashboardDTO getDashboardStats() {
        // 1. 회원 통계(수, 성별, 연령대) 조회
        AdminDashboardDTO stats = adminDashboardMapper.selectMemberStats();
        if (stats == null) {
            stats = new AdminDashboardDTO();
        }

        // 2. 남녀 비율 계산 (0으로 나누기 방지)
        int totalMembers = stats.getTotalMemberCount();
        if (totalMembers > 0) {
            double maleRate = Math.round(((double) stats.getMaleCount() / totalMembers * 100.0) * 10.0) / 10.0;
            double femaleRate = Math.round(((double) stats.getFemaleCount() / totalMembers * 100.0) * 10.0) / 10.0;
            stats.setMaleRate(maleRate);
            stats.setFemaleRate(femaleRate);
        } else {
            stats.setMaleRate(0.0);
            stats.setFemaleRate(0.0);
        }

        // 3. 시뮬레이션 지표 조회 및 완료율 계산
        int monthlyStarts = adminDashboardMapper.selectMonthlyStartCount();
        int totalStarts = adminDashboardMapper.selectTotalStartCount();
        int completedStarts = adminDashboardMapper.selectCompletedCount();

        stats.setMonthlyStartCount(monthlyStarts);
        if (totalStarts > 0) {
            double completionRate = Math.round(((double) completedStarts / totalStarts * 100.0) * 10.0) / 10.0;
            stats.setCompletionRate(completionRate);
        } else {
            stats.setCompletionRate(0.0);
        }

        // 4. 답변 대기 문의 건수 조회
        int waitingInquiries = adminDashboardMapper.selectWaitingInquiryCount();
        stats.setWaitingInquiryCount(waitingInquiries);

        // 5. 이번 달 이용 상위 시나리오 조회 및 바인딩
        Map<String, Object> topScenario = adminDashboardMapper.selectTopScenarioThisMonth();
        if (topScenario != null) {
            stats.setTopScenarioTitle((String) topScenario.get("scenarioTitle"));
            stats.setTopScenarioStarts(topScenario.get("startCount") != null ? ((Number) topScenario.get("startCount")).intValue() : 0);
            stats.setTopScenarioCompletes(topScenario.get("completeCount") != null ? ((Number) topScenario.get("completeCount")).intValue() : 0);
        } else {
            stats.setTopScenarioTitle("전입신고");
            stats.setTopScenarioStarts(0);
            stats.setTopScenarioCompletes(0);
        }
        
        return stats;
    }
    
    @Override
    public AdminTrendDTO getDashboardTrend(String period, Integer scenarioId) {
        if (period == null || (!period.equals("daily") && !period.equals("yearly"))) {
            period = "monthly";
        }

        // 1. 기간별 라벨 및 날짜키(Key) 생성
        List<String> dateKeys = new ArrayList<>();
        List<String> labels = new ArrayList<>();
        String range;
        int step;

        LocalDate today = LocalDate.now();

        if ("daily".equals(period)) {
            range = "최근 7일";
            step = 10;
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            String[] dayLabels = {"7일 전", "6일 전", "5일 전", "4일 전", "3일 전", "2일 전", "오늘"};
            for (int i = 6; i >= 0; i--) {
                LocalDate d = today.minusDays(i);
                dateKeys.add(d.format(dtf));
                labels.add(dayLabels[6 - i]);
            }
        } else if ("yearly".equals(period)) {
            range = "최근 5년";
            step = 1000;
            int currentYear = today.getYear();
            for (int i = 4; i >= 0; i--) {
                int y = currentYear - i;
                dateKeys.add(String.valueOf(y));
                labels.add(y + "년");
            }
        } else { // monthly
            range = "최근 12개월";
            step = 100;
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM");
            for (int i = 11; i >= 0; i--) {
                LocalDate m = today.minusMonths(i);
                dateKeys.add(m.format(dtf));
                labels.add(m.getMonthValue() + "월");
            }
        }

        // 2. DB에서 기간별 집계 결과 조회
        List<Map<String, Object>> startList = adminDashboardMapper.selectTrendStarts(period, scenarioId);
        List<Map<String, Object>> completionList = adminDashboardMapper.selectTrendCompletions(period, scenarioId);

        Map<String, Integer> startMap = new HashMap<>();
        for (Map<String, Object> map : startList) {
            String key = String.valueOf(map.get("dateKey"));
            int cnt = ((Number) map.get("cnt")).intValue();
            startMap.put(key, cnt);
        }

        Map<String, Integer> completeMap = new HashMap<>();
        for (Map<String, Object> map : completionList) {
            String key = String.valueOf(map.get("dateKey"));
            int cnt = ((Number) map.get("cnt")).intValue();
            completeMap.put(key, cnt);
        }

        // 3. 누락된 날짜는 0으로 매핑
        List<Integer> starts = new ArrayList<>();
        List<Integer> completed = new ArrayList<>();

        for (String key : dateKeys) {
            starts.add(startMap.getOrDefault(key, 0));
            completed.add(completeMap.getOrDefault(key, 0));
        }

        return AdminTrendDTO.builder()
                .period(period)
                .range(range)
                .step(step)
                .labels(labels)
                .starts(starts)
                .completed(completed)
                .build();
    }
    // 3. 최근 운영자 활동 목록 조회 (최신 6건)
    @Override
    public List<AdminActivityDTO> getRecentActivities() {
        return adminDashboardMapper.selectRecentActivities(6);
    }
    // 4. 운영자 활동 로그 기록
    @Override
    @Transactional
    public void recordActivity(Integer adminId, String logType, String actionType, Integer targetId) {
        if (adminId == null) {
            adminId = 1; // 로그인 연동 전: 1번 관리자로 기본 지정
        }
        Map<String, Object> param = new HashMap<>();
        param.put("adminId", adminId);
        param.put("logType", logType);
        param.put("actionType", actionType);
        adminDashboardMapper.insertAdminLog(param);
        Object logIdObj = param.get("logId");
        Long logId = (logIdObj instanceof Number) ? ((Number) logIdObj).longValue() : null;
        if (logId != null && targetId != null) {
            if ("SCENARIO".equalsIgnoreCase(logType)) {
                adminDashboardMapper.insertAdminLogScenario(logId, targetId);
            } else if ("MEMBER".equalsIgnoreCase(logType)) {
                adminDashboardMapper.insertAdminLogMember(logId, targetId);
            } else if ("QNA".equalsIgnoreCase(logType)) {
                adminDashboardMapper.insertAdminLogQna(logId, targetId);
            }
        }
    }
}