// 전입신고 Step4 추가 서비스 5종: 조건부 표시·검증·저장·복원
// 실제 행정기관 신청이나 파일 업로드는 수행하지 않습니다.
import { calculateAge } from "../utils/age.js";

const SERVICE_CODES = ["LEASE_REPORT", "MAIL_FORWARD", "SCHOOL_ADDRESS", "UTILITY_ADDRESS", "WELFARE_BENEFIT"];
const $ = (root, selector) => root.querySelector(selector);
const selected = (root, code) => Boolean($(root, `input[name="additionalService"][value="${code}"]`)?.checked);
const checkedIds = (root, name) => [...root.querySelectorAll(`input[name="${name}"]:checked`)].map(input => Number(input.value));
const checked = (root, name) => Boolean($(root, `[name="${name}"]`)?.checked);
const val = (root, id) => $(root, `#${id}`)?.value?.trim() ?? "";
const MOCK_LEASE_FILE_NAME = "가상_임대차계약서.pdf";

function addPersonCell(row, value) {
	const td = document.createElement("td");
	td.textContent = value ?? "-";
	row.appendChild(td);
}
function birthLabel(value) {
	const m = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
	return m ? `${m[1]}년 ${m[2]}월 ${m[3]}일` : "-";
}
function renderFamilyTable(root, tbodyId, name, families) {
	const tbody = $(root, `#${tbodyId}`);
	if (!tbody) return;
	tbody.replaceChildren();
	for (const family of families) {
		const row = document.createElement("tr");
		const cell = document.createElement("td");
		const input = document.createElement("input");
		input.type = "checkbox";
		input.className = "form-check-input";
		input.name = name;
		input.value = family.familyId;
		input.setAttribute("aria-label", `${family.familyName} 선택`);
		cell.appendChild(input);
		row.appendChild(cell);
		addPersonCell(row, family.originalRelationship === "CHILD" || family.relationship === "CHILD" ? "자녀" : family.originalRelationship === "SELF" ? "본인" : "가족");
		addPersonCell(row, family.familyName);
		addPersonCell(row, birthLabel(family.birthDate));
		addPersonCell(row, family.gender === "M" ? "남" : family.gender === "F" ? "여" : "-");
		tbody.appendChild(row);
	}
	const empty = $(root, `#${tbodyId}Empty`);
	if (empty) empty.classList.toggle("d-none", families.length > 0);
}
function updateSections(root) {
	for (const code of SERVICE_CODES) {
		const section = $(root, `[data-service-section="${code}"]`);
		if (section) section.classList.toggle("d-none", !selected(root, code));
	}
}
/*우편 서비스 신청 전화번호*/
function getPhoneGroup(root, groupId) {
	return [...root.querySelectorAll(`#${groupId} input`)]
		.map(input => input.value.trim())
		.join("-");
}

function setPhoneGroup(root, groupId, phone = "", defaultFirst = "") {
	const inputs = root.querySelectorAll(`#${groupId} input`);
	const parts = String(phone).split("-");

	inputs.forEach((input, index) => {
		input.value = parts[index] || (index === 0 ? defaultFirst : "");
	});
}

// ==============================
// 임대차계약서 가상 첨부
// ==============================
function setLeaseMockAttachment(root, attached) {
	const status = root.querySelector("#leaseMockFileStatus");
	const attachButton = root.querySelector("#attachLeaseMockFileBtn");
	const removeButton = root.querySelector("#removeLeaseMockFileBtn");

	if (!status || !attachButton || !removeButton) return;

	status.replaceChildren();

	const message = document.createElement("span");
	message.className = attached
		? "text-primary small fw-semibold"
		: "text-muted small";

	message.textContent = attached
		? MOCK_LEASE_FILE_NAME
		: "첨부된 가상 서류가 없습니다.";

	status.appendChild(message);

	// 실제 파일을 선택하지 않고 상태만 변경
	status.dataset.attached = String(attached);

	attachButton.classList.toggle("d-none", attached);
	removeButton.classList.toggle("d-none", !attached);
}

