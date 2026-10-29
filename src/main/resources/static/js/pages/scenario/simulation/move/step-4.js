// ============================================================
// 해봄 | 전입신고 4단계: 현재 거주지 및 세대 구성
// 공통 simulation.js 계약: init({root, progressId, stepId, readOnly}),
// validate({root}), getData({root})
// 추가: restore({root, data, readOnly}) - 서버 저장 답변을 읽어온 뒤 복원용
// 주의: 4단계 DB 저장(save)은 아직 연결하지 않음.
// ============================================================

const JUSO_POPUP_URL = "/address/juso/popup";
const VIRTUAL_WELFARE_CENTER = "해봄동 행정복지센터 (가상)";
const PHONE_PATTERN = /^010-\d{4}-\d{4}$/;
const RELATIONS = [
	["", "관계 선택"],
	["SPOUSE", "배우자"], ["CHILD", "자녀"],
	["FATHER", "부"], ["MOTHER", "모"], ["OTHER", "기타"]
];
const RELATION_LABELS = Object.fromEntries([["SELF", "본인"], ...RELATIONS]);
const ADDRESS_FIELDS = {
	newRoadAddress: "roadAddress", newZipNo: "zipNo", newDetailAddress: "detailAddress",
	newJibunAddress: "jibunAddress", newAdmCd: "admCd", newRnMgtSn: "rnMgtSn",
	newBdMgtSn: "bdMgtSn", newSiNm: "sidoName", newSggNm: "sigunguName",
	newEmdNm: "emdName", newBuildingPosition: "buildingPosition",
	newBuildingMainNo: "buildingMainNo", newBuildingSubNo: "buildingSubNo"
};

// 모듈 상태는 init 때마다 초기화. 입력값은 DOM에 유지하고, 진행 ID별 임시 답변은 drafts로 보관.
let movingFamilies = [];
let applicant = null;
let originalMovingHead = null;
let selectedNewHeadId = null;
let addressSelected = false;
let existingHeadMockConfirmed = false;
let activeRoot = null;
let activeProgressId = null;
const drafts = new Map(); // 브라우저 페이지가 살아 있는 동안만 유지. DB/새로고침 저장 아님.

const $ = (root, id) => root.querySelector(`#${id}`);
const sameId = (a, b) => a != null && b != null && String(a) === String(b);
const isApplicant = family => family.isApplicant === true;
const isOriginalHead = family => family.isOriginalHead === true;
const birthLabel = value => {
	const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
	return match ? `${match[1]}년 ${match[2]}월 ${match[3]}일` : (value || "-");
};
const genderLabel = value => value === "M" ? "남" : value === "F" ? "여" : "-";
const familySignature = () => movingFamilies.map(f => String(f.familyId)).sort().join(",");

async function fetchMovingFamilies(progressId) {
	const response = await fetch(`/api/simulation/move/${progressId}/family?moveStatus=MOVE`);
	if (!response.ok) throw new Error(`이사 대상 가족 조회 실패 (HTTP ${response.status})`);
	const data = await response.json();
	if (!Array.isArray(data)) throw new Error("가족 조회 응답은 배열이어야 합니다.");
	return data;
}

function addTextCell(row, value, className = "") {
	const cell = document.createElement("td");
	cell.textContent = value ?? "-";
	if (className) cell.className = className;
	row.appendChild(cell);
	return cell;
}

function createRelationSelect(family) {
	const select = document.createElement("select");
	select.className = "form-select form-select-sm move-step4-relation-select";
	select.dataset.familyId = String(family.familyId);
	select.setAttribute("aria-label", `${family.familyName} 세대주와의 관계`);
	// SELF는 선택지에 넣지 않음: 실제 선택된 세대주만 자동으로 SELF.
	for (const [code, label] of RELATIONS) select.add(new Option(label, code));
	return select;
}


