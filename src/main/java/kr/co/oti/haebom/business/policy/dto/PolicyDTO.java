package kr.co.oti.haebom.business.policy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyDTO {

	private String serviceId; // 공공서비스 고유 ID
	private String serviceName; // 정책/서비스명 (예: 청녕월세 한시 특별지원)
	private String serviceSummary; // 서비스 목적 요약 (1~2줄 설명)
	private String supportType; // 지원 유형 (예: 현금/바우처, 보증료 지원 등)
	private String deptName; // 소관 기관명 (예: 국토교통부, 행정안전부 등)
	private String detailUrl; // 정부 24 공식 상세 안내 링크 URL
	private String applyPeriod; // 신청 기한 (예: 상시 신청, 연중 접수 등)
	
	
}
