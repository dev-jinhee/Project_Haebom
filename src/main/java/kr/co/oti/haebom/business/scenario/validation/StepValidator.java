
package kr.co.oti.haebom.business.scenario.validation;

import java.util.Map;

/**
 * 시나리오 단계별 업무 검증 인터페이스
 *
 * 공통 필드 검증으로 처리하기 어려운
 * 조건부 필수값 및 여러 입력값 간의 업무 규칙을 검증한다.
 */
public interface StepValidator {

    // 현재 시나리오와 단계의 검증을 담당하는지 확인
    boolean supports(String scenarioCode, Integer stepOrder);

    // 현재 단계의 입력값을 바탕으로 조건부 업무 규칙 검증
    void validate(Map<String, String> answers);

}
