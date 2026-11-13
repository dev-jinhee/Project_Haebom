/**
 * 주민등록표 등본(초본) 발급 STEP 1
 * 기존 해봄 simulation.js 인터페이스: init / getData / restore / validate
 * 기존 주민등록증 재발급 모듈과 같은 ../utils/sgis-api.js 경로 기준.
 */
import { fetchRegions } from "../utils/sgis-api.js";

const $ = (root, selector) => root.querySelector(selector);
const value = (root, selector) => $(root, selector)?.value?.trim() ?? "";
const choice = (root, name) => $(root, `input[name="${name}"]:checked`)?.value ?? "";
const included = (root, name) => $(root, `input[name="${name}"]`)?.checked === true;
const yn = (root, name) => included(root, name) ? "Y" : "N";
const isReadonly = root => root.dataset.certificateReadonly === "true";

const PREFIXES = { DEUNGBON: "deungbon", CHOBON: "chobon" };
const BOOL_FIELDS = [
	"deungbonPastAddressIncluded", "deungbonHouseholdCompositionIncluded",
	"deungbonHouseholdCompositionReasonIncluded", "deungbonHouseholdCompositionDateIncluded",
	"deungbonChangeReasonIncluded", "deungbonHouseholdMemberIncluded",
	"deungbonHouseholdMemberNameIncluded", "deungbonHouseholdMemberChangeReasonIncluded",
	"deungbonHouseholdMemberReportDateIncluded", "deungbonHouseholdMemberOtherNamesIncluded",
	"deungbonRrnBackIncluded", "deungbonRelationshipIncluded",
	"chobonPastAddressIncluded", "chobonPastAddressReportDateIncluded",
	"chobonPastAddressChangeReasonIncluded", "chobonPastHouseholdRelationIncluded",
	"chobonPersonalChangeIncluded", "chobonIdNumbersIncluded",
	"chobonRrnBackIncluded", "chobonForeignNumberIncluded",
	"chobonMilitaryServiceIncluded", "chobonHouseholdRelationIncluded"
];
const RADIO_FIELDS = [
	"deungbonPastAddressScope", "deungbonRrnBackScope", "deungbonRelationshipType",
	"chobonPastAddressScope", "chobonPastHouseholdRelationType",
	"chobonPersonalChangeScope", "chobonMilitaryServiceScope",
	"chobonHouseholdRelationType"
];
const MEMBER_IDS = new Set(["SELF", "SPOUSE", "CHILD"]);
const PURPOSES = new Set(["ADMIN", "FINANCE", "REAL_ESTATE", "COURT", "PRIVATE", "OTHER"]);

function setRadio(root, name, selectedValue) {
	root.querySelectorAll(`input[name="${name}"]`).forEach(el => {
		el.checked = el.value === selectedValue;
	});
}
function radioValue(root, name, fallback) {
	return choice(root, name) || fallback;
}
function setChecked(root, name, answer) {
	const el = $(root, `input[name="${name}"]`);
	if (el) el.checked = answer === "Y" || answer === true || answer === "true";
}
function readMembers(root) {
	return [...root.querySelectorAll('input[name="certificateSelectedMember"]:checked')]
		.map(input => input.value).filter(id => MEMBER_IDS.has(id));
}