function createPhoneGroup(name, familyId) {
	const group = document.createElement("div");
	group.className = "move-step4-phone-fields move-step4-family-phone";
	group.dataset.familyId = String(familyId);

	[3, 4, 4].forEach((length, index) => {
		if (index > 0) {
			const separator = document.createElement("span");
			separator.textContent = "–";
			separator.setAttribute("aria-hidden", "true");
			group.appendChild(separator);
		}

		const input = document.createElement("input");
		input.type = "tel";
		input.inputMode = "numeric";
		input.autocomplete = "off";
		input.className = "form-control form-control-sm";
		input.maxLength = length;
		input.required = true;

		input.setAttribute(
			"aria-label",
			`${name} 휴대전화번호 ${["앞", "가운데", "뒤"][index]}자리`
		);

		// 전화번호 기본값 및 placeholder
		input.value = index === 0 ? "010" : "";
		input.placeholder = index === 0 ? "010" : "0000";

		// 숫자만 입력 가능
		input.addEventListener("input", () => {
			input.value = input.value.replace(/\D/g, "").slice(0, length);
		});

		group.appendChild(input);
	});

	return group;
}


function readPhone(group) {
	if (!group) return null;
	const parts = [...group.querySelectorAll("input")].map(input => input.value.trim());
	return parts.some(Boolean) ? parts.join("-") : null;
}

function fillPhone(group, phone) {
	if (!group) return;
	const values = PHONE_PATTERN.test(phone || "") ? phone.split("-") : ["", "", ""];
	group.querySelectorAll("input").forEach((input, i) => { input.value = values[i]; });
}

// 2단계에서 simulation_family.phone_num에 저장한 신청인 연락처만 초기값으로 사용.
// 가족 조회 API 응답에 phoneNum이 포함되어 있어야 함. 다른 가족은 항상 공란.
function getApplicantInitialPhone() {
	const stored = String(applicant?.phoneNum || "").trim();
	if (PHONE_PATTERN.test(stored)) return stored;
	// 구분자 없이 11자리로 저장된 기존 번호도 표시할 수 있도록 처리.
	const digits = stored.replace(/\D/g, "");
	return /^010\d{8}$/.test(digits)
		? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
		: null;
}

function fillApplicantInitialPhone(root) {
	if (!applicant) return;
	const phone = getApplicantInitialPhone();
	if (!phone) return;
	// KEEP / CHANGE / JOIN 각각의 가족 표가 이미 한 번씩 생성된 상태.
	for (const group of root.querySelectorAll(".move-step4-family-phone")) {
		if (sameId(group.dataset.familyId, applicant.familyId)) fillPhone(group, phone);
	}
}

// 동일한 신청인이 세 화면에 중복 표시되므로, 사용자가 고친 번호도 동기화.
// 다른 가족의 번호에는 손대지 않음.
function syncApplicantPhoneAcrossModes(root, sourceGroup) {
	if (!applicant || !sourceGroup || !sameId(sourceGroup.dataset.familyId, applicant.familyId)) return;
	const sourceInputs = [...sourceGroup.querySelectorAll("input")];
	for (const group of root.querySelectorAll(".move-step4-family-phone")) {
		if (group === sourceGroup || !sameId(group.dataset.familyId, applicant.familyId)) continue;
		group.querySelectorAll("input").forEach((input, index) => {
			input.value = sourceInputs[index]?.value || "";
		});
	}
}

function addPhoneCell(row, family) {
	const td = document.createElement("td");
	// 전화번호 입력 그룹 생성
	const group = createPhoneGroup(
		family.familyName,
		family.familyId
	);

	// DB에서 조회한 가족별 전화번호 복원
	if (family.phoneNum) {
		const parts = family.phoneNum.split("-");
		const inputs = group.querySelectorAll("input");

		inputs.forEach((input, index) => {
			input.value = parts[index] ?? "";
		});
	}

	td.appendChild(group);
	row.appendChild(td);
}

function addIdentityCells(row, family) {
	addTextCell(row, family.familyName);
	addTextCell(row, birthLabel(family.birthDate));
	addTextCell(row, genderLabel(family.gender));
}

function renderKeepOriginalHeadTable(root) {
	const tbody = $(root, "keepOriginalHeadTableBody");
	tbody.replaceChildren();
	for (const family of movingFamilies) {
		const row = document.createElement("tr");
		row.dataset.familyId = String(family.familyId);
		const relationship = isOriginalHead(family) ? "SELF" : family.originalRelationship;
		addTextCell(row, RELATION_LABELS[relationship] || "미등록");
		addIdentityCells(row, family);
		addPhoneCell(row, family); // 기본은 빈칸, 신청인만 init()에서 기존 번호를 채움
		tbody.appendChild(row);
	}
}

