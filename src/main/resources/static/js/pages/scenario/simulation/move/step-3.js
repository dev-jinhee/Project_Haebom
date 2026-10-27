// ============================================================
// 전입신고 3단계 | 이사 전 주소 / 이사 대상 가족 / 새 세대주
// simulation.js의 init / validate / save / getData 계약 유지
// ============================================================
const REGIONS_API = "/api/address/sgis/regions";
const VIRTUAL_DONG = "해봄동";
const VIRTUAL_DETAIL = "해봄동 101-1";
const VIRTUAL_CENTER = "해봄동 행정복지센터";

let families = [];
let familySearchCompleted = false;

// Lombok boolean getter가 isApplicant 또는 applicant로 직렬화될 수 있음
const isApplicant = family => family.isApplicant === true || family.applicant === true;
const isOriginalHead = family => family.isOriginalHead === true || family.originalHead === true;
const isHouseholdHead = family => family.isHouseholdHead === true || family.householdHead === true;

const RELATION_LABELS = {
	SELF: "본인", SPOUSE: "배우자", CHILD: "자녀", FATHER: "부", MOTHER: "모",
	PARENT: "부모", OTHER: "기타"
};

// 0단계에서 사용하는 관계 코드에 맞춤
const RELATION_OPTIONS = [
	["SELF", "본인"], ["SPOUSE", "배우자"], ["CHILD", "자녀"],
	["FATHER", "부"], ["MOTHER", "모"], ["OTHER", "기타"]
];

// ==============================
// 초기화
// ==============================
export async function init({ root, progressId, stepId, readOnly = false }) {
	families = [];
	familySearchCompleted = false;

	const sidoSelect = root.querySelector("#sidoSelect");
	const sigunguSelect = root.querySelector("#sigunguSelect");
	const searchFamilyBtn = root.querySelector("#searchFamilyBtn");
	const status = root.querySelector("#addressStatus");
	const selectAll = root.querySelector("#selectAllMoving");

	// 공통 답변 조회 API 완성 후 progressId / stepId로 주소를 복원




	if (readOnly) {
		sidoSelect.disabled = true;
		sigunguSelect.disabled = true;
		searchFamilyBtn.disabled = true;
		selectAll.disabled = true;
	}
	try {
		families = await fetchFamily(progressId);
		familySearchCompleted = families.length > 0;
		if (familySearchCompleted) renderFamily(root, true);
	} catch (error) {
		console.error("가족정보 조회 오류:", error);
		status.textContent = "가족정보를 불러오지 못했습니다.";
	}

	sidoSelect.addEventListener("change", async () => {
		resetLookup(root);
		resetSelect(sigunguSelect, "시·군·구 선택");
		sigunguSelect.disabled = true;
		searchFamilyBtn.disabled = true;
		const sidoCode = sidoSelect.value;

		if (!sidoCode) {
			status.textContent = "시·도와 시·군·구를 선택해 주세요.";
			return;
		}

		status.textContent = "시·군·구 목록을 불러오는 중입니다.";
		try {
			const regions = await fetchRegions(sidoCode);
			// 선택을 바꾸는 동안 발생할 수 있는 늦은 응답 무시
			if (sidoSelect.value !== sidoCode || !root.isConnected) return;
			fillSelect(sigunguSelect, regions, "시·군·구 선택");
			sigunguSelect.disabled = false;
			status.textContent = "시·군·구를 선택하고 주소조회를 눌러 주세요.";
		} catch (error) {
			if (sidoSelect.value !== sidoCode || !root.isConnected) return;
			console.error("시·군·구 조회 오류:", error);
			status.textContent = "시·군·구를 불러오지 못했습니다. 다시 선택해 주세요.";
		}
	});

	sigunguSelect.addEventListener("change", () => {
		resetLookup(root);
		searchFamilyBtn.disabled = !sigunguSelect.value;
		status.textContent = sigunguSelect.value
			? "주소조회를 누르면 이전 주소와 가족정보가 표시됩니다."
			: "시·군·구를 선택해 주세요.";
	});

	searchFamilyBtn.addEventListener("click", async () => {
		if (!sidoSelect.value || !sigunguSelect.value) {
			alert("시·도와 시·군·구를 선택해 주세요.");
			return;
		}
		const selectedSido = sidoSelect.value;
		const selectedSigungu = sigunguSelect.value;
		searchFamilyBtn.disabled = true;
		resetLookup(root);
		status.textContent = "이전 주소와 가족정보를 확인하는 중입니다.";

		try {
			const result = await fetchFamily(progressId);
			if (!root.isConnected || sidoSelect.value !== selectedSido ||
				sigunguSelect.value !== selectedSigungu) return;
			if (result.length === 0) throw new Error("등록된 가족이 없습니다.");

			families = result;
			familySearchCompleted = true;
			renderPreviousAddress(root);
			renderFamily(root, false);
			status.textContent = "조회되었습니다. 이사 가는 사람을 선택해 주세요.";
		} catch (error) {
			console.error("이전 주소 / 가족정보 조회 오류:", error);
			status.textContent = "가족정보 조회에 실패했습니다. 다시 시도해 주세요.";
			alert(error.message || "가족정보 조회에 실패했습니다.");
		} finally {
			searchFamilyBtn.disabled = !sigunguSelect.value;
		}
	});

	selectAll.addEventListener("change", () => {
		for (const checkbox of root.querySelectorAll('input[name="movingFamily"]')) {
			// 신청인을 포함한 모든 가족을 전체 선택/해제
			if (!checkbox.disabled) checkbox.checked = selectAll.checked;
		}
		updateSelectAll(root);
		renderRemainingHead(root, false);
	});

	for (const input of root.querySelectorAll('.move-step3-phone-group input')) {
		input.addEventListener("input", () => {
			input.value = input.value.replace(/\D/g, "");
		});
	}

	try {
		status.textContent = "시·도 목록을 불러오는 중입니다.";

		// 시·도 목록 로딩
		fillSelect(sidoSelect, await fetchRegions(), "시·도 선택");

		// 저장된 이전 주소 복원
		const restored = await restorePreviousAddress(
			root,
			progressId,
			stepId,
			readOnly
		);

		if (!restored) {
			status.textContent = "시·도와 시·군·구를 선택해 주세요.";
		} else if (!readOnly) {
			searchFamilyBtn.disabled = false;
		}

	} catch (error) {
		console.error("3단계 초기화 오류:", error);
		status.textContent = "3단계 정보를 불러오지 못했습니다.";
	}
}

