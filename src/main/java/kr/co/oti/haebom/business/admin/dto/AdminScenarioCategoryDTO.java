package kr.co.oti.haebom.business.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 관리자 시나리오 관리 모달의 분류 선택 및 매핑용 카테고리 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminScenarioCategoryDTO {

	private Integer categoryId;
	private String categoryName;
	private String categoryLabel;
}