function renderChangeNewHeadTable(root) {
	const tbody = $(root, "changeNewHeadTableBody");
	tbody.replaceChildren();
	for (const family of movingFamilies) {
		const row = document.createElement("tr");
		const familyId = String(family.familyId);
		row.dataset.familyId = familyId;

		const radioTd = document.createElement("td");
		const radio = document.createElement("input");
		radio.type = "radio";
		radio.name = "newHeadFamilyId";
		radio.value = familyId;
		radio.className = "form-check-input";
		radio.setAttribute("aria-label", `${family.familyName} 새 세대주 선택`);
		radioTd.appendChild(radio);
		row.appendChild(radioTd);

		const relationshipTd = document.createElement("td");
		const select = createRelationSelect(family);

		// 세대주로 선택되면 표시할 '본인' 옵션 추가
		select.add(new Option("본인", "SELF"), 1);

		// DB에 저장된 관계 복원
		select.value = family.relationship ?? "";

		relationshipTd.appendChild(select);
		row.appendChild(relationshipTd);

		addIdentityCells(row, family);
		addPhoneCell(row, family);
		tbody.appendChild(row);
	}
}

function renderExistingHouseholdTable(root) {
	const tbody = $(root, "existingHouseholdTableBody");
	tbody.replaceChildren();
	for (const family of movingFamilies) {
		const row = document.createElement("tr");
		row.dataset.familyId = String(family.familyId);
		const relationTd = document.createElement("td");
		const select = createRelationSelect(family);
		relationTd.appendChild(select);
		select.value = family.relationship ?? "";
		row.appendChild(relationTd);
		addIdentityCells(row, family);
		addPhoneCell(row, family);
		tbody.appendChild(row);
	}
}

function getMode(root) {
	return root.querySelector('input[name="householdType"]:checked')?.value || null;
}
function getStrategy(root) {
	// 혼자 이사한 경우에는 원래 세대주 여부와 관계없이 본인이 자동으로 새 세대주.
	if (movingFamilies.length === 1) return "CHANGE_HEAD";
	if (!originalMovingHead) return "CHANGE_HEAD";
	return root.querySelector('input[name="emptyHeadType"]:checked')?.value || null;
}
function getCurrentHeadId(root) {
	if (getStrategy(root) === "KEEP_ORIGINAL") return originalMovingHead?.familyId ?? null;
	return selectedNewHeadId;
}

function updateChangeHeadRows(root, resetRelations = false) {
	const tbody = $(root, "changeNewHeadTableBody");

	for (const row of tbody.querySelectorAll("tr[data-family-id]")) {
		const isHead = sameId(row.dataset.familyId, selectedNewHeadId);
		const radio = row.querySelector('input[name="newHeadFamilyId"]');
		const select = row.querySelector("select[data-family-id]");

		radio.checked = isHead;

		if (isHead) {
			// 세대주는 '본인' 자동 선택 + 변경 불가
			select.value = "SELF";
			select.disabled = true;
		} else {
			// 다른 가족은 관계 직접 선택 가능
			select.disabled = false;

			if (resetRelations || select.value === "SELF") {
				select.value = "";
			}
		}
	}
}

function updateHouseholdSections(root) {
	const mode = getMode(root);
	const isNew = mode === "NEW_HOUSEHOLD";
	const isSingleMover = movingFamilies.length === 1;
	const strategy = getStrategy(root);
	const options = $(root, "emptyHouseholdOptions");
	const notice = $(root, "noOriginalHeadNotice");
	// 1명만 이사하면 '유지/변경' 라디오와 수동 세대주 선정 안내를 모두 숨김.
	options.classList.toggle("d-none", !isNew || isSingleMover || !originalMovingHead);
	notice.classList.toggle("d-none", !isNew || isSingleMover || Boolean(originalMovingHead));

	const keeping = isNew && strategy === "KEEP_ORIGINAL";
	const changing = isNew && strategy === "CHANGE_HEAD";
	const joining = mode === "JOIN_EXISTING";
	$(root, "keepOriginalHeadSection").classList.toggle("d-none", !keeping);
	$(root, "changeNewHeadSection").classList.toggle("d-none", !changing);
	$(root, "existingHouseholdSection").classList.toggle("d-none", !joining);

	const summary = $(root, "newHouseholdHeadSummary");
	summary.classList.toggle("d-none", !mode);
	if (keeping) {
		summary.textContent = `이사 온 곳 세대주: ${originalMovingHead.familyName} (기존 세대주 유지)`;
	} else if (changing) {
		const head = movingFamilies.find(f => sameId(f.familyId, selectedNewHeadId));
		summary.textContent = head
			? `이사 온 곳 세대주: ${head.familyName}${isSingleMover ? " (자동 지정)" : ""}`
			: "새로운 세대주를 선택해 주세요.";
	} else if (joining) {
		const name = $(root, "existingHeadName").value.trim();
		summary.textContent = name ? `기존 거주 세대주: ${name}` : "기존 거주 세대주 정보를 입력해 주세요.";
	} else {
		summary.textContent = "";
	}
}

