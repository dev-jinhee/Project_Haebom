package kr.co.oti.haebom.business.admin.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.business.admin.dto.AdminActivityDTO;
import kr.co.oti.haebom.business.admin.dto.AdminDashboardDTO;

@Mapper
public interface AdminDashboardMapper {

    // 1. 회원 전체 수, 성별 카운트, 연령대 카운트 조회
    AdminDashboardDTO selectMemberStats();

    // 2. 이번 달 시뮬레이션 연습 시작 건수 조회
    int selectMonthlyStartCount();

    // 3. 전체 시뮬레이션 연습 시작 건수 조회
    int selectTotalStartCount();

    // 4. 전체 시뮬레이션 연습 완료(COMPLETED) 건수 조회
    int selectCompletedCount();

    // 5. 답변 대기(WAITING) 문의 건수 조회
    int selectWaitingInquiryCount();
    
    // 6. 기간별 연습 시작 건수 조회 (날짜키, 건수 맵 리스트)
    List<Map<String, Object>> selectTrendStarts(
            @Param("period") String period,
            @Param("scenarioId") Integer scenarioId);
    
    // 7. 기간별 연습 완료 건수 조회 (날짜키, 건수 맵 리스트)
    List<Map<String, Object>> selectTrendCompletions(
            @Param("period") String period, 
            @Param("scenarioId") Integer scenarioId);
    
    // 8. 이번 달 이용 상위 시나리오 조회 (시작 건수 1위)
    Map<String, Object> selectTopScenarioThisMonth();
    
    // 9. 최근 운영자 활동 목록 조회 (최신 limit건)
    List<AdminActivityDTO> selectRecentActivities(@Param("limit") int limit);
    
    // 10. 관리자 공통 활동 로그 등록
    int insertAdminLog(Map<String, Object> param);
    
    // 11~13. 관리자 활동 상세 매핑 등록 (시나리오 / 회원 / 문의)
    int insertAdminLogScenario(@Param("logId") Long logId, @Param("scenarioId") Integer scenarioId);
    int insertAdminLogMember(@Param("logId") Long logId, @Param("memberId") Integer memberId);
    int insertAdminLogQna(@Param("logId") Long logId, @Param("qnaId") Integer qnaId);
}