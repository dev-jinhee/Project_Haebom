
package kr.co.oti.haebom.business.scenario.validation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * 시나리오별 단계 입력 필드 관리
 *
 * 각 단계에서 허용되는 fieldKey와 검증 규칙을 등록한다.
 * 기본 필수값 및 허용값 검증에 사용한다.
 */
@Component
public class StepFieldRegistry {

    // 시나리오 코드와 단계 순서를 조합한 식별자
    private record StepKey(String scenarioCode, Integer stepOrder) {}

    // 단계별 입력 필드 규칙 저장
    private final Map<StepKey, List<FieldRule>> steps = new HashMap<>();

    public StepFieldRegistry() {

        // 전입신고 1단계: 유의사항 동의
        register("MOVE", 1,
                List.of(
                        FieldRule.requiredChoice("agreeNotice", "true")
                )
        );
    }

    // 단계별 필드 규칙 등록
    private void register(String scenarioCode, Integer stepOrder,
                          List<FieldRule> fields) {

        StepKey key = new StepKey(scenarioCode, stepOrder);

        if (steps.putIfAbsent(key, List.copyOf(fields)) != null) {
            throw new IllegalStateException(
                    "시나리오/단계 규칙이 중복 등록되었습니다.");
        }
    }

    // 현재 시나리오와 단계에 해당하는 필드 규칙 조회
    public List<FieldRule> getRules(String scenarioCode, Integer stepOrder) {

        return steps.get(new StepKey(scenarioCode, stepOrder));
    }
}
