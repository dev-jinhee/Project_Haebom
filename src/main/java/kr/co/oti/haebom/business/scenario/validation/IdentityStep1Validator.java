
package kr.co.oti.haebom.business.scenario.validation;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;

import kr.co.oti.haebom.business.address.dto.SgisRegionDto;
import kr.co.oti.haebom.business.address.mapper.SgisRegionMapper;
import kr.co.oti.haebom.business.scenario.exception.SimulationValidationException;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class IdentityStep1Validator implements StepValidator {

	private static final long MAX_PHOTO_SIZE = 5L * 1024 * 1024;

	private static final Set<String> PHOTO_EXTENSIONS = Set.of("jpg", "jpeg", "png");

	private final SgisRegionMapper regionMapper;

	@Override
	public boolean supports(String scenarioCode, Integer stepOrder) {
		return "IDENTITY_REISSUE".equals(scenarioCode) && Integer.valueOf(1).equals(stepOrder);
	}

	@Override
	public void validate(Map<String, String> answers) {

		if (answers == null) {
			throw new SimulationValidationException("신청 정보가 없습니다.");
		}

		// 1. 휴대전화번호
		validatePhone(answers);

		// 2. 행정구역 및 수령지역
		validateRegions(answers);

		// 3. 재발급 신청 내용
		validateApplication(answers);

		// 4. 구비서류 사전동의
		validateDocumentConsents(answers);

		// 5. 증명사진 S3 메타데이터
		validatePhotoAttachment(answers);
	}

	// ==============================
	// 1. 휴대전화번호 검증
	// ==============================
	private void validatePhone(Map<String, String> answers) {

		String phone = required(answers, "phone", "휴대전화번호");

		if (!phone.matches("^01\\d-\\d{3,4}-\\d{4}$")) {
			throw new SimulationValidationException("휴대전화번호 형식이 올바르지 않습니다.");
		}
	}

	// ==============================
	// 2. SGIS 행정구역 검증
	// ==============================
	private void validateRegions(Map<String, String> answers) {

		String sidoCode = required(answers, "sido", "시·도");

		String sigunguCode = required(answers, "sigungu", "시·군·구");

		String pickupCode = required(answers, "pickupOffice", "수령지역");

		checkRegionCode(sidoCode, "시·도");
		checkRegionCode(sigunguCode, "시·군·구");
		checkRegionCode(pickupCode, "수령지역");

		SgisRegionDto sido = regionMapper.selectByRegionCode(sidoCode);

		SgisRegionDto sigungu = regionMapper.selectByRegionCode(sigunguCode);

		SgisRegionDto pickup = regionMapper.selectByRegionCode(pickupCode);

		if (sido == null || sido.getRegionLevel() != 1) {
			throw new SimulationValidationException("올바른 시·도를 선택해 주세요.");
		}

		if (sigungu == null || sigungu.getRegionLevel() != 2) {
			throw new SimulationValidationException("올바른 시·군·구를 선택해 주세요.");
		}

		if (!sidoCode.equals(sigungu.getParentCode())) {
			throw new SimulationValidationException("시·도와 시·군·구가 일치하지 않습니다.");
		}

		if (pickup == null || pickup.getRegionLevel() != 3) {
			throw new SimulationValidationException("올바른 수령지역을 선택해 주세요.");
		}

		// 수령지역은 전국 검색 가능
		// 신청인 주소와 반드시 같을 필요는 없음
	}

	private void checkRegionCode(String code, String label) {

		if (!code.matches("\\d{2,20}")) {
			throw new SimulationValidationException(label + " 코드 형식이 올바르지 않습니다.");
		}
	}

	// ==============================
	// 3. 재발급 신청 내용 검증
	// ==============================
	private void validateApplication(Map<String, String> answers) {

		// IC칩 포함 여부
		validateYesNo(answers, "icChipIncluded", "IC칩 포함 여부");

		// 재발급 사유: 단일 선택 필수
		String reissueReason = required(answers, "reissueReason", "재발급 사유");

		if (reissueReason.length() > 50) {
			throw new SimulationValidationException("재발급 사유가 올바르지 않습니다.");
		}

		// JSP의 실제 value 확인 후 허용 코드 목록 검증 추가

		// 수수료 면제 신청
		required(answers, "feeExemption", "수수료 면제 신청");

		// 수령 안내 서비스
		required(answers, "pickupNotice", "수령 안내 서비스");

		// 점자 스티커 제공 서비스
		required(answers, "brailleSticker", "점자 스티커 제공 서비스");

		// 유의사항 확인
		String noticeConfirmed = required(answers, "noticeConfirmed", "유의사항 확인");

		if (!"true".equals(noticeConfirmed)) {
			throw new SimulationValidationException("유의사항을 확인해 주세요.");
		}
	}

	private void validateYesNo(Map<String, String> answers, String key, String label) {

		String value = required(answers, key, label);

		if (!"Y".equals(value) && !"N".equals(value)) {
			throw new SimulationValidationException(label + " 값이 올바르지 않습니다.");
		}
	}

	// ==============================
	// 4. 구비서류 사전동의 검증
	// ==============================
	private void validateDocumentConsents(Map<String, String> answers) {

		validateRequiredConsent(answers, "basicLivelihoodConsent", "기초생활수급자 증명 동의");

		validateRequiredConsent(answers, "patriotFamilyConsent", "국가유공자 유족 확인 동의");

		validateRequiredConsent(answers, "singleParentConsent", "한부모가족 증명 동의");
	}

	private void validateRequiredConsent(Map<String, String> answers, String key, String label) {

		if (!"Y".equals(answers.get(key))) {
			throw new SimulationValidationException(label + "가 필요합니다.");
		}
	}

	// ==============================
	// 5. 증명사진 S3 메타데이터 검증
	// ==============================
	private void validatePhotoAttachment(Map<String, String> answers) {

		String s3Key = required(answers, "photoS3Key", "증명사진");

		String fileName = required(answers, "photoFileName", "증명사진 파일명");

		String fileSize = required(answers, "photoFileSize", "증명사진 파일 크기");

		String pattern = "identity/[1-9][0-9]*/photo/" + "[0-9a-fA-F-]{36}\\.(jpg|jpeg|png)";

		if (!s3Key.matches(pattern)) {
			throw new SimulationValidationException("증명사진 저장 경로가 올바르지 않습니다.");
		}

		String objectName = s3Key.substring(s3Key.lastIndexOf('/') + 1);

		int dot = objectName.lastIndexOf('.');

		String uuidPart = objectName.substring(0, dot);
		String extension = objectName.substring(dot + 1);

		try {
			UUID.fromString(uuidPart);
		} catch (IllegalArgumentException e) {
			throw new SimulationValidationException("증명사진 저장 경로가 올바르지 않습니다.");
		}

		if (!PHOTO_EXTENSIONS.contains(extension)) {
			throw new SimulationValidationException("JPG, JPEG, PNG 형식만 첨부할 수 있습니다.");
		}

		if (fileName.length() > 150 || fileName.contains("/") || fileName.contains("\\")
				|| fileName.chars().anyMatch(Character::isISOControl)) {

			throw new SimulationValidationException("증명사진 파일명이 올바르지 않습니다.");
		}

		long size;

		try {
			size = Long.parseLong(fileSize);
		} catch (NumberFormatException e) {
			throw new SimulationValidationException("증명사진 파일 크기가 올바르지 않습니다.");
		}

		if (size <= 0 || size > MAX_PHOTO_SIZE) {
			throw new SimulationValidationException("증명사진은 5MB 이하로 첨부해 주세요.");
		}
	}

	// ==============================
	// 공통 필수값 검증
	// ==============================
	private String required(Map<String, String> answers, String key, String label) {

		String value = answers.get(key);

		if (value == null || value.isBlank()) {
			throw new SimulationValidationException(label + " 정보가 없습니다.");
		}

		return value.trim();
	}
}
