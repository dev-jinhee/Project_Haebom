
package kr.co.oti.haebom.business.scenario.validation;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import kr.co.oti.haebom.business.scenario.dto.AnswerSaveRequestListDTO.AnswerSaveRequestDTO;
import lombok.RequiredArgsConstructor;

/**
 * 시나리오 단계별 입력값 검증 관리
 *
 * 1. 허용된 입력 항목 확인
 * 2. 중복 입력 항목 확인
 * 3. 입력값 길이 및 허용값 검증
 * 4. 필수 입력값 검증
 * 5. 단계별 조건부 업무 검증
 */
@Component
@RequiredArgsConstructor
public class StepValidationManager {

    private final StepFieldRegistry fieldRegistry;
    private final List<StepValidator> validators;

    public void validate(String scenarioCode, Integer stepOrder,
                         List<AnswerSaveRequestDTO> answers) {

        if (answers == null) {
            throw new IllegalArgumentException("답변 정보가 없습니다.");
        }

        // 1. 현재 시나리오와 단계의 필드 규칙 조회
        List<FieldRule> rules =
                fieldRegistry.getRules(scenarioCode, stepOrder);

        // 아직 검증 규칙을 등록하지 않은 단계는 기존 동작 유지
        // 전체 단계 등록 완료 후에는 예외 처리로 변경 예정
        if (rules == null) {
            return;
        }

        // 2. 허용된 필드 목록 구성
        Map<String, FieldRule> definitions = new HashMap<>();

        for (FieldRule rule : rules) {
            if (definitions.putIfAbsent(rule.fieldKey(), rule) != null) {
                throw new IllegalStateException(
                        "필드 규칙 중복: " + rule.fieldKey());
            }
        }

        // 3. 전달된 답변 검증
        Map<String, String> values = new HashMap<>(); //검증한 입력값 저장
        Set<String> seen = new HashSet<>(); //중복 fieldKey 확인 용

        for (AnswerSaveRequestDTO answer : answers) {

            if (answer == null || answer.getFieldKey() == null) {
                throw new IllegalArgumentException(
                        "답변 형식이 올바르지 않습니다.");
            }

            String key = answer.getFieldKey();
            FieldRule rule = definitions.get(key);

            // 해당 단계에서 허용되지 않은 필드
            if (rule == null) {
                throw new IllegalArgumentException(
                        "허용되지 않은 입력 항목: " + key);
            }

            // 동일한 fieldKey 중복 전송 방지 
            // -> Set은 중복 저장은 하지 않는 자료 구조라 같은 값이 추가했다면 false를 반환함
            if (!seen.add(key)) {
                throw new IllegalArgumentException(
                        "중복된 입력 항목: " + key);
            }

            String value = answer.getAnswerValue();

            // 최대 입력 길이 검증
            if (rule.maxLength() != null && value != null
                    && value.length() > rule.maxLength()) {
                throw new IllegalArgumentException(
                        "입력 길이 초과: " + key);
            }

            // 허용된 선택값인지 확인
            if (value != null && !value.isBlank()
                    && !rule.allowedValues().isEmpty()
                    && !rule.allowedValues().contains(value)) {
                throw new IllegalArgumentException(
                        "허용되지 않은 입력값: " + key);
            }

            values.put(key, value);
        }

        // 4. 필수 입력값 누락 여부 확인
        for (FieldRule rule : rules) {

            String value = values.get(rule.fieldKey());

            if (rule.required()
                    && (value == null || value.isBlank())) {
                throw new IllegalArgumentException(
                        "필수 입력 누락: " + rule.fieldKey());
            }
        }

        // 5. 현재 단계의 조건부 업무 검증기 조회
        List<StepValidator> matched = validators.stream()
                .filter(v -> v.supports(scenarioCode, stepOrder))
                .toList();

        // 하나의 단계에 검증기가 중복 등록된 경우
        if (matched.size() > 1) {
            throw new IllegalStateException(
                    "단계 업무 검증기가 중복 등록되었습니다.");
        }

        // 조건부 업무 검증기가 등록된 경우 실행
        if (!matched.isEmpty()) {
            matched.get(0).validate(
                    Collections.unmodifiableMap(
                            new HashMap<>(values)
                    )
            );
        }
    }
}
