
package kr.co.oti.haebom.business.scenario.validation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * 시나리오별 단계 입력 필드 관리
 *
 * 각 단계에서 허용되는 fieldKey와 검증 규칙을 등록한다. 기본 필수값 및 허용값 검증에 사용한다.
 */
@Component
public class StepFieldRegistry {

	// 시나리오 코드와 단계 순서를 조합한 식별자
	private record StepKey(String scenarioCode, Integer stepOrder) {
	}

	// 단계별 입력 필드 규칙 저장
	private final Map<StepKey, List<FieldRule>> steps = new HashMap<>();

	public StepFieldRegistry() {

		// ==============================
		// 전입신고 1단계: 유의사항 동의
		// ==============================
		register("MOVE", 1, List.of(FieldRule.requiredChoice("agreeNotice", "true")));

		// ==============================
		// 전입신고 2단계: 전입 사유
		// ==============================
		register("MOVE", 2, List.of(FieldRule.requiredChoice("moveReason", "JOB", "FAMILY", "HOUSING", "EDUCATION",
				"LIVING_ENV", "NATURE", "OTHER"), FieldRule.optional("moveReasonDetail", 200)));

		// ==============================
		// 전입신고 3단계: 이전 주소
		// ==============================
		register("MOVE", 3,
				List.of(FieldRule.required("previousAddress", 2000),
						FieldRule.requiredChoice("personalInfoConsent", "AGREE", "DISAGREE"),
						FieldRule.requiredChoice("administrativeInfoConsent", "AGREE", "DISAGREE")));

		// ==============================
		// 전입신고 4단계: 이사 온 곳 주소 및 세대 구성
		// ==============================
		register("MOVE", 4, List.of(FieldRule.required("currentAddress", 5000),

				FieldRule.requiredChoice("householdType", "NEW_HOUSEHOLD", "JOIN_EXISTING"),

				FieldRule.optionalChoice("newHeadStrategy", "KEEP_ORIGINAL", "CHANGE_HEAD"),

				FieldRule.optional("existingHeadName", 50), FieldRule.optional("existingHeadPhoneNum", 13),

				FieldRule.optionalChoice("existingHeadCheck", "SIMULATED"),

				FieldRule.required("additionalServices", 500), FieldRule.required("additionalServiceDetails", 10000)));

		// ==============================
		// 주민등록증 재발급 1단계
		// ==============================
		register("IDENTITY_REISSUE", 1, List.of(

				// 신청인 연락처
				FieldRule.required("phone", 13),

				// SGIS 행정구역
				FieldRule.required("sido", 20), FieldRule.required("sigungu", 20),

				// 재발급 신청 내용
				FieldRule.requiredChoice("icChipIncluded", "Y", "N"),

				// 재발급 사유: 단일 선택
				FieldRule.required("reissueReason", 50),

				// 수수료 면제 신청
				FieldRule.required("feeExemption", 50),

				// 수령 안내 서비스
				FieldRule.required("pickupNotice", 50),

				// 점자 스티커 제공
				FieldRule.required("brailleSticker", 50),

				// 유의사항 확인
				FieldRule.requiredChoice("noticeConfirmed", "true"),

				// 수령지역 SGIS 코드
				FieldRule.required("pickupOffice", 20),

				// 구비서류 사전동의: 개별 Y
				FieldRule.requiredChoice("basicLivelihoodConsent", "Y"),

				FieldRule.requiredChoice("patriotFamilyConsent", "Y"),

				FieldRule.requiredChoice("singleParentConsent", "Y"),

				// S3 증명사진 메타데이터
				FieldRule.required("photoS3Key", 200), FieldRule.required("photoFileName", 150),
				FieldRule.required("photoFileSize", 20)));
	}

	// 단계별 필드 규칙 등록
	private void register(String scenarioCode, Integer stepOrder, List<FieldRule> fields) {

		StepKey key = new StepKey(scenarioCode, stepOrder);

		if (steps.putIfAbsent(key, List.copyOf(fields)) != null) {
			throw new IllegalStateException("시나리오/단계 규칙이 중복 등록되었습니다.");
		}
	}

	// 현재 시나리오와 단계에 해당하는 필드 규칙 조회
	public List<FieldRule> getRules(String scenarioCode, Integer stepOrder) {

		return steps.get(new StepKey(scenarioCode, stepOrder));
	}
}