// ==============================
// 공통 주소 API: Controller에서 result 목록만 반환하는 계약
// ==============================
async function fetchRegions(cd) {
	const url = cd
		? `${REGIONS_API}?cd=${encodeURIComponent(cd)}`
		: REGIONS_API;
	const response = await fetch(url);
	if (!response.ok) throw new Error("행정구역 조회 실패");

	const data = await response.json();
	// AddressServiceImpl.getRegions() → List<Map<String, Object>> 반환
	if (!Array.isArray(data)) throw new Error("행정구역 응답 형식 오류");
	return data;
}

function resetSelect(select, placeholder) {
	select.replaceChildren(new Option(placeholder, ""));
}

function fillSelect(select, regions, placeholder) {
	resetSelect(select, placeholder);
	for (const region of regions) {
		select.add(new Option(region.addr_name, String(region.cd)));
	}
}

function resetLookup(root) {
	families = [];
	familySearchCompleted = false;
	root.querySelector("#addressResultSection").classList.add("d-none");
	root.querySelector("#familySection").classList.add("d-none");
	root.querySelector("#remainingHeadSection").classList.add("d-none");
	root.querySelector("#familyTableBody").replaceChildren();
	root.querySelector("#remainingHeadOptions").replaceChildren();
	const selectAll = root.querySelector("#selectAllMoving");
	selectAll.checked = false;
	selectAll.indeterminate = false;
	clearNewHeadPhone(root);
}

function renderPreviousAddress(root) {
	const sido = root.querySelector("#sidoSelect");
	const sigungu = root.querySelector("#sigunguSelect");
	const sidoName = sido.selectedOptions[0].textContent;
	const sigunguName = sigungu.selectedOptions[0].textContent;

	root.querySelector("#baseAddress").textContent =
		`${sidoName} ${sigunguName} ${VIRTUAL_DETAIL}`;
	root.querySelector("#welfareCenter").textContent = VIRTUAL_CENTER;
	root.querySelector("#addressResultSection").classList.remove("d-none");
}

