/**
 * 해봄 | 주민등록증 재발급 단일 단계
 * 공통 simulation.js 모듈 규약: init / getData / validate / restore
 *
 * 사진 검증 결과 및 촬영 조건 체크 상태는 DB에 저장하지 않는다.
 * 서버 검증은 별도로 연결해야 우회 요청도 차단할 수 있다.
 */
import { fetchRegions } from "../utils/sgis-api.js";
import { initIdentityStepUi, renderSavedPhotoPreview, getPhotoInspection } from "./step1-ui.js";
import { uploadAttachment } from "../utils/attachment-api.js";

const $ = (root, selector) => root.querySelector(selector);
const value = (root, selector) => $(root, selector)?.value?.trim() ?? "";
const checked = (root, name) => $(root, `input[name="${name}"]:checked`)?.value ?? "";
const isChecked = (root, selector) => Boolean($(root, selector)?.checked);

// 증명사진 S3 업로드 상태
// root별 업로드 완료 사진 메타데이터
const uploadedPhotoByRoot = new WeakMap();

function getUploadedPhoto(root) {
	return uploadedPhotoByRoot.get(root) ?? null;
}

function radio(root, name, val) {
	root.querySelectorAll(`input[name="${name}"]`).forEach(input => {
		input.checked = input.value === val;
	});
}

function setupAddressSelects(root, readOnly = false) {
	const sido = $(root, "#identitySido");
	const sigungu = $(root, "#identitySigungu");
	const status = $(root, "#addressStatus");
	if (!sido || !sigungu) return;
	// 읽기 전용 상태
	sido.disabled = readOnly;
	sigungu.disabled = true;

	let requestId = 0;

	//시도 조회
	async function renderSido() {
		sido.replaceChildren(new Option("시도 선택", ""));
		sido.disabled = true;

		try {
			// cd 없이 호출하면 시·도 목록 조회
			const regions = await fetchRegions();

			if (!root.isConnected) return;

			for (const region of regions) {
				sido.add(
					new Option(region.addr_name, String(region.cd))
				);
			}

			sido.disabled = readOnly;

		} catch (error) {
			console.error("시·도 조회 오류:", error);

			if (status) {
				status.textContent = "시·도 목록을 불러오지 못했습니다.";
			}
		}
	}
	//시군구 조회
	async function renderDistricts(selected = "") {
		const sidoCode = sido.value;
		const currentRequest = ++requestId;

		// 기존 목록 초기화
		sigungu.replaceChildren(
			new Option("시·군·구 선택", "")
		);
		sigungu.disabled = true;

		if (!sidoCode) {
			status.textContent = "시·도를 선택해 주세요.";
			return;
		}
		status.textContent = "시·군·구 목록을 불러오는 중입니다.";
		try {
			// 기존 SGIS API 재사용 (캐시 적용된 API)
			const regions = await fetchRegions(sidoCode);
			// 다른 시·도를 선택했다면 이전 응답 무시
			if (
				currentRequest !== requestId ||
				sido.value !== sidoCode ||
				!root.isConnected
			) {
				return;
			}
			for (const region of regions) {
				sigungu.add(
					new Option(
						region.addr_name,
						String(region.cd)
					)
				);
			}
			// 저장된 값 복원
			sigungu.value = selected;

			// 저장된 코드가 목록에 없으면 기본값 유지
			if (sigungu.selectedIndex === -1) {
				sigungu.value = "";
			}
			sigungu.disabled = readOnly;
			status.textContent =
				"시·군·구를 선택해 주세요.";
		} catch (error) {
			if (currentRequest !== requestId) return;

			console.error("시·군·구 조회 오류:", error);
			status.textContent = "시·군·구를 불러오지 못했습니다.";
		}
	}
	// 시·도 변경 시 시·군·구 다시 조회
	if (!readOnly) {
		sido.addEventListener("change", () => {
			renderDistricts();
		});
	}
	// 이어하기 / 완료 후 다시보기에서 사용
	root.renderIdentityDistricts = renderDistricts;

	return {
		loadSido: renderSido,
		loadSigungu: renderDistricts
	};
}