// 혼자 이사하는 경우에는 세대주 선택 라디오를 체크 상태로 보여주되 수정은 막음.
// radio에는 readonly 속성이 없으므로 disabled를 사용. getData()는 내부 상태를 읽음.
function setSingleMoverPresentation(root) {
	if (movingFamilies.length !== 1) return;
	const section = $(root, "changeNewHeadSection");
	section.querySelector("h4").firstChild.textContent = "세대주 및 연락처를 확인해 주세요. ";
	section.querySelector(".move-step4-validation-help").textContent =
		"이사 가족이 한 명이므로 신청인이 세대주로 자동 지정됩니다. 연락처를 확인해 주세요.";

	const radio = section.querySelector('input[name="newHeadFamilyId"]');
	if (radio) {
		radio.checked = true;
		radio.disabled = true;
		// Bootstrap의 disabled 투명도로 체크 표시가 흐려지지 않도록 함.
		radio.style.opacity = "1";
		radio.setAttribute("aria-label", "신청인이 세대주로 자동 지정됨 (변경 불가)");
	}
}

function markExistingHeadUnconfirmed(root) {
	existingHeadMockConfirmed = false;
	const status = $(root, "existingHeadConfirmStatus");
	status.textContent = "실제 주민등록번호 입력이나 본인인증 없이 확인 절차만 연습합니다.";
	status.classList.remove("text-success");
}
function mockConfirmExistingHead(root) {
	const name = $(root, "existingHeadName").value.trim();
	if (!name) {
		alert("기존 세대주 가상 이름을 먼저 입력해 주세요.");
		$(root, "existingHeadName").focus();
		return;
	}
	existingHeadMockConfirmed = true;
	const status = $(root, "existingHeadConfirmStatus");
	status.classList.add("text-success");
	status.textContent = `${name} 세대주 확인을 학습용으로 완료했습니다. 실제 인증이나 문자 발송은 하지 않았습니다.`;
}

function applyJusoAddress(root, data) {
	if (!root.isConnected || root !== activeRoot || !data?.roadAddrPart1) return;
	const sameAddress = $(root, "newRoadAddress").value === data.roadAddrPart1;
	$(root, "newRoadAddress").value = data.roadAddrPart1;
	$(root, "newZipNo").value = data.zipNo || "";
	$(root, "newDetailAddress").value = data.addrDetail?.trim() ||
		(sameAddress ? $(root, "newDetailAddress").value : "");
	$(root, "newJibunAddress").value = data.jibunAddr || "";
	$(root, "newAdmCd").value = data.admCd || "";
	$(root, "newRnMgtSn").value = data.rnMgtSn || "";
	$(root, "newBdMgtSn").value = data.bdMgtSn || "";
	$(root, "newSiNm").value = data.siNm || "";
	$(root, "newSggNm").value = data.sggNm || "";
	$(root, "newEmdNm").value = data.emdNm || "";
	$(root, "newBuildingPosition").value = ["0", "1"].includes(data.udrtYn) ? data.udrtYn : "";
	$(root, "newBuildingMainNo").value = data.buldMnnm || "";
	$(root, "newBuildingSubNo").value = data.buldSlno || "";
	$(root, "newAddressResultText").textContent = data.roadAddrPart1;
	$(root, "newWelfareCenter").textContent = VIRTUAL_WELFARE_CENTER;
	$(root, "newAddressResultSection").classList.remove("d-none");
	addressSelected = true;
	$(root, "newAddressStatus").textContent = "주소를 선택했습니다. 세대 구성 정보를 입력해 주세요.";
	cacheDraft(root);
}

