package kr.co.oti.haebom.business.scenario.validation;

import java.util.Map;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import kr.co.oti.haebom.business.address.dto.SgisRegionDto;
import kr.co.oti.haebom.business.address.mapper.SgisRegionMapper;
import kr.co.oti.haebom.business.scenario.exception.SimulationValidationException;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MoveStep3Validator implements StepValidator {
	private final ObjectMapper objectMapper;
	private final SgisRegionMapper regionMapper;

	@Override
	public boolean supports(String scenarioCode, Integer stepOrder) {
		// 현재 시나리오와 단계가 validator의 담당인지 확인
		// 현재 시나리오가 MOVE시나리오의 3단계인지 확인
		return "MOVE".equals(scenarioCode) && Integer.valueOf(3).equals(stepOrder);
	}

	@Override
	public void validate(Map<String, String> answers) {
		String previousAddress = answers.get("previousAddress");

		if (previousAddress == null || previousAddress.isBlank()) {
			throw new SimulationValidationException("이사 전 주소 정보가 없습니다.");
		}

		try {
			// JSON 문자열을 JsonNode로 변환
			JsonNode address = objectMapper.readTree(previousAddress);

			// JSON 객체인지 확인
			if (address == null || !address.isObject()) {
				throw new SimulationValidationException("이사 전 주소 형식이 올바르지 않습니다.");
			}

			// 시·도 코드
			String sidoCode = address.path("sidoCode").asText("");

			if (sidoCode.isBlank()) {
				throw new SimulationValidationException("시·도를 선택해 주세요.");
			}
			if (!sidoCode.matches("\\d{2,20}")) {
				throw new SimulationValidationException("시·도 코드 형식이 올바르지 않습니다.");
			}

			// 시·군·구 코드
			String sigunguCode = address.path("sigunguCode").asText("");

			if (sigunguCode.isBlank()) {
				throw new SimulationValidationException("시·군·구를 선택해 주세요.");
			}
			if (!sigunguCode.matches("\\d{2,20}")) {
				throw new SimulationValidationException("시·군·구 코드 형식이 올바르지 않습니다.");
			}

			// DB 조회
			SgisRegionDto sido = regionMapper.selectByRegionCode(sidoCode);
			SgisRegionDto sigungu = regionMapper.selectByRegionCode(sigunguCode);

			// 시·도 유효성 검증
			if (sido == null || sido.getRegionLevel() != 1) {
				throw new SimulationValidationException("올바른 시·도를 선택해 주세요.");
			}

			// 시·군·구 유효성 검증
			if (sigungu == null || sigungu.getRegionLevel() != 2) {
				throw new SimulationValidationException("올바른 시·군·구를 선택해 주세요.");
			}

			// 시·군·구가 선택한 시·도에 속하는지 확인
			if (!sidoCode.equals(sigungu.getParentCode())) {
				throw new SimulationValidationException("시·도와 시·군·구 정보가 일치하지 않습니다.");
			}
			// 가상 주소 정보 검증
			if (!"해봄동".equals(address.path("administrativeDong").asText(""))
					|| !"해봄동 101-1".equals(address.path("detailAddress").asText(""))
					|| !"해봄동 행정복지센터".equals(address.path("welfareCenter").asText(""))) {

				throw new SimulationValidationException("이사 전 주소의 기본 정보가 올바르지 않습니다.");
			}

		} catch (JsonProcessingException e) {
			throw new SimulationValidationException("이사 전 주소 JSON 형식이 올바르지 않습니다.", e);
		}
	}
}