// 신청인 기본정보 자동 입력
async function loadMemberProfile(root) {
	try {
		const response = await fetch("/api/mypage/profile");

		if (!response.ok) {
			throw new Error("회원정보 조회 실패");
		}

		const profile = await response.json();

		// 실제 JSP ID 사용
		const nameInput = root.querySelector("#identityApplicantName");
		const frontInput = root.querySelector("#identityResidentNoFront");
		const backInput = root.querySelector("#identityResidentNoBack");

		// 성명
		if (nameInput) {
			nameInput.value = profile.memberName ?? "";
		}

		// 주민등록번호 앞 6자리 (생년월일)
		if (frontInput && profile.birthDate) {
			const match = String(profile.birthDate).match(
				/^(\d{4})-(\d{2})-(\d{2})$/
			);

			frontInput.value = match
				? `${match[1].slice(2)}${match[2]}${match[3]}`
				: "";
		}

		// 실제 주민등록번호가 아닌 표시용 별표
		if (backInput) {
			backInput.value = "*******";
		}

	} catch (error) {
		console.error("신청인 기본정보 자동 입력 실패:", error);
	}
}

export async function init({ root, progressId, stepId, readOnly = false, savedData = null }) {
	if (!root) return;
	uploadedPhotoByRoot.set(root, null);
	root.dataset.identityProgressId = progressId ?? "";
	const addressSelects = setupAddressSelects(root, readOnly);

	// 시·도 목록이 준비될 때까지 대기
	await addressSelects?.loadSido();

	initIdentityStepUi(root, { readOnly });

	await loadMemberProfile(root);

	// 저장된 답변은 다른 단계와 동일한 기존 API로 읽는다.
	if (savedData) {
		await restore({ root, data: savedData, readOnly });
	} else if (progressId && stepId) {
		const response = await fetch(`/api/simulation/answers/${progressId}/${stepId}`);
		if (!response.ok) throw new Error(`주민등록증 재발급 답변 조회 실패 (${response.status})`);
		const answers = await response.json();
		const data = {};
		for (const answer of answers) {
			if (answer.isJson || answer.is_json) {
				try { data[answer.fieldKey] = JSON.parse(answer.answerValue); }
				catch { data[answer.fieldKey] = answer.answerValue; }
			} else {
				data[answer.fieldKey] = answer.answerValue;
			}
		}
		if (Object.keys(data).length) await restore({ root, data, readOnly });
	}

	if (readOnly) {
		root.querySelectorAll("input, textarea, select, button").forEach(el => { el.disabled = true; });
	}
}

// 증명사진 S3 업로드
export async function uploadAttachments({ root, progressId }) {

	const input = $(root, "#identityPhotoInput");
	const file = input?.files?.[0];

	// 새 파일을 선택하지 않았다면 기존 업로드 사진을 재검증한 결과만 사용
	if (!file) {
		const savedPhoto = getUploadedPhoto(root);
		if (!savedPhoto) {
			throw new Error("증명사진이 선택되지 않았습니다.");
		}
		const savedInspection = getPhotoInspection(root);
		if (savedInspection.status !== "passed" ||
			savedInspection.photoKey !== savedPhoto.s3Key) {
			throw new Error("저장된 증명사진 검사에 통과해야 합니다.");
		}
		if (!isChecked(root, "#identityPhotoRecentConfirmed") ||
			!isChecked(root, "#identityPhotoAppearanceConfirmed")) {
			throw new Error("증명사진 촬영 조건을 모두 확인해 주세요.");
		}
		return;
	}

	if (!progressId) {
		throw new Error("시뮬레이션 진행 ID가 없습니다.");
	}

	// 파일 선택 및 UI 검사를 건너뛰어 업로드 함수를 직접 호출하는 경우도 차단
	const inspection = getPhotoInspection(root);
	if (inspection.status !== "passed" || inspection.file !== file) {
		throw new Error("증명사진의 형식, 용량, 해상도 및 비율 검사를 통과해야 합니다.");
	}
	if (!isChecked(root, "#identityPhotoRecentConfirmed") ||
		!isChecked(root, "#identityPhotoAppearanceConfirmed")) {
		throw new Error("증명사진 촬영 조건을 모두 확인해 주세요.");
	}

	// 실제 S3 업로드
	const result = await uploadAttachment({
		url: `/api/simulation/identity/${progressId}/photo`,
		file
	});

	if (!result?.s3Key ||
		!result?.fileName ||
		!Number.isSafeInteger(Number(result?.fileSize)) ||
		Number(result.fileSize) <= 0) {

		throw new Error("증명사진 업로드 응답이 올바르지 않습니다.");
	}

	// 업로드 성공 정보 보관
	uploadedPhotoByRoot.set(root, result);

	// 동일 파일 재업로드 방지
	input.value = "";

	// S3 업로드 직전 통과한 검사 결과를 재사용 (추가 GET 요청 방지)
	await renderSavedPhotoPreview(root, result, progressId, { preserveValidation: true });

}