function captureFamilies(tbody) {
	return [...tbody.querySelectorAll("tr[data-family-id]")].map(row => ({
		familyId: Number(row.dataset.familyId),
		phoneNum: readPhone(row.querySelector(".move-step4-family-phone")),
		relationship: row.querySelector("select[data-family-id]")?.value || null
	}));
}
export async function save({ root, progressId }) {
	const mode = getMode(root);
	const strategy = mode === "NEW_HOUSEHOLD"
		? getStrategy(root)
		: null;

	const headId = mode === "NEW_HOUSEHOLD"
		? getCurrentHeadId(root)
		: null;

	let familyMembers = [];

	if (mode === "NEW_HOUSEHOLD") {

		const tbody = $(root,
			strategy === "KEEP_ORIGINAL"
				? "keepOriginalHeadTableBody"
				: "changeNewHeadTableBody"
		);

		familyMembers = captureFamilies(tbody).map(item => {
			const family = movingFamilies.find(
				f => sameId(f.familyId, item.familyId)
			);

			const isHead = sameId(item.familyId, headId);

			return {
				familyId: item.familyId,
				isHouseholdHead: isHead,
				relationship: isHead
					? "SELF"
					: strategy === "KEEP_ORIGINAL"
						? family?.originalRelationship ?? null
						: item.relationship,
				phoneNum: item.phoneNum
			};
		});

	} else if (mode === "JOIN_EXISTING") {

		familyMembers = captureFamilies(
			$(root, "existingHouseholdTableBody")
		).map(item => ({
			familyId: item.familyId,
			isHouseholdHead: false,
			relationship: item.relationship,
			phoneNum: item.phoneNum
		}));
	}
	const params = new URLSearchParams();

	familyMembers.forEach((member, index) => {

		params.append(`familyMembers[${index}].familyId`, member.familyId);

		params.append(`familyMembers[${index}].isHouseholdHead`, member.isHouseholdHead);

		if (member.relationship != null) {
			params.append(`familyMembers[${index}].relationship`, member.relationship);
		}

		if (member.phoneNum != null) {
			params.append(`familyMembers[${index}].phoneNum`, member.phoneNum);
		}
	});
	const response = await fetch(`/api/simulation/move/${progressId}/family/current`, {
		method: "PATCH",
		headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
		body: params
	});
	if (!response.ok) {
		const errorText = await response.text();

		console.error("4단계 가족정보 저장 실패:", {
			status: response.status,
			response: errorText,
			familyMembers
		});

		throw new Error("4단계 가족정보 저장에 실패했습니다.");
	}
}

export function getData({ root }) {
	const mode = getMode(root);
	const strategy = mode === "NEW_HOUSEHOLD" ? getStrategy(root) : null;
	const headId = mode === "NEW_HOUSEHOLD"
		? getCurrentHeadId(root)
		: null;
	const currentAddress = {};
	for (const [id, key] of Object.entries(ADDRESS_FIELDS)) {
		currentAddress[key] = $(root, id).value.trim() || null;
	}

	return {
		currentAddress,
		householdType: mode,
		newHeadStrategy: strategy,
		newHouseholdHeadFamilyId: headId == null ? null : Number(headId),
		existingHeadName: mode === "JOIN_EXISTING" ? $(root, "existingHeadName").value.trim() || null : null,
		existingHeadPhoneNum: mode === "JOIN_EXISTING" ? readPhone($(root, "existingHeadPhoneGroup")) : null,
		existingHeadCheck: mode === "JOIN_EXISTING" && existingHeadMockConfirmed ? "SIMULATED" : null,
		additionalServices: [...root.querySelectorAll('input[name="additionalService"]:checked')].map(input => input.value)
	};
}

function cacheDraft(root) {
	if (root !== activeRoot || activeProgressId == null || !movingFamilies.length) return;
	drafts.set(String(activeProgressId), {
		signature: familySignature(),
		data: getData({ root })
	});
}