function updateUi(root) {
	const readOnly = isReadonly(root);
	const type = choice(root, "certificateType");
	const mode = choice(root, "issueMode");
	const selection = mode === "SELECT";
	const selective = $(root, "#certificateSelectiveOptions");
	selective.hidden = !selection;
	$(root, "#certificateIssueHint").textContent = selection
		? "발급 문서에 표시할 정보를 선택하세요."
		: "과거주소 변동사항을 제외한 모든 정보가 표시됩니다.";

	$(root, "#certificateDeungbonFields").hidden = !selection || type !== "DEUNGBON";
	$(root, "#certificateChobonFields").hidden = !selection || type !== "CHOBON";
	root.querySelectorAll(".certificate-type-option").forEach(label => {
		label.classList.toggle("is-active", !!label.querySelector('input[name="certificateType"]:checked'));
	});

	["deungbon", "chobon"].forEach(prefix => {
		const container = $(root, prefix === "deungbon" ? "#certificateDeungbonFields" : "#certificateChobonFields");
		const active = selection && type === (prefix === "deungbon" ? "DEUNGBON" : "CHOBON");
		container.querySelectorAll(".certificate-option-row").forEach(row => {
			const parent = row.querySelector('.certificate-option-title input[type="checkbox"]');
			const expanded = active && !!parent?.checked;
			const details = row.querySelector(".certificate-option-content");
			if (details) details.hidden = !expanded; // 체크해야 오른쪽 라디오/체크 항목 나타남
			const note = row.querySelector(".certificate-option-note");
			if (note) note.hidden = !expanded;

			if (parent) parent.disabled = readOnly || !active;
			row.querySelectorAll(".certificate-option-content input, .certificate-option-note input, .certificate-option-note select").forEach(input => {
				input.disabled = readOnly || !expanded;
			});
		});
		const recent = choice(root, `${prefix}PastAddressScope`) === "RECENT";
		const pastChecked = included(root, `${prefix}PastAddressIncluded`);
		const yearsWrap = container.querySelector(".certificate-years-wrap");
		const yearsInput = yearsWrap?.querySelector("input");
		if (yearsInput) yearsInput.disabled = readOnly || !(active && pastChecked && recent);
	});

	// 세대 일부: '세대원 조회' 버튼이 나타나고 클릭 시 가족 테이블 표시.
	const rrnActive = selection && type === "DEUNGBON" && included(root, "deungbonRrnBackIncluded");
	const partial = rrnActive && choice(root, "deungbonRrnBackScope") === "HOUSEHOLD_PART";
	const lookupButton = $(root, "#certificateLookupMembers");
	const lookupArea = $(root, "#certificateMemberLookupArea");
	lookupButton.hidden = !partial || readOnly;
	lookupButton.disabled = readOnly || !partial;
	lookupArea.hidden = !partial || root.dataset.certificateLookupOpened !== "true";
	lookupArea.querySelectorAll('input[name="certificateSelectedMember"]').forEach(el => {
		el.disabled = readOnly || lookupArea.hidden;
	});

	const relationshipActive = selection && type === "DEUNGBON" && included(root, "deungbonRelationshipIncluded");
	const detailed = relationshipActive && choice(root, "deungbonRelationshipType") === "DETAIL";
	const purposeArea = $(root, "#certificatePurposeArea");
	const purposeOtherArea = $(root, "#certificatePurposeOtherArea");
	const other = detailed && value(root, '#certificatePurpose') === "OTHER";
	purposeArea.hidden = !detailed;
	purposeOtherArea.hidden = !other;
	$(root, '#certificatePurpose').disabled = readOnly || !detailed;
	$(root, '#certificatePurposeOther').disabled = readOnly || !other;

	// 초본: 과거 주소 관계 / 현재 세대주 관계 중 하나라도 '상세'면 용도 입력 표시.
	const chobonActive = selection && type === "CHOBON";
	const chobonDetailed = chobonActive && (
		(included(root, "chobonPastHouseholdRelationIncluded") &&
			choice(root, "chobonPastHouseholdRelationType") === "DETAIL") ||
		(included(root, "chobonHouseholdRelationIncluded") &&
			choice(root, "chobonHouseholdRelationType") === "DETAIL")
	);
	const chobonPurposeArea = $(root, "#certificateChobonPurposeArea");
	const chobonPurposeOtherArea = $(root, "#certificateChobonPurposeOtherArea");
	const chobonOther = chobonDetailed && value(root, "#certificateChobonPurpose") === "OTHER";
	chobonPurposeArea.hidden = !chobonDetailed;
	chobonPurposeOtherArea.hidden = !chobonOther;
	$(root, "#certificateChobonPurpose").disabled = readOnly || !chobonDetailed;
	$(root, "#certificateChobonPurposeOther").disabled = readOnly || !chobonOther;
}

