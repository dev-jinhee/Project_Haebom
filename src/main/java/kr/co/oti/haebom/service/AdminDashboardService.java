package kr.co.oti.haebom.service;

import java.util.List;

import kr.co.oti.haebom.dto.AdminActivityDTO;
import kr.co.oti.haebom.dto.AdminDashboardDTO;
import kr.co.oti.haebom.dto.AdminTrendDTO;

public interface AdminDashboardService {
	
	// 1. 대시보드 종합 통계 데이터 조회 및 계산
	AdminDashboardDTO getDashboardStats();

	// 2. 전체 연습 추이 데이터 조회
	AdminTrendDTO getDashboardTrend(String period, Integer scenarioId);
	
	// 3. 최근 운영자 활동 목록 조회
	List<AdminActivityDTO> getRecentActivities();
	
	// 4. 운영자 활동 로그 기록
	void recordActivity(Integer adminId, String logType, String actionType, Integer targetId);
}