function restoreData(root, data) {
	if (!data || typeof data !== "object") return;
	const addr = data.currentAddress || {};
	for (const [id, key] of Object.entries(ADDRESS_FIELDS)) {
		$(root, id).value = addr[key] == null ? "" : String(addr[key]);
	}
	addressSelected = Boolean(addr.roadAddress);
	$(root, "newAddressResultSection").classList.toggle("d-none", !addressSelected);
	$(root, "newAddressResultText").textContent = addr.roadAddress || "-";
	$(root, "newWelfareCenter").textContent = VIRTUAL_WELFARE_CENTER;
	if (addressSelected) $(root, "newAddressStatus").textContent = "선택한 주소를 복원했습니다.";

	root.querySelectorAll('input[name="householdType"]').forEach(input => {
		input.checked = input.value === data.householdType;
	});
	const strategy = movingFamilies.length === 1 ? "CHANGE_HEAD"
		: originalMovingHead ? (data.newHeadStrategy || "KEEP_ORIGINAL") : "CHANGE_HEAD";
	root.querySelectorAll('input[name="emptyHeadType"]').forEach(input => {
		input.checked = input.value === strategy;
	});
	const requestedHeadId = data.newHouseholdHeadFamilyId;
	selectedNewHeadId = movingFamilies.length === 1 ? String(applicant.familyId)
		: movingFamilies.some(f => sameId(f.familyId, requestedHeadId))
			? String(requestedHeadId) : null;
	updateChangeHeadRows(root);
	$(root, "existingHeadName").value = data.existingHeadName || "";
	existingHeadMockConfirmed = data.existingHeadCheck === "SIMULATED";
	const status = $(root, "existingHeadConfirmStatus");
	status.classList.toggle("text-success", existingHeadMockConfirmed);
	status.textContent = existingHeadMockConfirmed
		? "저장된 모의 확인 상태입니다. 실제 신원 확인 기록은 아닙니다."
		: "실제 주민등록번호 입력이나 본인인증 없이 확인 절차만 연습합니다.";
	fillPhone($(root, "existingHeadPhoneGroup"), data.existingHeadPhoneNum);

	const rowsId = data.householdType === "JOIN_EXISTING" ? "existingHouseholdTableBody"
		: strategy === "KEEP_ORIGINAL" ? "keepOriginalHeadTableBody" : "changeNewHeadTableBody";
	const target = $(root, rowsId);
	for (const item of Array.isArray(data.familyRelations) ? data.familyRelations : []) {
		const row = [...target.querySelectorAll("tr[data-family-id]")]
			.find(tr => sameId(tr.dataset.familyId, item.familyId));
		if (!row) continue;
		fillPhone(row.querySelector(".move-step4-family-phone"), item.phoneNum);
		const select = row.querySelector("select[data-family-id]");
		if (select && !sameId(item.familyId, selectedNewHeadId)) select.value = item.relationship || "";
	}
	// 저장된 4단계 신청인 번호가 있다면 2단계 DB 초기값보다 우선하며
	// 다른 세대 구성 화면에서도 동일한 번호가 보이도록 맞춤.
	const restoredApplicantRow = [...target.querySelectorAll("tr[data-family-id]")]
		.find(row => sameId(row.dataset.familyId, applicant?.familyId));
	if (restoredApplicantRow) {
		syncApplicantPhoneAcrossModes(root, restoredApplicantRow.querySelector(".move-step4-family-phone"));
	}
	root.querySelectorAll('input[name="additionalService"]').forEach(input => {
		input.checked = Array.isArray(data.additionalServices) && data.additionalServices.includes(input.value);
	});
	updateHouseholdSections(root);
}

function disableForReadOnly(root) {
	root.querySelectorAll("input, select, button, textarea").forEach(input => {
		if (input.type !== "hidden") input.disabled = true;
	});
}

// 서버에서 읽어온 JSON을 이 함수로 전달하면 완료 후 다시보기 화면을 구성할 수 있음.
export function restore({ root, data, readOnly = false }) {
	if (root !== activeRoot || !movingFamilies.length) return false;
	restoreData(root, data);
	if (readOnly) disableForReadOnly(root);
	return true;
}


// ==============================
// 전입신고 4단계 저장된 입력값 조회
// ==============================
async function fetchSavedAnswers(progressId, stepId) {

	const response = await fetch(
		`/api/simulation/answers/${progressId}/${stepId}`
	);

	if (!response.ok) {
		throw new Error("4단계 입력값 조회 실패");
	}

	const answers = await response.json();

	const jsonFields = [
		"currentAddress",
		"familyRelations",
		"additionalServices"
	];

	const data = {};

	for (const answer of answers) {
		data[answer.fieldKey] = jsonFields.includes(answer.fieldKey)
			? JSON.parse(answer.answerValue)
			: answer.answerValue;
	}

	return Object.keys(data).length > 0 ? data : null;
}


