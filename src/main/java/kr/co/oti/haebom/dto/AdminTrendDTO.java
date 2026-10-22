package kr.co.oti.haebom.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTrendDTO {
    private String period; // daily, monthly, yearly
    private String range; // 예: 최근 12개월, 최근 7일
    private int step; // Y축 눈금 단위
    private List<String> labels; // X축 라벨 (예: ["11월", "12월", ..., "10월"])
    private List<Integer> starts; // 기간별 연습 시작 건수
    private List<Integer> completed; // 기간별 연습 완료 건수
}