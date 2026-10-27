package kr.co.oti.haebom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminScenarioDTO {

	private Integer scenarioId; // 시나리오 번호 (1, 2)
	private String scenarioTitle; // 시나리오 제목 (전입신고 등)
	private String description; // 설명
	private Integer estimatedMinutes; // 예상 소요시간 (분)
	private Boolean isActive; // 운영 여부 (true : 운영 중, false : 점검 중)
	private Integer categoryId; // 카테고리 번호
	private String categoryName; // 카테고리 코드명 (HOUSING, IDENTITY)
	private String categoryLabel; // 화면 표시용 한글명 (주거·이사, 신분증·주민등록)
}