function setupAddress(root) {
	const sido = $(root, "#certificateSido");
	const sigungu = $(root, "#certificateSigungu");
	const status = $(root, "#certificateAddressStatus");
	let seq = 0;
	async function loadSido() {
		sido.replaceChildren(new Option("시·도 선택", ""));
		sido.disabled = true;
		status.textContent = "시·도 목록을 조회하는 중입니다.";
		try {
			const regions = await fetchRegions();
			if (!root.isConnected) return;
			regions.forEach(item => sido.add(new Option(item.addr_name, String(item.cd))));
			sido.disabled = isReadonly(root);
			status.textContent = "주민등록상 주소를 선택해 주세요.";
		} catch (error) {
			status.textContent = "시·도 목록을 불러오지 못했습니다.";
			console.error("[등본·초본] 시·도 조회 실패", error);
		}
	}
	async function loadDistricts(saved = "") {
		const current = ++seq;
		const code = sido.value;
		sigungu.replaceChildren(new Option("시·군·구 선택", ""));
		sigungu.disabled = true;
		if (!code) { status.textContent = "시·도를 선택해 주세요."; return; }
		status.textContent = "시·군·구 목록을 조회하는 중입니다.";
		try {
			const regions = await fetchRegions(code);
			if (current !== seq || sido.value !== code || !root.isConnected) return;
			regions.forEach(item => sigungu.add(new Option(item.addr_name, String(item.cd))));
			sigungu.value = saved;
			if (sigungu.selectedIndex < 0) sigungu.value = "";
			sigungu.disabled = isReadonly(root);
			status.textContent = "주민등록상 주소를 선택해 주세요.";
		} catch (error) {
			if (current !== seq) return;
			status.textContent = "시·군·구 목록을 불러오지 못했습니다.";
			console.error("[등본·초본] 시·군·구 조회 실패", error);
		}
	}
	sido.addEventListener("change", () => { if (!isReadonly(root)) void loadDistricts(); });
	root.loadCertificateDistricts = loadDistricts;
	return { loadSido };
}

async function loadApplicant(root) {
	// 기존 주민등록증 재발급 STEP 1과 동일한 회원 프로필 API 활용.
	// 신청인만 현재 회원 정보, 나머지는 JSP의 가상 배우자/자녀 데이터.
	try {
		const response = await fetch("/api/mypage/profile");
		if (!response.ok) return;
		const profile = await response.json();
		const name = $(root, "#certificateApplicantName");
		const birth = $(root, "#certificateApplicantBirth");
		if (name) name.textContent = profile.memberName || "신청인";
		if (birth && typeof profile.birthDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(profile.birthDate)) {
			const [year, month, day] = profile.birthDate.split("-");
			birth.textContent = `${year}년 ${month}월 ${day}일`;
		}
	} catch (error) {
		console.warn("[등본·초본] 신청인 기본정보를 불러오지 못해 기본 표기를 사용합니다.", error);
	}
}

export async function init({ root, progressId, stepId, readOnly = false, savedData = null }) {
	if (!root) return;
	root.dataset.certificateReadonly = String(readOnly);
	root.dataset.certificateLookupOpened = "false";
	const address = setupAddress(root);

	root.querySelectorAll('input[name="certificateType"], input[name="issueMode"], .certificate-option-row input, #certificatePurpose, #certificateChobonPurpose')
		.forEach(el => el.addEventListener("change", () => updateUi(root)));
	$(root, "#certificateLookupMembers").addEventListener("click", () => {
		if (isReadonly(root)) return;
		root.dataset.certificateLookupOpened = "true";
		updateUi(root);
	});

	// SGIS/프로필 API 응답을 기다리는 동안에도 탭 선택/표시를 즉시 동기화.
	updateUi(root);
	await Promise.all([address.loadSido(), loadApplicant(root)]);
	if (savedData) {
		await restore({ root, data: savedData, readOnly });
	} else if (progressId && stepId) {
		const response = await fetch(`/api/simulation/answers/${encodeURIComponent(progressId)}/${encodeURIComponent(stepId)}`);
		if (!response.ok) throw new Error(`등본·초본 저장 답변 조회 실패 (${response.status})`);
		const answers = await response.json();
		const data = {};
		for (const answer of answers) data[answer.fieldKey] = answer.answerValue;
		if (Object.keys(data).length) await restore({ root, data, readOnly });
	}
	updateUi(root);
	if (readOnly) root.querySelectorAll("input,select,textarea,button").forEach(el => { el.disabled = true; });
}