// ==============================
// DB 가족 조회
// ==============================
async function fetchFamily(progressId) {
	const response = await fetch(`/api/simulation/move/${progressId}/family`);
	if (!response.ok) throw new Error("가족정보 조회 실패");
	const data = await response.json();
	if (!Array.isArray(data)) throw new Error("가족정보 응답 형식 오류");
	return data;
}

function addTextCell(row, text) {
	const td = document.createElement("td");
	td.textContent = text ?? "-";
	row.appendChild(td);
	return td;
}

function birthLabel(value) {
	if (!value) return "-";
	// LocalDate의 ISO 표기를 날짜 이동 없이 표시
	const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
	return match ? `${match[1]}년 ${match[2]}월 ${match[3]}일` : String(value);
}

function genderLabel(value) {
	return value === "M" ? "남" : value === "F" ? "여" : "-";
}

function relationLabel(value) {
	return RELATION_LABELS[value] || value || "-";
}

function selectedMovingIds(root) {
	return new Set(
		[...root.querySelectorAll('input[name="movingFamily"]:checked')]
			.map(input => String(input.value))
	);
}

// ==============================
// 이사 가는 사람 표: 0단계와 동일한 5열 구조
// ==============================
function renderFamily(root, readOnly) {
	const tbody = root.querySelector("#familyTableBody");
	tbody.replaceChildren();

	for (const family of families) {
		const row = document.createElement("tr");
		const checkTd = document.createElement("td");
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.name = "movingFamily";
		checkbox.value = String(family.familyId);
		checkbox.className = "form-check-input";
		// 초기에는 미선택. 기존 저장값이 MOVE인 경우에만 체크 상태 복원
		checkbox.checked = family.moveStatus === "MOVE";
		checkbox.disabled = readOnly;
		checkbox.setAttribute("aria-label", `${family.familyName} 이사 대상 선택`);
		if (!readOnly) {
			checkbox.addEventListener("change", () => {
				updateSelectAll(root);
				renderRemainingHead(root, false);
			});
		}
		checkTd.appendChild(checkbox);
		row.appendChild(checkTd);

		const relationTd = addTextCell(row, relationLabel(family.originalRelationship));
		if (isApplicant(family)) {
			const applicantBadge = document.createElement("span");
			applicantBadge.className = "ms-1 text-primary";
			applicantBadge.textContent = "(신청인)";
			relationTd.appendChild(applicantBadge);
		}

		const nameTd = addTextCell(row, family.familyName);
		if (isOriginalHead(family)) {
			const headBadge = document.createElement("small");
			headBadge.className = "ms-2 text-muted";
			headBadge.textContent = "(기존 세대주)";
			nameTd.appendChild(headBadge);
		}
		addTextCell(row, birthLabel(family.birthDate));
		addTextCell(row, genderLabel(family.gender));
		tbody.appendChild(row);
	}

	root.querySelector("#familySection").classList.remove("d-none");
	const selectAll = root.querySelector("#selectAllMoving");
	selectAll.disabled = readOnly || families.length === 0;
	updateSelectAll(root);
	// 최초 로딩에서만 DB에 저장된 새 세대주 및 가족별 관계를 복원
	renderRemainingHead(root, readOnly, true);
}

function updateSelectAll(root) {
	const selectAll = root.querySelector("#selectAllMoving");
	const checks = [...root.querySelectorAll('input[name="movingFamily"]')];
	selectAll.checked = checks.length > 0 && checks.every(input => input.checked);
	// 일부만 선택되어도 '-' 표시 대신 미체크 상태 유지
	selectAll.indeterminate = false;
}