export async function init({ root, progressId, stepId, readOnly = false, savedData = null }) {
	activeRoot = root;
	activeProgressId = progressId;
	movingFamilies = [];
	applicant = null;
	originalMovingHead = null;
	selectedNewHeadId = null;
	addressSelected = false;
	existingHeadMockConfirmed = false;
	// 신청인만 2단계에서 저장한 전화번호를 초기값으로 사용하고, 다른 가족은 공란.
	window.jusoCallBack = data => applyJusoAddress(root, data);

	try {
		const data = await fetchMovingFamilies(progressId);
		if (!root.isConnected || root !== activeRoot) return;
		movingFamilies = data;
		if (!movingFamilies.length) throw new Error("3단계에서 이사 대상으로 선택한 가족이 없습니다.");
		applicant = movingFamilies.find(isApplicant) || null;
		if (!applicant) throw new Error("이사 대상 가족 중 신청인이 없습니다. 3단계를 확인해 주세요.");
		originalMovingHead = movingFamilies.find(isOriginalHead) || null;

		// 테이블은 진입할 때 한 번만 생성! 라디오 선택 시 다시 그리지 않으므로 전화번호가 날아가지 않음.
		renderKeepOriginalHeadTable(root);
		renderChangeNewHeadTable(root);
		renderExistingHouseholdTable(root);
		setSingleMoverPresentation(root);
		// 테이블 생성 후 최초 1회: 신청인만 저장된 연락처 자동 입력.
		fillApplicantInitialPhone(root);
		// 1명 이사는 세대주 자동 지정. 여러 명일 때만 기존 선택 절차 유지.
		if (movingFamilies.length === 1) selectedNewHeadId = String(applicant.familyId);
		$(root, "emptyHeadKeep").checked = movingFamilies.length > 1 && Boolean(originalMovingHead);
		$(root, "emptyHeadKeepLabel").textContent = originalMovingHead
			? `세대주 (${originalMovingHead.familyName})님으로 유지` : "기존 세대주 유지";
		updateChangeHeadRows(root);
		updateHouseholdSections(root);

		// 저장된 입력값 조회
		const storedData = savedData ?? await fetchSavedAnswers(progressId, stepId);

		// 기존 임시 저장값
		const draft = drafts.get(String(progressId));

		if (storedData) {
			// DB에 저장된 입력값 우선 복원
			restoreData(root, storedData);

		} else if (!readOnly && draft?.signature === familySignature()) {
			// DB 저장값이 없으면 임시 입력값 복원
			restoreData(root, draft.data);
		}

		if (readOnly) {
			disableForReadOnly(root);
			return;
		}

		$(root, "searchNewAddressBtn").addEventListener("click", () => {
			const popup = window.open(JUSO_POPUP_URL, "haebomJusoPopup", "width=570,height=650,scrollbars=yes,resizable=yes");
			if (!popup) $(root, "newAddressStatus").textContent = "팝업이 차단되었습니다. 브라우저 팝업 허용을 확인해 주세요.";
			else popup.focus();
		});
		root.querySelectorAll('input[name="householdType"]').forEach(input => {
			input.addEventListener("change", () => { updateHouseholdSections(root); cacheDraft(root); });
		});
		root.querySelectorAll('input[name="emptyHeadType"]').forEach(input => {
			input.addEventListener("change", () => { updateHouseholdSections(root); cacheDraft(root); });
		});
		$(root, "changeNewHeadTableBody").addEventListener("change", event => {
			if (!event.target.matches('input[name="newHeadFamilyId"]')) return;
			if (!sameId(selectedNewHeadId, event.target.value)) {
				selectedNewHeadId = event.target.value;
				// 새 세대주 변경 시 관계는 새 기준으로 재선택, 전화번호 입력은 그대로 유지.
				updateChangeHeadRows(root, true);
			}
			updateHouseholdSections(root);
			cacheDraft(root);
		});
		$(root, "existingHeadName").addEventListener("input", () => {
			markExistingHeadUnconfirmed(root);
			updateHouseholdSections(root);
		});
		$(root, "mockExistingHeadConfirmBtn").addEventListener("click", () => {
			mockConfirmExistingHead(root);
			cacheDraft(root);
		});
		// JSP에 고정 작성한 기존 세대주 연락처에도 숫자만 입력하도록 적용.
		$(root, "existingHeadPhoneGroup").querySelectorAll("input").forEach(input => {
			input.addEventListener("input", () => {
				input.value = input.value.replace(/\D/g, "").slice(0, input.maxLength);
			});
		});
		root.addEventListener("input", event => {
			const phoneGroup = event.target.closest?.(".move-step4-family-phone");
			if (phoneGroup) syncApplicantPhoneAcrossModes(root, phoneGroup);
			cacheDraft(root);
		});
		root.addEventListener("change", () => cacheDraft(root));
	} catch (error) {
		if (!root.isConnected || root !== activeRoot) return;
		console.error("전입신고 4단계 초기화 실패:", error);
		$(root, "newAddressStatus").textContent = error.message;
		if (readOnly) disableForReadOnly(root);
	}
}