export function getData({ root }) {
	const type = choice(root, "certificateType");
	const mode = choice(root, "issueMode");
	const data = {
		certificateType: type,
		residentSidoCode: value(root, "#certificateSido"),
		residentSigunguCode: value(root, "#certificateSigungu"),
		issueMode: mode,
		receiveMethod: choice(root, "receiveMethod")
	};
	// 전체 발급일 때 선택 항목 전송 X. 선택 발급일 때도 현재 발급 종류만 전송.
	if (mode !== "SELECT") return data;
	const prefix = PREFIXES[type];
	if (!prefix) return data;

	data[`${prefix}PastAddressIncluded`] = yn(root, `${prefix}PastAddressIncluded`);
	if (included(root, `${prefix}PastAddressIncluded`)) {
		data[`${prefix}PastAddressScope`] = choice(root, `${prefix}PastAddressScope`);
		if (data[`${prefix}PastAddressScope`] === "RECENT") {
			data[`${prefix}PastAddressYears`] = value(root, `input[name="${prefix}PastAddressYears"]`);
		}
	}
	if (type === "DEUNGBON") {
		for (const [parent, children] of [
			["deungbonHouseholdCompositionIncluded", ["deungbonHouseholdCompositionReasonIncluded", "deungbonHouseholdCompositionDateIncluded", "deungbonChangeReasonIncluded"]],
			["deungbonHouseholdMemberIncluded", ["deungbonHouseholdMemberNameIncluded", "deungbonHouseholdMemberChangeReasonIncluded", "deungbonHouseholdMemberReportDateIncluded", "deungbonHouseholdMemberOtherNamesIncluded"]]
		]) {
			data[parent] = yn(root, parent);
			if (included(root, parent)) children.forEach(child => { data[child] = yn(root, child); });
		}
		data.deungbonRrnBackIncluded = yn(root, "deungbonRrnBackIncluded");
		if (included(root, "deungbonRrnBackIncluded")) {
			data.deungbonRrnBackScope = choice(root, "deungbonRrnBackScope");
			if (data.deungbonRrnBackScope === "HOUSEHOLD_PART") {
				data.deungbonSelectedMemberIds = readMembers(root).join(",");
			}
		}
		data.deungbonRelationshipIncluded = yn(root, "deungbonRelationshipIncluded");
		if (included(root, "deungbonRelationshipIncluded")) {
			data.deungbonRelationshipType = choice(root, "deungbonRelationshipType");
			if (data.deungbonRelationshipType === "DETAIL") {
				data.deungbonPurpose = value(root, "#certificatePurpose");
				if (data.deungbonPurpose === "OTHER") {
					data.deungbonPurposeDetail = value(root, "#certificatePurposeOther");
				}
			}
		}
	} else {
		// 정부24 초본(국문) 선택 발급 항목
		if (included(root, "chobonPastAddressIncluded")) {
			data.chobonPastAddressReportDateIncluded = yn(root, "chobonPastAddressReportDateIncluded");
			data.chobonPastAddressChangeReasonIncluded = yn(root, "chobonPastAddressChangeReasonIncluded");
		}
		for (const [parent, radioName] of [
			["chobonPastHouseholdRelationIncluded", "chobonPastHouseholdRelationType"],
			["chobonPersonalChangeIncluded", "chobonPersonalChangeScope"],
			["chobonMilitaryServiceIncluded", "chobonMilitaryServiceScope"],
			["chobonHouseholdRelationIncluded", "chobonHouseholdRelationType"]
		]) {
			data[parent] = yn(root, parent);
			if (included(root, parent)) data[radioName] = choice(root, radioName);
		}
		data.chobonIdNumbersIncluded = yn(root, "chobonIdNumbersIncluded");
		if (included(root, "chobonIdNumbersIncluded")) {
			data.chobonRrnBackIncluded = yn(root, "chobonRrnBackIncluded");
			data.chobonForeignNumberIncluded = yn(root, "chobonForeignNumberIncluded");
		}
		const detailed =
			(data.chobonPastHouseholdRelationIncluded === "Y" && data.chobonPastHouseholdRelationType === "DETAIL") ||
			(data.chobonHouseholdRelationIncluded === "Y" && data.chobonHouseholdRelationType === "DETAIL");
		if (detailed) {
			data.chobonPurpose = value(root, "#certificateChobonPurpose");
			if (data.chobonPurpose === "OTHER") {
				data.chobonPurposeDetail = value(root, "#certificateChobonPurposeOther");
			}
		}
	}
	return data;
}