// ==============================
// 세대주가 이사하고, 남는 가족이 있을 때만 후보·연락처 표시
// ==============================
function renderRemainingHead(root, readOnly, restoreSaved = false) {
	const section = root.querySelector("#remainingHeadSection");
	const tbody = root.querySelector("#remainingHeadOptions");

	// 가족 체크 상태만 바뀌었다면 현재 화면의 유효한 입력값은 유지
	const previousHeadId = root.querySelector('input[name="remainingHead"]:checked')?.value;
	const previousRelations = new Map(
		[...tbody.querySelectorAll('tr[data-family-id]')].map(row => [
			row.dataset.familyId, row.querySelector("select")?.value || ""
		])
	);
	tbody.replaceChildren();

	const moving = selectedMovingIds(root);
	const originalHead = families.find(isOriginalHead);
	const remaining = families.filter(family => !moving.has(String(family.familyId)));
	const needsNewHead = Boolean(
		originalHead && moving.has(String(originalHead.familyId)) && remaining.length > 0
	);

	section.classList.toggle("d-none", !needsNewHead);
	if (!needsNewHead) {
		clearNewHeadPhone(root);
		return;
	}

	const savedHead = restoreSaved
		? remaining.find(family => isHouseholdHead(family))
		: null;

	// 후보에서 제외된 기존 선택은 복원하지 않음 (이사 대상 변경 시 재선택)
	const selectedHeadId = remaining.some(f => String(f.familyId) === previousHeadId)
		? previousHeadId
		: savedHead ? String(savedHead.familyId) : null;

	if (previousHeadId && previousHeadId !== selectedHeadId) {
		clearNewHeadPhone(root);
	} else if (restoreSaved && savedHead && !previousHeadId) {
		setNewHeadPhone(root, savedHead.phoneNum || "");
	}

	for (const family of remaining) {
		const familyId = String(family.familyId);
		const isChosen = familyId === selectedHeadId;
		const row = document.createElement("tr");
		row.dataset.familyId = familyId;

		const checkTd = document.createElement("td");
		const radio = document.createElement("input");
		radio.type = "radio";
		radio.name = "remainingHead";
		radio.value = familyId;
		radio.className = "form-check-input";
		radio.checked = isChosen;
		radio.disabled = readOnly;
		radio.setAttribute("aria-label", `${family.familyName} 새 세대주 선택`);
		checkTd.appendChild(radio);
		row.appendChild(checkTd);

		const relationTd = document.createElement("td");
		const relationSelect = document.createElement("select");
		relationSelect.className = "form-select";
		relationSelect.setAttribute("aria-label", `${family.familyName} 새 세대주와의 관계`);

		// 기존의 원본 관계는 새 세대주와의 관계와 다를 수 있음!
		// 저장된 세대주를 최초 복원하는 경우만 현재 DB 관계를 다시 보여 줌.
		// 이후 새 세대주를 바꾸거나 남는 가족이 추가되면 직접 관계를 선택하도록 함.
		const restoredRelation = previousHeadId === selectedHeadId
			? previousRelations.get(familyId)
			: restoreSaved && selectedHeadId ? family.relationship : "";
		const relation = isChosen ? "SELF" : (restoredRelation && restoredRelation !== "SELF" ? restoredRelation : "");

		relationSelect.add(new Option("관계 선택", "", false, !relation));
		for (const [value, label] of RELATION_OPTIONS) {
			const option = new Option(label, value, false, value === relation);
			// '본인'은 선택된 새 세대주만 사용할 수 있음
			if (value === "SELF" && !isChosen) option.disabled = true;
			relationSelect.add(option);
		}
		relationSelect.disabled = readOnly || isChosen || !selectedHeadId;
		relationTd.appendChild(relationSelect);
		row.appendChild(relationTd);

		addTextCell(row, family.familyName);
		addTextCell(row, birthLabel(family.birthDate));
		addTextCell(row, genderLabel(family.gender));
		tbody.appendChild(row);

		if (!readOnly) {
			radio.addEventListener("change", () => {
				// 선택한 새 세대주는 SELF, 다른 남는 가족은 새 기준으로 다시 선택
				updateRemainingRelations(root);
				clearNewHeadPhone(root);
			});
		}
	}

	if (readOnly) {
		for (const input of root.querySelectorAll('.move-step3-phone-group input')) {
			input.disabled = true;
		}
	}
}

