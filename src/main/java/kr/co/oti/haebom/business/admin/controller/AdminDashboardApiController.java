package kr.co.oti.haebom.business.admin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.business.admin.dto.AdminActivityDTO;
import kr.co.oti.haebom.business.admin.dto.AdminDashboardDTO;
import kr.co.oti.haebom.business.admin.dto.AdminTrendDTO;
import kr.co.oti.haebom.business.admin.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "관리자 대시보드", description = "관리자 대시보드 통계 API")
public class AdminDashboardApiController {

    // 주방장 나와주세요~!
    private final AdminDashboardService adminDashboardService;

    // 1. 대시보드 종합 통계 데이터 조회 (GET /api/admin/dashboard/stats)
    @Operation(summary = "대시보드 종합 통계 조회", description = "가입 회원, 연습 통계, 답변 대기 문의, 성별 및 연령대 지표를 반환합니다.")
    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardDTO> getDashboardStats() {
        AdminDashboardDTO stats = adminDashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
    
    // 2. 연습 추이 데이터 조회 (GET /api/admin/dashboard/trend)
    @Operation(summary = "연습 추이 데이터 조회", description = "일별/월별/연도별 및 시나리오별 연습 시작/완료 건수를 조회합니다.")
    @GetMapping("/trend")
    public ResponseEntity<AdminTrendDTO> getDashboardTrend(
            @RequestParam(value = "period", defaultValue = "monthly") String period,
            @RequestParam(value = "scenarioId", required = false) Integer scenarioId) {
        AdminTrendDTO trend = adminDashboardService.getDashboardTrend(period, scenarioId);
        return ResponseEntity.ok(trend);
    }
    
    // 3. 최근 운영자 활동 내역 조회 (GET /api/admin/dashboard/activities)
    @Operation(summary = "최근 운영자 활동 내역 조회", description = "최근 10건의 관리자 활동 로그를 조회합니다.")
    @GetMapping("/activities")
    public ResponseEntity<List<AdminActivityDTO>> getRecentActivities() {
        List<AdminActivityDTO> activities = adminDashboardService.getRecentActivities();
        return ResponseEntity.ok(activities);
    }
}