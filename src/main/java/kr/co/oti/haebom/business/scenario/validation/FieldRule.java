
package kr.co.oti.haebom.business.scenario.validation;

import java.util.Set;

/**
 * 시뮬레이션 입력 항목의 공통 검증 규칙
 *
 * fieldKey      : 입력 항목 이름
 * required      : 필수 입력 여부
 * maxLength     : 최대 입력 길이
 * allowedValues : 허용되는 입력값 목록
 */
public record FieldRule(
        String fieldKey,
        boolean required,
        Integer maxLength,
        Set<String> allowedValues
) {

    // 필수 문자열 입력 항목
    public static FieldRule required(
            String fieldKey, int maxLength) {

        return new FieldRule(
                fieldKey, true, maxLength, Set.of()
        );
    }

    // 선택 문자열 입력 항목
    public static FieldRule optional(
            String fieldKey, int maxLength) {

        return new FieldRule(
                fieldKey, false, maxLength, Set.of()
        );
    }

    // 지정된 값만 허용하는 필수 입력 항목
    public static FieldRule requiredChoice(
            String fieldKey, String... values) {

        return new FieldRule(
                fieldKey, true, null, Set.of(values)
        );
    }

    // 지정된 값만 허용하는 선택 입력 항목
    public static FieldRule optionalChoice(
            String fieldKey, String... values) {

        return new FieldRule(
                fieldKey, false, null, Set.of(values)
        );
    }
}