export function getData({ root }) {

	return {
		// 신청인 정보
		phone: [
			"#identityPhoneFirst",
			"#identityPhoneMiddle",
			"#identityPhoneLast"
		].map(sel => value(root, sel)).join("-"),

		sido: value(root, "#identitySido"),
		sigungu: value(root, "#identitySigungu"),

		// 신청 내용
		icChipIncluded: checked(root, "icChipIncluded"),
		reissueReason: checked(root, "reissueReason"),
		feeExemption: checked(root, "feeExemption"),
		pickupNotice: checked(root, "pickupNotice"),
		brailleSticker: checked(root, "brailleSticker"),
		noticeConfirmed: isChecked(root, "#identityNoticeConfirmed"),

		// 수령기관
		pickupOffice: value(root, "#identityPickupOfficeCode"),

		// 구비서류 열람 사전동의 (다중 선택)
		basicLivelihoodConsent:
			root.querySelector(
				'input[name="documentConsent"][value="BASIC_LIVELIHOOD"]'
			)?.checked ? "Y" : "N",

		patriotFamilyConsent:
			root.querySelector(
				'input[name="documentConsent"][value="PATRIOT_FAMILY"]'
			)?.checked ? "Y" : "N",

		singleParentConsent:
			root.querySelector(
				'input[name="documentConsent"][value="SINGLE_PARENT"]'
			)?.checked ? "Y" : "N",

		// 증명사진 S3 메타데이터
		photoS3Key: getUploadedPhoto(root)?.s3Key ?? "",
		photoFileName: getUploadedPhoto(root)?.fileName ?? "",
		photoFileSize: getUploadedPhoto(root)?.fileSize != null
			? String(getUploadedPhoto(root).fileSize)
			: ""
	};
}


export async function restore({ root, data = {}}) {
	// 휴대전화번호
	const phone = String(data.phone ?? "").split("-");

	[
		"#identityPhoneFirst",
		"#identityPhoneMiddle",
		"#identityPhoneLast"
	].forEach((sel, i) => {
		const el = $(root, sel);
		if (el) el.value = phone[i] ?? "";
	});

	// 주소 복원
	const sido = $(root, "#identitySido");
	if (sido) {
		sido.value = data.sido ?? "";
	}

	await root.renderIdentityDistricts?.(
		data.sigungu ?? ""
	);

	// 신청 내용 복원
	[
		"icChipIncluded",
		"reissueReason",
		"feeExemption",
		"pickupNotice",
		"brailleSticker"
	].forEach(name => {
		radio(root, name, data[name] ?? "");
	});

	root.syncIdentityOtherReason?.();

	// 유의사항 확인
	const notice = $(root, "#identityNoticeConfirmed");
	if (notice) {
		notice.checked =
			data.noticeConfirmed === true ||
			data.noticeConfirmed === "true";
	}

	// 수령기관 복원
	const office = $(root, "#identityPickupOffice");

	if (office) {
		office.value = data.pickupOffice ?? "";
	}


	// 구비서류 체크 상태 복원
	const consentFields = {
		BASIC_LIVELIHOOD: "basicLivelihoodConsent",
		PATRIOT_FAMILY: "patriotFamilyConsent",
		SINGLE_PARENT: "singleParentConsent"
	};

	const checkboxes = [
		...root.querySelectorAll('input[name="documentConsent"]')
	];

	checkboxes.forEach(checkbox => {
		const fieldKey = consentFields[checkbox.value];

		checkbox.checked = fieldKey
			? data[fieldKey] === "Y"
			: false;
	});

	// 전체선택 상태 동기화
	const all = root.querySelector("#identityConsentAll");

	if (all) {
		all.checked = checkboxes.length > 0 &&
			checkboxes.every(checkbox => checkbox.checked);
	}

	// 증명사진 S3 정보 복원
	const photo = data.photoS3Key
		? {
			s3Key: data.photoS3Key,
			fileName: data.photoFileName ?? "",
			fileSize: Number(data.photoFileSize ?? 0)
		}
		: null;

	uploadedPhotoByRoot.set(root, photo);

	const progressId = root.dataset.identityProgressId;

	if (photo && progressId) {
		await renderSavedPhotoPreview(root, photo, progressId);
	}
	return true;
}