//이전 주소 복원 함수
async function restorePreviousAddress(root, progressId, stepId, readOnly) {

	const response = await fetch(
		`/api/simulation/answers/${progressId}/${stepId}`
	);

	if (!response.ok) {
		throw new Error("3단계 입력값 조회 실패");
	}

	const answers = await response.json();

	const savedAnswer = answers.find(
		answer => answer.fieldKey === "previousAddress"
	);

	// 처음 진입한 경우 저장된 주소 없음
	if (!savedAnswer) return false;

	const address = JSON.parse(savedAnswer.answerValue);

	const sidoSelect = root.querySelector("#sidoSelect");
	const sigunguSelect = root.querySelector("#sigunguSelect");

	// 시·도 복원 (시·도 목록은 init에서 먼저 로드)
	sidoSelect.value = address.sidoCode;

	// 저장된 시·도의 시·군·구 목록 조회
	const regions = await fetchRegions(address.sidoCode);

	fillSelect(sigunguSelect, regions, "시·군·구 선택");

	// 시·군·구 복원
	sigunguSelect.value = address.sigunguCode;
	sigunguSelect.disabled = readOnly;

	// 이전 주소 조회 결과 표시
	renderPreviousAddress(root);

	// 가족정보 조회 및 복원
	families = await fetchFamily(progressId);
	familySearchCompleted = families.length > 0;

	if (familySearchCompleted) {
		renderFamily(root, readOnly);
	}

	root.querySelector("#addressStatus").textContent =
		"저장된 이전 주소와 가족정보를 불러왔습니다.";

	return true;
}


// 새 세대주가 바뀌면 관계의 기준도 달라지므로 입력값을 재설정한다.
function updateRemainingRelations(root) {
	const selectedId = root.querySelector('input[name="remainingHead"]:checked')?.value;

	for (const row of root.querySelectorAll('#remainingHeadOptions tr[data-family-id]')) {
		const relationSelect = row.querySelector("select");
		const isSelected = row.dataset.familyId === selectedId;

		relationSelect.value = isSelected ? "SELF" : "";
		const selfOption = relationSelect.querySelector('option[value="SELF"]');
		if (selfOption) selfOption.disabled = !isSelected;
		relationSelect.disabled = isSelected || !selectedId;
	}
}

function remainingRelation(root, familyId) {
	const row = [...root.querySelectorAll('#remainingHeadOptions tr[data-family-id]')]
		.find(row => row.dataset.familyId === String(familyId));
	return row?.querySelector("select")?.value || "";
}

function clearNewHeadPhone(root) {
	root.querySelector("#newHeadPhoneFirst").value = "010";
	root.querySelector("#newHeadPhoneMiddle").value = "";
	root.querySelector("#newHeadPhoneLast").value = "";
}

function setNewHeadPhone(root, phoneNum) {
	const parts = String(phoneNum).split("-");
	root.querySelector("#newHeadPhoneFirst").value = parts[0] || "010";
	root.querySelector("#newHeadPhoneMiddle").value = parts[1] || "";
	root.querySelector("#newHeadPhoneLast").value = parts[2] || "";
}

function needsRemainingHead(root) {
	return !root.querySelector("#remainingHeadSection").classList.contains("d-none");
}

function getHeadPhone(root) {
	return ["newHeadPhoneFirst", "newHeadPhoneMiddle", "newHeadPhoneLast"]
		.map(id => root.querySelector(`#${id}`).value.trim()).join("-");
}