export async function restore({ root, data = {}, readOnly = false }) {
	root.dataset.certificateReadonly = String(readOnly);
	setRadio(root, "certificateType", data.certificateType ?? "DEUNGBON");
	setRadio(root, "issueMode", data.issueMode ?? "ALL");
	setRadio(root, "receiveMethod", data.receiveMethod ?? "ONLINE_THIRD_PARTY");
	BOOL_FIELDS.forEach(name => {
		if (Object.prototype.hasOwnProperty.call(data, name)) setChecked(root, name, data[name]);
	});
	RADIO_FIELDS.forEach(name => {
		if (Object.prototype.hasOwnProperty.call(data, name)) setRadio(root, name, data[name]);
	});
	["deungbonPastAddressYears", "chobonPastAddressYears"].forEach(name => {
		if (Object.prototype.hasOwnProperty.call(data, name)) {
			const input = $(root, `input[name="${name}"]`);
			if (input) input.value = data[name];
		}
	});
	if (data.deungbonPurpose != null) $(root, "#certificatePurpose").value = data.deungbonPurpose;
	if (data.deungbonPurposeDetail != null) $(root, "#certificatePurposeOther").value = data.deungbonPurposeDetail;
	if (data.chobonPurpose != null) $(root, "#certificateChobonPurpose").value = data.chobonPurpose;
	if (data.chobonPurposeDetail != null) $(root, "#certificateChobonPurposeOther").value = data.chobonPurposeDetail;

	const members = new Set(String(data.deungbonSelectedMemberIds ?? "").split(",").filter(Boolean));
	root.querySelectorAll('input[name="certificateSelectedMember"]').forEach(el => {
		el.checked = members.has(el.value);
	});
	const partial = data.deungbonRrnBackScope === "HOUSEHOLD_PART";
	root.dataset.certificateLookupOpened = String(partial && (members.size > 0 || readOnly));

	$(root, "#certificateSido").value = data.residentSidoCode ?? "";
	await root.loadCertificateDistricts?.(data.residentSigunguCode ?? "");
	updateUi(root);
	if (readOnly) root.querySelectorAll("input,select,textarea,button").forEach(el => { el.disabled = true; });
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
	const data = getData({ root });
	const fail = (message, target) => {
		alert(message);
		focusValidationTarget(root, target);
		return false;
	};
	const option = name => `input[name="${name}"]:not(:disabled)`;

	if (!Object.keys(PREFIXES).includes(data.certificateType)) {
		return fail("지원하는 발급 서비스를 선택해 주세요.", option("certificateType"));
	}
	if (!data.residentSidoCode) return fail("주민등록상 주소를 선택해 주세요.", "#certificateSido");
	if (!data.residentSigunguCode) return fail("주민등록상 주소를 선택해 주세요.", "#certificateSigungu");
	if (!["ALL", "SELECT"].includes(data.issueMode)) {
		return fail("발급 형태를 선택해 주세요.", option("issueMode"));
	}
	if (!["ONLINE_PRINT", "ONLINE_E_DOC", "ONLINE_THIRD_PARTY", "REGISTERED_MAIL", "NORMAL_MAIL"].includes(data.receiveMethod)) {
		return fail("수령 방법을 선택해 주세요.", option("receiveMethod"));
	}

	if (data.issueMode === "SELECT") {
		const prefix = PREFIXES[data.certificateType];
		const selectedParents = data.certificateType === "DEUNGBON"
			? ["deungbonPastAddressIncluded", "deungbonHouseholdCompositionIncluded", "deungbonHouseholdMemberIncluded", "deungbonRrnBackIncluded", "deungbonRelationshipIncluded"]
			: ["chobonPastAddressIncluded", "chobonPastHouseholdRelationIncluded", "chobonPersonalChangeIncluded", "chobonIdNumbersIncluded", "chobonMilitaryServiceIncluded", "chobonHouseholdRelationIncluded"];
		if (!selectedParents.some(name => data[name] === "Y")) {
			return fail("선택 발급 시 표시할 항목을 하나 이상 선택해 주세요.", option(selectedParents[0]));
		}

		if (data[`${prefix}PastAddressIncluded`] === "Y" && data[`${prefix}PastAddressScope`] === "RECENT") {
			const years = Number(data[`${prefix}PastAddressYears`]);
			if (!Number.isInteger(years) || years < 1 || years > 99) {
				return fail("과거 주소 변동사항은 최근 1~99년 사이로 입력해 주세요.", `input[name="${prefix}PastAddressYears"]`);
			}
		}

		if (data.certificateType === "CHOBON") {
			for (const [parent, name, allowed] of [
				["chobonPastHouseholdRelationIncluded", "chobonPastHouseholdRelationType", ["GENERAL", "DETAIL"]],
				["chobonPersonalChangeIncluded", "chobonPersonalChangeScope", ["ALL", "NAME", "NUMBER"]],
				["chobonMilitaryServiceIncluded", "chobonMilitaryServiceScope", ["DATES", "ALL"]],
				["chobonHouseholdRelationIncluded", "chobonHouseholdRelationType", ["GENERAL", "DETAIL"]]
			]) {
				if (data[parent] === "Y" && !allowed.includes(data[name])) {
					return fail("초본 선택 발급 항목을 확인해 주세요.", option(name));
				}
			}
			const detailed =
				(data.chobonPastHouseholdRelationIncluded === "Y" && data.chobonPastHouseholdRelationType === "DETAIL") ||
				(data.chobonHouseholdRelationIncluded === "Y" && data.chobonHouseholdRelationType === "DETAIL");
			if (detailed) {
				if (!PURPOSES.has(data.chobonPurpose)) return fail("초본 발급 용도 및 목적을 선택해 주세요.", "#certificateChobonPurpose");
				if (data.chobonPurpose === "OTHER" && (!data.chobonPurposeDetail || data.chobonPurposeDetail.length > 100)) {
					return fail("초본 기타 용도를 1~100자로 입력해 주세요.", "#certificateChobonPurposeOther");
				}
			}
		}

		if (data.deungbonRrnBackIncluded === "Y" && data.deungbonRrnBackScope === "HOUSEHOLD_PART") {
			const ids = String(data.deungbonSelectedMemberIds || "").split(",").filter(Boolean);
			if (!ids.length || ids.some(id => !MEMBER_IDS.has(id))) {
				const target = root.querySelector('input[name="certificateSelectedMember"]:not(:disabled)')
					|| root.querySelector("#certificateLookupMembers");
				return fail("세대원 조회 후 표시할 세대원을 선택해 주세요.", target);
			}
		}
		if (data.deungbonRelationshipIncluded === "Y" && data.deungbonRelationshipType === "DETAIL") {
			if (!PURPOSES.has(data.deungbonPurpose)) return fail("용도 및 목적을 선택해 주세요.", "#certificatePurpose");
			if (data.deungbonPurpose === "OTHER" && (!data.deungbonPurposeDetail || data.deungbonPurposeDetail.length > 100)) {
				return fail("기타 용도를 1~100자로 입력해 주세요.", "#certificatePurposeOther");
			}
		}
	}
	return true;
}