function focusValidationTarget(root, target) {
	const element = typeof target === "string" ? root.querySelector(target) : target;
	if (!element || element.disabled || !element.getClientRects().length) return;

	// 버튼은 JS로 focus()해도 :focus-visible이 안 보일 수 있으므로
	// 프로젝트의 공통 validation-focus 스타일을 사용한다.
	if (element.matches("button")) {
		element.classList.add("validation-focus");
		element.addEventListener("blur", () => element.classList.remove("validation-focus"), { once: true });
	}
	element.focus({ preventScroll: true });
	element.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function validate({ root }) {
	const fail = (message, target) => {
		alert(message);
		focusValidationTarget(root, target);
		return false;
	};
	for (const [name, label] of [
		["icChipIncluded", "발급 형태"],
		["reissueReason", "재발급 사유"],
		["feeExemption", "수수료 면제 신청"],
		["pickupNotice", "수령 안내 서비스"],
		["brailleSticker", "점자 스티커 제공 서비스"]
	]) {
		if (!checked(root, name)) {
			return fail(`${label} 항목을 입력해 주세요.`, `input[name="${name}"]:not(:disabled)`);
		}
	}

	if (!value(root, "#identitySido")) return fail("주소 항목을 입력해 주세요.", "#identitySido");
	if (!value(root, "#identitySigungu")) return fail("주소 항목을 입력해 주세요.", "#identitySigungu");
	if (!value(root, "#identityPickupOfficeCode")) {
		// 수령기관 코드는 hidden input이므로 검색 버튼을 포커스한다.
		return fail("수령지역 항목을 입력해 주세요.", "#identityPickupOffice");
	}

	const parts = ["#identityPhoneFirst", "#identityPhoneMiddle", "#identityPhoneLast"]
		.map(selector => value(root, selector));
	if (!/^01\d$/.test(parts[0])) return fail("휴대전화번호를 확인해 주세요.", "#identityPhoneFirst");
	if (!/^\d{3,4}$/.test(parts[1])) return fail("휴대전화번호를 확인해 주세요.", "#identityPhoneMiddle");
	if (!/^\d{4}$/.test(parts[2])) return fail("휴대전화번호를 확인해 주세요.", "#identityPhoneLast");

	if (!isChecked(root, "#identityNoticeConfirmed")) {
		return fail("유의사항 확인이 필요합니다.", "#identityNoticeConfirmed");
	}
	const consentItems = [...root.querySelectorAll('input[name="documentConsent"]')];
	if (consentItems.length !== 3 || !consentItems.every(input => input.checked)) {
		return fail("구비서류 열람 사전동의 항목에 모두 동의해 주세요.",
			consentItems.find(input => !input.checked) || consentItems[0]);
	}

	const photo = $(root, "#identityPhotoInput")?.files?.[0];
	const uploadedPhoto = getUploadedPhoto(root);
	if (!photo && !uploadedPhoto) {
		return fail("증명사진 1장을 첨부해 주세요.", "#identityPhotoInput");
	}
	const inspection = getPhotoInspection(root);
	const isCurrentPhoto = photo
		? inspection.file === photo
		: inspection.photoKey === uploadedPhoto?.s3Key;
	if (inspection.status !== "passed" || !isCurrentPhoto) {
		const message = inspection.status === "checking"
			? "증명사진 검사 중입니다. 검사가 완료된 뒤 다시 시도해 주세요."
			: "증명사진의 형식, 용량, 해상도 및 비율을 모두 통과해야 신청할 수 있습니다.";
		return fail(message, "#identityPhotoInput");
	}

	// 촬영 조건은 이미지 분석이 아닌 사용자의 별도 확인 사항이다.
	if (!isChecked(root, "#identityPhotoRecentConfirmed")) {
		return fail("최근 6개월 촬영 여부와 정면 상반신 사진 여부를 모두 확인해 주세요.", "#identityPhotoRecentConfirmed");
	}
	if (!isChecked(root, "#identityPhotoAppearanceConfirmed")) {
		return fail("최근 6개월 촬영 여부와 정면 상반신 사진 여부를 모두 확인해 주세요.", "#identityPhotoAppearanceConfirmed");
	}
	return true;
}