function validatePhoneGroup(group, label) {
	if (PHONE_PATTERN.test(readPhone(group) || "")) return true;
	alert(`${label}를 010-0000-0000 형식으로 모두 입력해 주세요.`);
	group?.querySelector("input")?.focus();
	return false;
}
function validateFamilyPhones(root, bodyId) {
	for (const row of $(root, bodyId).querySelectorAll("tr[data-family-id]")) {
		if (!validatePhoneGroup(row.querySelector(".move-step4-family-phone"), "이사 가족의 휴대전화번호")) return false;
	}
	return true;
}

export function validate({ root }) {
	if (!addressSelected || !$(root, "newRoadAddress").value.trim()) {
		alert("이사 온 곳의 주소를 검색하여 선택해 주세요.");
		$(root, "searchNewAddressBtn").focus();
		return false;
	}
	if (!movingFamilies.length || !applicant) {
		alert("이사하는 가족정보를 불러오지 못했습니다. 3단계를 확인해 주세요.");
		return false;
	}
	const mode = getMode(root);
	if (!mode) {
		alert("세대 구성 방법을 선택해 주세요.");
		$(root, "householdTypeEmpty").focus();
		return false;
	}
	if (mode === "NEW_HOUSEHOLD") {
		const strategy = getStrategy(root);
		if (!strategy) {
			alert("기존 세대주 유지 또는 새 세대주 변경을 선택해 주세요.");
			return false;
		}
		if (strategy === "KEEP_ORIGINAL") {
			if (!originalMovingHead) {
				alert("기존 세대주가 이사 대상에 없습니다. 새 세대주를 지정해 주세요.");
				return false;
			}
			for (const family of movingFamilies) {
				if (!isOriginalHead(family) &&
					(!family.originalRelationship || family.originalRelationship === "SELF")) {
					alert("최초 가족 관계정보가 올바르지 않습니다. 3단계 정보를 확인해 주세요.");
					return false;
				}
			}
			return validateFamilyPhones(root, "keepOriginalHeadTableBody");
		}
		if (strategy === "CHANGE_HEAD") {
			if (!selectedNewHeadId || !movingFamilies.some(f => sameId(f.familyId, selectedNewHeadId))) {
				alert("이사하는 가족 중 새로운 세대주를 선택해 주세요.");
				return false;
			}
			for (const row of $(root, "changeNewHeadTableBody").querySelectorAll("tr[data-family-id]")) {
				if (!sameId(row.dataset.familyId, selectedNewHeadId)) {
					const select = row.querySelector("select[data-family-id]");
					if (!select?.value) {
						alert("새 세대주와의 관계를 모두 선택해 주세요.");
						select?.focus();
						return false;
					}
				}
			}
			return validateFamilyPhones(root, "changeNewHeadTableBody");
		}
	} else if (mode === "JOIN_EXISTING") {
		if (!$(root, "existingHeadName").value.trim()) {
			alert("기존 거주 세대주의 가상 이름을 입력해 주세요.");
			$(root, "existingHeadName").focus();
			return false;
		}
		if (!existingHeadMockConfirmed) {
			alert("기존 세대주 확인 체험을 완료해 주세요.");
			$(root, "mockExistingHeadConfirmBtn").focus();
			return false;
		}
		if (!validatePhoneGroup($(root, "existingHeadPhoneGroup"), "기존 세대주의 휴대전화번호")) return false;
		for (const row of $(root, "existingHouseholdTableBody").querySelectorAll("tr[data-family-id]")) {
			const select = row.querySelector("select[data-family-id]");
			if (!select?.value) {
				alert("이사 가족 모두 기존 세대주와의 관계를 선택해 주세요.");
				select?.focus();
				return false;
			}
		}
		return validateFamilyPhones(root, "existingHouseholdTableBody");
	}
	return true;
}