// ==============================
// 다음 단계로 넘어가기 전 검증
// ==============================
export function validate({ root }) {
	const sido = root.querySelector("#sidoSelect");
	const sigungu = root.querySelector("#sigunguSelect");
	if (!sido.value || !sigungu.value || !familySearchCompleted || families.length === 0) {
		alert("이전 주소를 선택하고 주소조회를 완료해 주세요.");
		return false;
	}

	const moving = selectedMovingIds(root);
	const applicant = families.find(isApplicant);
	const oldHead = families.find(isOriginalHead);
	if (!applicant || !oldHead) {
		alert("신청인 또는 기존 세대주 정보가 없습니다.");
		return false;
	}
	if (!moving.has(String(applicant.familyId))) {
		alert("신청인은 반드시 이사 대상에 포함되어야 합니다.");
		const applicantCheckbox = [...root.querySelectorAll('input[name="movingFamily"]')]
			.find(input => input.value === String(applicant.familyId));
		applicantCheckbox?.focus();
		return false;
	}

	if (needsRemainingHead(root)) {
		const chosen = root.querySelector('input[name="remainingHead"]:checked');
		const remaining = families.filter(family => !moving.has(String(family.familyId)));
		if (!chosen || !remaining.some(family => String(family.familyId) === chosen.value)) {
			alert("남는 가족 중 새로운 세대주를 선택해 주세요.");
			root.querySelector('input[name="remainingHead"]')?.focus();
			return false;
		}
		// 새 세대주를 제외한 남는 가족은 새 세대주와의 관계를 각각 선택해야 함
		for (const family of remaining) {
			if (String(family.familyId) === chosen.value) continue;
			const relation = remainingRelation(root, family.familyId);
			if (!relation || relation === "SELF") {
				alert(`${family.familyName}님의 새 세대주와의 관계를 선택해 주세요.`);
				const row = [...root.querySelectorAll('#remainingHeadOptions tr[data-family-id]')]
					.find(row => row.dataset.familyId === String(family.familyId));
				row?.querySelector("select")?.focus();
				return false;
			}
		}

		if (!/^010-\d{4}-\d{4}$/.test(getHeadPhone(root))) {
			alert("새 세대주의 휴대전화번호를 올바르게 입력해 주세요.");
			root.querySelector("#newHeadPhoneFirst").focus();
			return false;
		}
	}
	return true;
}

// ==============================
// 가족 이사 여부 및 남는 세대주 저장
// [주의] 백엔드 PATCH 구현/확장이 필요함
// ==============================
export async function save({ root, progressId }) {
	if (!validate({ root })) throw new Error("3단계 입력값 검증 실패");

	const moving = selectedMovingIds(root);
	const requiresHead = needsRemainingHead(root);
	const selectedHeadId = requiresHead
		? root.querySelector('input[name="remainingHead"]:checked')?.value
		: null;

	// 모든 가족의 현재 값을 'original' 기준으로 재계산해서 전송한다.
	// 서버는 original_* 컬럼은 절대 변경하지 않고, 변경 가능한 컬럼만 갱신해야 한다.
	const request = {
		familyMembers: families.map(family => {
			const familyId = String(family.familyId);
			const isMoving = moving.has(familyId);
			const isNewRemainingHead = requiresHead && !isMoving && familyId === selectedHeadId;

			return {
				familyId: family.familyId,
				moveStatus: isMoving ? "MOVE" : "REMAIN",
				// 기존 세대주가 이사하고 남는 가족이 있을 때만 관계를 새로 반영
				relationship: requiresHead && !isMoving
					? (isNewRemainingHead ? "SELF" : remainingRelation(root, familyId))
					: family.originalRelationship,
				// 3단계에서는 '기존 주소' 기준의 세대주를 기록
				isHouseholdHead: requiresHead
					? isNewRemainingHead
					: isOriginalHead(family)
			};
		}),
		remainingHeadFamilyId: selectedHeadId ? Number(selectedHeadId) : null,
		remainingHeadPhoneNum: selectedHeadId ? getHeadPhone(root) : null
	};

	const response = await fetch(`/api/simulation/move/${progressId}/family/move`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(request)
	});
	if (!response.ok) throw new Error("가족 이사정보 저장에 실패했습니다.");

}

// ==============================
// 공통 답변 저장용 주소 데이터
// ==============================
export function getData({ root }) {
	const sido = root.querySelector("#sidoSelect");
	const sigungu = root.querySelector("#sigunguSelect");
	return {
		previousAddress: {
			sidoCode: sido.value,
			sidoName: sido.selectedOptions[0].textContent,
			sigunguCode: sigungu.value,
			sigunguName: sigungu.selectedOptions[0].textContent,
			administrativeDong: VIRTUAL_DONG,
			detailAddress: VIRTUAL_DETAIL,
			welfareCenter: VIRTUAL_CENTER
		}
	};
}