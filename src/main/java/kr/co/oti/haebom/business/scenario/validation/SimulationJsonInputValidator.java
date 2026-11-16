package kr.co.oti.haebom.business.scenario.validation;

import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import com.fasterxml.jackson.databind.JsonNode;

import kr.co.oti.haebom.business.scenario.exception.SimulationValidationException;

/**
 * 시뮬레이션 JSON 답변의 기본적인 서버 측 입력 검증.
 *
 * - JSON 문법은 SimulationService에서 Jackson으로 검증한다. - 이 클래스는 JSON 내부의 모든 문자열과 객체
 * 키를 검사한다. - 서비스에 HTML 입력 기능이 없다는 현재 전제하에서 태그 구분자를 거부한다. - 특정 필드의 허용값/길이/필수 여부는
 * StepValidationManager에서 별도로 검증해야 한다. - 이것은 XSS 출력 인코딩을 대체하지 않는다.
 */
public final class SimulationJsonInputValidator {
	private static final int MAX_DEPTH = 16;
	private static final int MAX_NODES = 2_000;
	private static final int MAX_TEXT_LENGTH = 4_096;
	private static final int MAX_KEY_LENGTH = 128;
	private static final Set<String> FORBIDDEN_KEYS = Set.of("__proto__", "constructor", "prototype");

	private SimulationJsonInputValidator() {
	}

	/** Jackson 파싱 전에 중첩 깊이를 제한한다. (JSON 문법 자체의 판정은 Jackson 담당) */
	public static void validateNestingBeforeParse(String json) {
		int depth = 0;
		boolean inString = false;
		boolean escape = false;
		for (int i = 0; i < json.length(); i++) {
			char ch = json.charAt(i);
			if (inString) {
				if (escape) {
					escape = false;
				} else if (ch == '\\') {
					escape = true;
				} else if (ch == '"') {
					inString = false;
				}
				continue;
			}
			if (ch == '"') {
				inString = true;
			} else if (ch == '{' || ch == '[') {
				if (++depth > MAX_DEPTH) {
					throw new SimulationValidationException("JSON 중첩 깊이가 너무 깊습니다.");
				}
			} else if (ch == '}' || ch == ']') {
				depth--;
			}
		}
	}

	public static void validate(JsonNode root) {
		if (root == null) {
			throw new SimulationValidationException("JSON 값이 없습니다.");
		}
		int[] count = { 0 };
		validateNode(root, 0, count);
	}

	private static void validateNode(JsonNode node, int depth, int[] count) {
		if (depth > MAX_DEPTH || ++count[0] > MAX_NODES) {
			throw new SimulationValidationException("JSON 데이터가 허용된 복잡도를 초과했습니다.");
		}

		if (node.isObject()) {
			Iterator<Map.Entry<String, JsonNode>> entries = node.fields();
			while (entries.hasNext()) {
				Map.Entry<String, JsonNode> entry = entries.next();
				String key = entry.getKey();
				if (key == null || key.length() > MAX_KEY_LENGTH || FORBIDDEN_KEYS.contains(key)) {
					throw new SimulationValidationException("허용되지 않는 JSON 필드명입니다.");
				}
				validatePlainText(key, "JSON 필드명", MAX_KEY_LENGTH);

				// 상세주소 입력값 추가 검증
				if ("detailAddress".equals(key)) {
					JsonNode detailNode = entry.getValue();

					if (detailNode != null && !detailNode.isNull()) {
						if (!detailNode.isTextual()) {
							throw new SimulationValidationException("상세주소 데이터 형식이 올바르지 않습니다.");
						}

						validateDetailAddress(detailNode.asText());
					}
				}
				// 기존 JSON 내부 검증 유지
				validateNode(entry.getValue(), depth + 1, count);
			}
		} else if (node.isArray()) {
			for (JsonNode item : node) {
				validateNode(item, depth + 1, count);
			}
		} else if (node.isTextual()) {
			validatePlainText(node.textValue(), "입력값", MAX_TEXT_LENGTH);
		}
	}

	private static void validatePlainText(String value, String label, int maxLength) {
		if (value.length() > maxLength) {
			throw new SimulationValidationException(label + "의 길이가 너무 깁니다.");
		}
		for (int i = 0; i < value.length(); i++) {
			char ch = value.charAt(i);
			// 현재 시뮬레이션 JSON에는 HTML을 작성하는 필드가 없다.
			// 원본을 엔티티로 변형하지 않고 요청 자체를 거부해 DB 무결성을 지킨다.
			if (ch == '<' || ch == '>') {
				throw new SimulationValidationException(label + "에 허용되지 않는 문자가 포함되어 있습니다.");
			}
			if (Character.isISOControl(ch) && ch != '\n' && ch != '\r' && ch != '\t') {
				throw new SimulationValidationException(label + "에 제어 문자가 포함되어 있습니다.");
			}
		}
	}

	private static final Pattern DETAIL_ADDRESS_PATTERN = Pattern.compile("^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\\s#(),/-]*$");

	private static void validateDetailAddress(String value) {
		if (value == null) {
			return;
		}

		if (value.length() > 200) {
			throw new SimulationValidationException("상세주소는 200자 이하로 입력해 주세요.");
		}

		if (!DETAIL_ADDRESS_PATTERN.matcher(value).matches()) {
			throw new SimulationValidationException("상세주소에 허용되지 않는 문자가 포함되어 있습니다.");
		}
	}
}