export function initServices(root, movingFamilies, { readOnly = false, applicantPhone } = {}) {
	const attachButton = root.querySelector("#attachLeaseMockFileBtn");
	const removeButton = root.querySelector("#removeLeaseMockFileBtn");
	if (!readOnly) {
		attachButton?.addEventListener("click", () => {
			setLeaseMockAttachment(root, true);
		});

		removeButton?.addEventListener("click", () => {
			setLeaseMockAttachment(root, false);
		});
	} else {
		if (attachButton) attachButton.disabled = true;
		if (removeButton) removeButton.disabled = true;
	}
	// 최초 진입 시 첨부되지 않은 상태
	setLeaseMockAttachment(root, false);

	const schoolCandidates = movingFamilies.filter(family => {
		const age = calculateAge(family.birthDate);
		const relation = family.originalRelationship ?? family.relationship;
		return relation === "CHILD" && age !== null && age >= 6 && age <= 13;
	});
	renderFamilyTable(root, "schoolAssignmentTableBody", "schoolFamilyId", schoolCandidates);
	renderFamilyTable(root, "mailFamilyTableBody", "mailFamilyId", movingFamilies);
	$(root, "#schoolCandidateNotice")?.classList.toggle("d-none", schoolCandidates.length > 0);
	root.querySelectorAll('input[name="additionalService"]').forEach(input => {
		if (!readOnly) input.addEventListener("change", () => updateSections(root));
	});
	const sameCheck = $(root, '[name="mailSameAsApplicant"]');

	if (!readOnly) {
		sameCheck?.addEventListener("change", () => {
			setPhoneGroup(
				root,
				"mailForwardPhoneGroup",
				sameCheck.checked ? applicantPhone : "",
				"010"
			);
		});
	}
	updateSections(root);
}
export function getServiceDetails(root) {
	// 체크 해제한 서비스의 하위 입력은 저장하지 않음
	const result = {};
	if (selected(root, "LEASE_REPORT")) {
		result.LEASE_REPORT = {
			reportRequested: checked(root, "leaseReportRequested"),
			// 개인정보 보호를 위해 파일 원본은 업로드·저장하지 않음
			mockDocumentAttached:
				root.querySelector("#leaseMockFileStatus")
					?.dataset.attached === "true"
		};
	}
	if (selected(root, "MAIL_FORWARD")) {
		result.MAIL_FORWARD = {
			landlinePhone: getPhoneGroup(root, "mailForwardLandlineGroup")
				.replace(/^-+$/, ""),
			phone: getPhoneGroup(root, "mailForwardPhoneGroup"),
			sameAsApplicant: checked(root, "mailSameAsApplicant"),
			familyIds: checkedIds(root, "mailFamilyId")
		};
	}
	if (selected(root, "SCHOOL_ADDRESS")) {
		result.SCHOOL_ADDRESS = { familyIds: checkedIds(root, "schoolFamilyId") };
	}
	if (selected(root, "UTILITY_ADDRESS")) {
		result.UTILITY_ADDRESS = { noticeAgreed: checked(root, "electricNoticeConsent") };
	}
	if (selected(root, "WELFARE_BENEFIT")) {
		result.WELFARE_BENEFIT = { noticeAgreed: checked(root, "welfareNoticeConsent") };
	}
	return result;
}
export function restoreServices(root, details = {}) {
	for (const code of SERVICE_CODES) {
		const item = details?.[code] || {};
		if (code === "LEASE_REPORT") {
			const check = $(root, '[name="leaseReportRequested"]');
			if (check) check.checked = Boolean(item.reportRequested);
			setLeaseMockAttachment(
				root,
				item.mockDocumentAttached === true
			);
		}
		if (code === "MAIL_FORWARD") {
			setPhoneGroup(root, "mailForwardLandlineGroup", item.landlinePhone || "");
			setPhoneGroup(root, "mailForwardPhoneGroup", item.phone || "", "010");

			const sameCheck = $(root, '[name="mailSameAsApplicant"]');
			if (sameCheck) sameCheck.checked = Boolean(item.sameAsApplicant);

			root.querySelectorAll('[name="mailFamilyId"]').forEach(input => {
				input.checked = (item.familyIds || [])
					.some(id => String(id) === input.value);
			});
		}
		if (code === "SCHOOL_ADDRESS") {
			root.querySelectorAll('[name="schoolFamilyId"]').forEach(input => {
				input.checked = (item.familyIds || []).some(id => String(id) === input.value);
			});
		}
		if (code === "UTILITY_ADDRESS" || code === "WELFARE_BENEFIT") {
			const name = code === "UTILITY_ADDRESS" ? "electricNoticeConsent" : "welfareNoticeConsent";
			const check = $(root, `[name="${name}"]`);
			if (check) check.checked = Boolean(item.noticeAgreed);
		}
	}
	updateSections(root);
}
export function validateServices(root) {
	if (selected(root, "MAIL_FORWARD")) {
		if (!/^010-\d{4}-\d{4}$/.test(
			getPhoneGroup(root, "mailForwardPhoneGroup")
		)) {
			alert("우편물 주소 이전 서비스의 휴대전화번호를 입력해 주세요.");
			root.querySelector("#mailForwardPhoneGroup input")?.focus();
			return false;
		}
		if (!checkedIds(root, "mailFamilyId").length) {
			alert("우편물 주소 이전 서비스 신청 대상자를 한 명 이상 선택해 주세요.");
			return false;
		}
		const landline = getPhoneGroup(root, "mailForwardLandlineGroup")
			.replace(/^-+$/, "");

		if (landline && !/^\d{2,3}-\d{3,4}-\d{4}$/.test(landline)) {
			alert("신청인 전화번호를 올바르게 입력해 주세요.");
			root.querySelector("#mailForwardLandlineGroup input")?.focus();
			return false;
		}
	}
	if (selected(root, "SCHOOL_ADDRESS") && !checkedIds(root, "schoolFamilyId").length) {
		alert("초등학교 배정정보 신청 대상 아동을 선택해 주세요. 대상자가 없다면 서비스를 해제해 주세요.");
		return false;
	}
	if (selected(root, "UTILITY_ADDRESS") && !checked(root, "electricNoticeConsent")) {
		alert("전기사용자 명의변경 유의사항을 확인해 주세요.");
		return false;
	}
	if (selected(root, "WELFARE_BENEFIT") && !checked(root, "welfareNoticeConsent")) {
		alert("요금감면 일괄신청 유의사항을 확인해 주세요.");
		return false;
	}
	return true;
}
