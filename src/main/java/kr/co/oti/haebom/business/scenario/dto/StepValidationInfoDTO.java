
package kr.co.oti.haebom.business.scenario.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 시뮬레이션 입력값 검증에 필요한 단계 정보
 */
@Getter
@Setter
public class StepValidationInfoDTO {

	private String scenarioCode;
	private Integer stepOrder;

}
