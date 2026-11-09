/**
 * 해봄 | 주민등록증 재발급 단일 단계
 * 공통 simulation.js 모듈 규약: init / getData / validate / restore
 *
 * 주의: 증명사진은 선택·미리보기만 지원한다.
 * S3 이미지 업로드 API가 아직 없어 uploadAttachments()는 구현하지 않았다.
 * 실제 완료 연동 전에는 사진 업로드 및 서버 Validator를 연결해야 한다.
 */
import { fetchRegions } from "../utils/sgis-api.js";
import { initIdentityStepUi } from "./step1-ui.js";
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

// 구비서류 열람 사전동의 전체 선택
function checkConsent(root, selected) {
	const values = new Set(Array.isArray(selected) ? selected : []);
	root.querySelectorAll('input[name="documentConsent"]').forEach(input => {
		input.checked = values.has(input.value);
	});
	const items = [...root.querySelectorAll('input[name="documentConsent"]')];
	const all = $(root, "#identityConsentAll");
	if (all) all.checked = items.length > 0 && items.every(input => input.checked);
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

// 생년월일 → 주민등록번호 앞 6자리
function maskResidentNumber(birthDate) {
	if (!birthDate) return "";

	const match = String(birthDate).match(
		/^(\d{4})-(\d{2})-(\d{2})$/
	);

	if (!match) return "";

	const [, year, month, day] = match;

	return `${year.slice(2)}${month}${day}-*******`;
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

	// 새 파일을 선택하지 않았다면 기존 업로드 사진 유지
	if (!file) {
		if (getUploadedPhoto(root)) {
			return;
		}

		throw new Error("증명사진이 선택되지 않았습니다.");
	}

	if (!progressId) {
		throw new Error("시뮬레이션 진행 ID가 없습니다.");
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

	// S3에 업로드된 사진으로 미리보기 전환
	renderSavedPhotoPreview(root, result, progressId);

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


export async function restore({ root, data = {}, readOnly = false }) {
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
		renderSavedPhotoPreview(root, photo, progressId);
	}
	return true;
}

export function validate({ root }) {
	const required = [
		[checked(root, "icChipIncluded"), "발급 형태"],
		[checked(root, "reissueReason"), "재발급 사유"],
		[checked(root, "feeExemption"), "수수료 면제 신청"],
		[checked(root, "pickupNotice"), "수령 안내 서비스"],
		[checked(root, "brailleSticker"), "점자 스티커 제공 서비스"],
		[value(root, "#identitySido") && value(root, "#identitySigungu"), "주소"],
		[value(root, "#identityPickupOfficeCode"), "수령지역"]
	];
	for (const [val, label] of required) {
		if (!val) { alert(`${label} 항목을 입력해 주세요.`); return false; }
	}
	const phone = ["#identityPhoneFirst", "#identityPhoneMiddle", "#identityPhoneLast"]
		.map(sel => value(root, sel)).join("-");
	if (!/^01\d-\d{3,4}-\d{4}$/.test(phone)) {
		alert("휴대전화번호를 확인해 주세요."); return false;
	}
	if (!isChecked(root, "#identityNoticeConfirmed")) {
		alert("유의사항 확인이 필요합니다."); return false;
	}
	const consentItems = [
		...root.querySelectorAll('input[name="documentConsent"]')
	];

	if (consentItems.length !== 3 ||
		!consentItems.every(input => input.checked)) {

		alert("구비서류 열람 사전동의 항목에 모두 동의해 주세요.");
		return false;
	}
	const photo = $(root, "#identityPhotoInput")?.files?.[0];
	const uploadedPhoto = getUploadedPhoto(root);

	// 새로 선택한 사진도 없고 기존 업로드 사진도 없다면 오류
	if (!photo && !uploadedPhoto) {
		alert("증명사진 1장을 첨부해 주세요.");
		return false;
	}

	if (photo) {
		// 확장자 및 용량 사전 검증
		if (!/\.(jpe?g|png)$/i.test(photo.name)) {
			alert("JPG, JPEG, PNG 파일만 첨부할 수 있습니다.");
			return false;
		}

		if (photo.size <= 0 || photo.size > 5 * 1024 * 1024) {
			alert("증명사진은 5MB 이하만 첨부할 수 있습니다.");
			return false;
		}
	}
	return true;
}
