package kr.co.oti.haebom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {

    // 1. 상단 KPI 지표
    private int totalMemberCount;      // 전체 가입 회원 수
    private int monthlyStartCount;     // 이번 달 연습 시작 건수
    private double completionRate;     // 연습 완료율 (%)
    private int waitingInquiryCount;   // 답변 대기 문의 건수

    // 2. 성별 구성
    private int maleCount;             // 남성 회원 수
    private int femaleCount;           // 여성 회원 수
    private double maleRate;           // 남성 비율 (%)
    private double femaleRate;         // 여성 비율 (%)

    // 3. 연령대 구성 (명)
    private int age10s;                // 10대
    private int age20s;                // 20대
    private int age30s;                // 30대
    private int age40s;                // 40대
    private int age50s;                // 50대
    private int age60sOver;            // 60대 이상
    
    // 4. 이번 달 이용 상위 시나리오
    private String topScenarioTitle;   // 1위 시나리오 이름 (예: "전입신고")
    private int topScenarioStarts;     // 이번 달 시작 건수
    private int topScenarioCompletes;  // 이번 달 완료 건수
}