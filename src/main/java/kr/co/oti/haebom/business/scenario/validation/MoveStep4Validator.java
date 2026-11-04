package kr.co.oti.haebom.business.scenario.validation;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import kr.co.oti.haebom.business.scenario.exception.SimulationValidationException;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MoveStep4Validator implements StepValidator {

    private static final Set<String> SERVICE_CODES = Set.of(
            "LEASE_REPORT", "MAIL_FORWARD", "SCHOOL_ADDRESS",
            "UTILITY_ADDRESS", "WELFARE_BENEFIT");

    private final ObjectMapper objectMapper;

    @Override
	public boolean supports(String scenarioCode, Integer stepOrder) {
		// 현재 시나리오와 단계가 validator의 담당인지 확인
		// 현재 시나리오가 MOVE시나리오의 4단계인지 확인
		return "MOVE".equals(scenarioCode) && Integer.valueOf(4).equals(stepOrder);
	}

    @Override
    public void validate(Map<String, String> answers) {
        validateCurrentAddress(answers.get("currentAddress"));
        validateHousehold(answers);
        validateAdditionalServices(
                answers.get("additionalServices"),
                answers.get("additionalServiceDetails"));
    }

    // 1. 주소 검색 결과(JSON)의 15개 필드 검증
    private void validateCurrentAddress(String raw) {
        JsonNode address = readJson(raw, "현재 주소");
        if (!address.isObject()) {
            throw new SimulationValidationException("현재 주소 형식이 올바르지 않습니다.");
        }

        // 도로명/지번/상세 주소
        checkText(address, "roadAddress", "도로명주소", true, 300);
        checkText(address, "jibunAddress", "지번주소", true, 300);
        checkText(address, "detailAddress", "상세주소", false, 150);

        // 행정구역 정보
        checkText(address, "sidoName", "시·도", true, 50);
        checkText(address, "sigunguName", "시·군·구", false, 50);
        checkText(address, "emdName", "읍·면·동", true, 50);
        checkText(address, "hemdName", "행정동", false, 100);
        checkText(address, "addressPart2", "주소 참고항목", false, 300);

        // 주소 검색 API의 코드값
        checkPattern(address, "zipNo", "우편번호", "\\d{5}");
        checkPattern(address, "admCd", "행정구역코드", "\\d{10}");
        checkPattern(address, "rnMgtSn", "도로명코드", "\\d{12}");
        checkPattern(address, "bdMgtSn", "건물관리번호", "\\d{25}");
        checkPattern(address, "buildingPosition", "건물 지상·지하 구분", "[01]");
        checkPattern(address, "buildingMainNo", "건물본번", "\\d{1,10}");
        checkPattern(address, "buildingSubNo", "건물부번", "\\d{1,10}");
    }

    // 2. 세대 구성 방법에 따른 조건부 검증
    private void validateHousehold(Map<String, String> answers) {
        String type = answers.get("householdType");
        String strategy = answers.get("newHeadStrategy");
        String existingName = answers.get("existingHeadName");
        String existingPhone = answers.get("existingHeadPhoneNum");
        String existingCheck = answers.get("existingHeadCheck");

        if ("NEW_HOUSEHOLD".equals(type)) {
            if (!"KEEP_ORIGINAL".equals(strategy) && !"CHANGE_HEAD".equals(strategy)) {
                throw new SimulationValidationException("새 세대 구성 방식을 선택해주세요.");
            }
            if (hasText(existingName) || hasText(existingPhone) || hasText(existingCheck)) {
                throw new SimulationValidationException("새 세대 구성 시 기존 거주 세대주 정보는 입력할 수 없습니다.");
            }
        } else if ("JOIN_EXISTING".equals(type)) {
            if (hasText(strategy)) {
                throw new SimulationValidationException("기존 세대에 편입할 때는 새 세대 구성 방식을 지정할 수 없습니다.");
            }
            if (!hasText(existingName)) {
                throw new SimulationValidationException("기존 거주 세대주의 이름을 입력해주세요.");
            }
            if (existingPhone == null || !existingPhone.matches("010-\\d{4}-\\d{4}")) {
                throw new SimulationValidationException("기존 거주 세대주의 휴대전화번호 형식이 올바르지 않습니다.");
            }
            if (!"SIMULATED".equals(existingCheck)) {
                throw new SimulationValidationException("기존 세대주 확인 체험을 완료해주세요.");
            }
        } else {
            throw new SimulationValidationException("세대 구성 방법이 올바르지 않습니다.");
        }
    }

    // 3. 추가 서비스 선택 목록과 상세 내용 검증
    private void validateAdditionalServices(String servicesRaw, String detailsRaw) {
        JsonNode services = readJson(servicesRaw, "추가 서비스 목록");
        JsonNode details = readJson(detailsRaw, "추가 서비스 상세정보");

        if (!services.isArray() || !details.isObject()) {
            throw new SimulationValidationException("추가 서비스 데이터 형식이 올바르지 않습니다.");
        }

        Set<String> selected = new HashSet<>();
        for (JsonNode service : services) {
            if (!service.isTextual() || !SERVICE_CODES.contains(service.asText())) {
                throw new SimulationValidationException("허용되지 않은 추가 서비스가 포함되어 있습니다.");
            }
            if (!selected.add(service.asText())) {
                throw new SimulationValidationException("추가 서비스가 중복 선택되었습니다.");
            }
        }

        // 선택한 서비스만 상세정보를 가질 수 있음
        Iterator<String> detailKeys = details.fieldNames();
        while (detailKeys.hasNext()) {
            if (!selected.contains(detailKeys.next())) {
                throw new SimulationValidationException("선택하지 않은 서비스의 상세정보가 포함되어 있습니다.");
            }
        }

        for (String code : selected) {
            JsonNode item = details.get(code);
            if (item == null || !item.isObject()) {
                throw new SimulationValidationException(code + " 상세정보 형식이 올바르지 않습니다.");
            }

            switch (code) {
                case "LEASE_REPORT":
                    checkOnlyFields(item, code, "reportRequested", "mockDocumentAttached");
                    checkBoolean(item, "reportRequested", "임대차계약 신고 선택", false);
                    checkBoolean(item, "mockDocumentAttached", "가상 계약서 첨부 여부", false);
                    break;

                case "MAIL_FORWARD":
                    checkOnlyFields(item, code, "landlinePhone", "phone", "sameAsApplicant", "familyIds");
                    checkOptionalPhone(item, "landlinePhone", "신청인 전화번호");
                    checkPhone(item, "phone", "우편물 주소 이전 휴대전화번호");
                    checkBoolean(item, "sameAsApplicant", "신청인 정보 동일 여부", false);
                    checkFamilyIds(item, "우편물 주소 이전");
                    break;

                case "SCHOOL_ADDRESS":
                    checkOnlyFields(item, code, "familyIds");
                    checkFamilyIds(item, "초등학교 배정정보");
                    break;

                case "UTILITY_ADDRESS":
                    checkOnlyFields(item, code, "noticeAgreed");
                    checkBoolean(item, "noticeAgreed", "전기사용자 명의변경 유의사항", true);
                    break;

                case "WELFARE_BENEFIT":
                    checkOnlyFields(item, code, "noticeAgreed");
                    checkBoolean(item, "noticeAgreed", "요금감면 신청 유의사항", true);
                    break;

                default:
                    throw new SimulationValidationException("허용되지 않은 추가 서비스입니다.");
            }
        }
    }

    private JsonNode readJson(String raw, String label) {
        if (!hasText(raw)) {
            throw new SimulationValidationException(label + " 정보가 없습니다.");
        }
        try {
            JsonNode node = objectMapper.readTree(raw);
            if (node == null || node.isNull()) {
                throw new SimulationValidationException(label + " 형식이 올바르지 않습니다.");
            }
            return node;
        } catch (JsonProcessingException e) {
            throw new SimulationValidationException(label + " JSON 형식이 올바르지 않습니다.", e);
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private void checkText(JsonNode object, String key, String label, boolean required, int maxLength) {
        JsonNode value = object.get(key);
        if (value == null || value.isNull()) {
            if (required) {
                throw new SimulationValidationException(label + " 정보가 없습니다.");
            }
            return;
        }
        if (!value.isTextual()) {
            throw new SimulationValidationException(label + " 형식이 올바르지 않습니다.");
        }
        String text = value.asText().trim();
        if (required && text.isEmpty()) {
            throw new SimulationValidationException(label + " 정보가 없습니다.");
        }
        if (text.length() > maxLength) {
            throw new SimulationValidationException(label + " 길이가 너무 깁니다.");
        }
    }

    private void checkPattern(JsonNode object, String key, String label, String pattern) {
        JsonNode value = object.get(key);
        if (value == null || !value.isTextual() || !value.asText().matches(pattern)) {
            throw new SimulationValidationException(label + " 형식이 올바르지 않습니다.");
        }
    }

    private void checkOnlyFields(JsonNode object, String code, String... allowedKeys) {
        Set<String> allowed = Set.of(allowedKeys);
        Iterator<String> keys = object.fieldNames();
        while (keys.hasNext()) {
            if (!allowed.contains(keys.next())) {
                throw new SimulationValidationException(code + "에 허용되지 않은 상세 항목이 있습니다.");
            }
        }
    }

    private void checkBoolean(JsonNode object, String key, String label, boolean mustBeTrue) {
        JsonNode value = object.get(key);
        if (value == null || !value.isBoolean() || (mustBeTrue && !value.booleanValue())) {
            throw new SimulationValidationException(label + " 값이 올바르지 않습니다.");
        }
    }

    private void checkPhone(JsonNode object, String key, String label) {
        JsonNode value = object.get(key);
        if (value == null || !value.isTextual() || !value.asText().matches("010-\\d{4}-\\d{4}")) {
            throw new SimulationValidationException(label + " 형식이 올바르지 않습니다.");
        }
    }

    private void checkOptionalPhone(JsonNode object, String key, String label) {
        JsonNode value = object.get(key);
        if (value == null || value.isNull()) return;
        if (!value.isTextual()
                || (!value.asText().isBlank() && !value.asText().matches("\\d{2,3}-\\d{3,4}-\\d{4}"))) {
            throw new SimulationValidationException(label + " 형식이 올바르지 않습니다.");
        }
    }

    private void checkFamilyIds(JsonNode object, String label) {
        JsonNode ids = object.get("familyIds");
        if (ids == null || !ids.isArray() || ids.size() == 0) {
            throw new SimulationValidationException(label + " 대상자를 한 명 이상 선택해주세요.");
        }
        Set<Integer> unique = new HashSet<>();
        for (JsonNode id : ids) {
            if (!id.isIntegralNumber() || !id.canConvertToInt() || id.intValue() <= 0
                    || !unique.add(id.intValue())) {
                throw new SimulationValidationException(label + " 대상자 ID가 올바르지 않습니다.");
            }
        }
    }
}
