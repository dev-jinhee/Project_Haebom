// ============================================================
// 해봄 | 전입신고 4단계: 현재 주소 / 세대 구성 방법
// simulation.js 계약: init({root, progressId, stepId, readOnly}), validate({root}), getData({root})
// step-3.js/step-03.jsp 및 기존 Juso 팝업 연동은 변경하지 않음
// 참고: 이번 단계의 실제 DB 저장(save)은 아직 연결하지 않음
// ============================================================

const JUSO_POPUP_URL = "/address/juso/popup";
const FAMILY_API = progressId => `/api/simulation/move/${progressId}/family`;
const VIRTUAL_WELFARE_CENTER = "해봄동 행정복지센터 (가상)";
const RELATIONS = [
    ["", "관계 선택"], ["SPOUSE", "배우자"], ["CHILD", "자녀"],
    ["FATHER", "부"], ["MOTHER", "모"], ["PARENT", "부모"], ["OTHER", "기타"]
];

let movingFamilies = [];
let applicant = null;
let addressSelected = false;
let activeRoot = null;
let existingHeadMockConfirmed = false;

const $ = (root, id) => root.querySelector(`#${id}`);
const isApplicant = family => family.isApplicant === true || family.applicant === true;

const birthLabel = value => {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}년 ${match[2]}월 ${match[3]}일` : (value || "-");
};
const genderLabel = value => value === "M" ? "남" : value === "F" ? "여" : "-";

async function fetchMovingFamilies(progressId) {
    const response = await fetch(FAMILY_API(progressId));
    if (!response.ok) throw new Error("가족 정보를 불러오지 못했습니다.");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("가족정보 응답 형식이 올바르지 않습니다.");
    return data.filter(family => family.moveStatus === "MOVE");
}

// 공통 팝업 콜백(window.opener.jusoCallBack)이 호출하는 함수
function applyJusoAddress(root, data) {
    if (!root.isConnected || root !== activeRoot || !data?.roadAddrPart1) return;

    const oldAddress = $(root, "newRoadAddress").value;
    const oldZip = $(root, "newZipNo").value;
    if (oldAddress !== data.roadAddrPart1 || oldZip !== (data.zipNo || "")) {
        $(root, "newDetailAddress").value = "";
    }

    $(root, "newRoadAddress").value = data.roadAddrPart1;
    $(root, "newZipNo").value = data.zipNo || "";
    $(root, "newJibunAddress").value = data.jibunAddr || "";
    $(root, "newAdmCd").value = data.admCd || "";
    $(root, "newRnMgtSn").value = data.rnMgtSn || "";
    $(root, "newBdMgtSn").value = data.bdMgtSn || "";
    $(root, "newSiNm").value = data.siNm || "";
    $(root, "newSggNm").value = data.sggNm || "";
    $(root, "newEmdNm").value = data.emdNm || "";
    $(root, "newBuildingPosition").value = data.udrtYn === "1" ? "1" : "0";
    $(root, "newBuildingMainNo").value = data.buldMnnm || "";
    $(root, "newBuildingSubNo").value = data.buldSlno || "";
    $(root, "newAddressResultText").textContent = data.roadAddrPart1;
    $(root, "newWelfareCenter").textContent = VIRTUAL_WELFARE_CENTER;
    $(root, "newAddressResultSection").classList.remove("d-none");

    addressSelected = true;
    $(root, "newAddressStatus").textContent = "주소가 선택되었습니다. 상세주소와 세대 구성 정보를 입력해 주세요.";
}

function addCell(tr, text) {
    const td = document.createElement("td");
    td.textContent = text ?? "-";
    tr.appendChild(td);
    return td;
}

function createRelationSelect(family) {
    const select = document.createElement("select");
    select.className = "form-select form-select-sm";
    select.dataset.familyId = String(family.familyId);
    select.setAttribute("aria-label", `${family.familyName} 세대주와의 관계`);
    for (const [code, label] of RELATIONS) select.add(new Option(label, code));
    return select;
}

function maskPhone(phone) {
    const match = String(phone || "").match(/^([0-9]{2,3})-([0-9]{3,4})-([0-9]{4})$/);
    return match ? `${match[1]}-****-${match[3]}` : "미등록";
}

function readOnlyPhoneCell(tr, family) {
    const td = document.createElement("td");
    const span = document.createElement("span");
    span.className = "move-step4-phone-static";
    span.textContent = maskPhone(family.phoneNum);
    td.appendChild(span);
    tr.appendChild(td);
}

function phoneParts(name, familyId, initialValue = "") {
    const container = document.createElement("div");
    container.className = "move-step4-phone-fields move-step4-family-phone";
    container.dataset.familyId = String(familyId);
    const parts = /^\d{2,3}-\d{3,4}-\d{4}$/.test(initialValue)
        ? initialValue.split("-") : ["", "", ""];

    [3, 4, 4].forEach((max, i) => {
        if (i) {
            const separator = document.createElement("span");
            separator.setAttribute("aria-hidden", "true");
            separator.textContent = "–";
            container.appendChild(separator);
        }
        const input = document.createElement("input");
        input.type = "tel";
        input.inputMode = "numeric";
        input.autocomplete = "off";
        input.className = "form-control form-control-sm";
        input.maxLength = max;
        input.value = parts[i] || "";
        input.placeholder = i === 0 ? "010" : i === 1 ? "1234" : "5678";
        input.setAttribute("aria-label", `${name} 휴대전화번호 ${i === 0 ? "앞" : i === 1 ? "가운데" : "뒷"}자리`);
        input.addEventListener("input", () => {
            input.value = input.value.replace(/\D/g, "").slice(0, max);
        });
        container.appendChild(input);
    });
    return container;
}

function readPhoneParts(element) {
    if (!element) return null;
    const parts = [...element.querySelectorAll("input")].map(input => input.value.trim());
    if (parts.every(part => !part)) return null;
    return parts.join("-");
}

function validOptionalPhone(phone) {
    return !phone || /^010-\d{4}-\d{4}$/.test(phone);
}

function renderNewHeadTable(root) {
    const tbody = $(root, "newAddressHeadTableBody");
    tbody.replaceChildren();
    for (const family of movingFamilies) {
        const isHead = applicant && String(family.familyId) === String(applicant.familyId);
        const tr = document.createElement("tr");
        tr.dataset.familyId = String(family.familyId);

        const choice = document.createElement("td");
        if (isHead) {
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "newAddressHead";
            radio.value = String(family.familyId);
            radio.className = "form-check-input";
            radio.checked = true;
            radio.disabled = true;  // 참고 화면: 신청인을 새 세대주로 고정
            radio.setAttribute("aria-label", `${family.familyName} 신청인 세대주 고정`);
            choice.appendChild(radio);
        } else {
            choice.textContent = "—";
        }
        tr.appendChild(choice);

        if (isHead) addCell(tr, "본인");
        else {
            const relTd = document.createElement("td");
            relTd.appendChild(createRelationSelect(family));
            tr.appendChild(relTd);
        }
        addCell(tr, family.familyName);
        addCell(tr, birthLabel(family.birthDate));
        addCell(tr, genderLabel(family.gender));
        readOnlyPhoneCell(tr, family);
        tbody.appendChild(tr);
    }
}

function renderExistingRelations(root) {
    const tbody = $(root, "existingHeadRelationsBody");
    tbody.replaceChildren();
    for (const family of movingFamilies) {
        const tr = document.createElement("tr");
        tr.dataset.familyId = String(family.familyId);

        const relTd = document.createElement("td");
        relTd.appendChild(createRelationSelect(family));
        tr.appendChild(relTd);
        addCell(tr, family.familyName);
        addCell(tr, birthLabel(family.birthDate));
        addCell(tr, genderLabel(family.gender));
        const phoneTd = document.createElement("td");
        phoneTd.appendChild(phoneParts(family.familyName, family.familyId, family.phoneNum));
        tr.appendChild(phoneTd);
        tbody.appendChild(tr);
    }
}

function setHouseholdMode(root) {
    const mode = root.querySelector('input[name="newHouseholdType"]:checked')?.value;
    $(root, "newHeadSelectionSection").classList.toggle("d-none", mode !== "NEW_HOUSEHOLD");
    $(root, "existingHeadSection").classList.toggle("d-none", mode !== "JOIN_EXISTING");
    if (mode === "NEW_HOUSEHOLD") {
        $(root, "newHouseholdHeadSummary").textContent = applicant
            ? `${applicant.familyName} (신청인)` : "신청인 정보를 확인해 주세요.";
    } else if (mode === "JOIN_EXISTING") {
        $(root, "newHouseholdHeadSummary").textContent =
            $(root, "existingHeadName").value.trim() || "기존 거주 세대주 (이름 미입력)";
    } else {
        $(root, "newHouseholdHeadSummary").textContent = "선택된 세대주가 없습니다.";
    }
}

function markExistingHeadUnconfirmed(root) {
    existingHeadMockConfirmed = false;
    const status = $(root, "existingHeadConfirmStatus");
    status.textContent = "세대주 이름을 입력한 후 학습용 확인 버튼을 눌러 주세요.";
    status.classList.remove("text-success");
}

function mockConfirmExistingHead(root) {
    const name = $(root, "existingHeadName").value.trim();
    if (!name) {
        markExistingHeadUnconfirmed(root);
        $(root, "existingHeadConfirmStatus").textContent = "가상 세대주 이름을 먼저 입력해 주세요.";
        $(root, "existingHeadName").focus();
        return;
    }
    existingHeadMockConfirmed = true;
    const status = $(root, "existingHeadConfirmStatus");
    status.classList.add("text-success");
    status.textContent = `${name} 세대주 확인 과정을 학습용으로 완료했습니다. 실제 본인확인이나 문자 발송은 수행하지 않았습니다.`;
}

export async function init({ root, progressId, stepId, readOnly = false }) {
    activeRoot = root;
    movingFamilies = [];
    applicant = null;
    addressSelected = false;
    existingHeadMockConfirmed = false;
    window.jusoCallBack = data => applyJusoAddress(root, data);

    if (readOnly) {
        $(root, "newAddressStatus").textContent = "완료된 단계입니다. 저장값 복원은 공통 답변 조회 기능 연결 후 제공됩니다.";
        root.querySelectorAll("input, button, select").forEach(el => {
            if (el.type !== "hidden") el.disabled = true;
        });
        return;
    }

    $(root, "searchNewAddressBtn").addEventListener("click", () => {
        const popup = window.open(JUSO_POPUP_URL, "haebomJusoPopup", "width=570,height=650,scrollbars=yes,resizable=yes");
        if (!popup) {
            $(root, "newAddressStatus").textContent = "팝업이 차단되었습니다. 브라우저 팝업을 허용해 주세요.";
        } else popup.focus();
    });

    root.querySelectorAll('input[name="newHouseholdType"]').forEach(radio => {
        radio.addEventListener("change", () => setHouseholdMode(root));
    });
    $(root, "existingHeadName").addEventListener("input", () => {
        markExistingHeadUnconfirmed(root);
        setHouseholdMode(root);
    });
    $(root, "mockExistingHeadConfirmBtn").addEventListener("click", () => mockConfirmExistingHead(root));
    $(root, "existingHeadSection").querySelectorAll('.move-step4-phone-fields input').forEach(input => {
        input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, ""); });
    });

    try {
        movingFamilies = await fetchMovingFamilies(progressId);
        if (!movingFamilies.length) throw new Error("이사 대상으로 선택한 가족이 없습니다. 3단계를 확인해 주세요.");
        applicant = movingFamilies.find(isApplicant) || null;
        if (!applicant) throw new Error("3단계에서 신청인을 이사 대상으로 선택했는지 확인해 주세요.");
        if (!root.isConnected || root !== activeRoot) return;
        renderNewHeadTable(root);
        renderExistingRelations(root);
        setHouseholdMode(root);
    } catch (error) {
        if (!root.isConnected || root !== activeRoot) return;
        console.error("4단계 가족 조회 실패:", error);
        $(root, "newAddressStatus").textContent = error.message;
    }
}

export function validate({ root }) {
    if (!addressSelected || !$(root, "newRoadAddress").value.trim()) {
        alert("이사 온 곳의 주소를 검색하여 선택해 주세요.");
        $(root, "searchNewAddressBtn").focus();
        return false;
    }
    if (!movingFamilies.length || !applicant) {
        alert("이사 대상 및 신청인 정보를 불러오지 못했습니다. 3단계를 확인해 주세요.");
        return false;
    }
    const mode = root.querySelector('input[name="newHouseholdType"]:checked')?.value;
    if (!mode) {
        alert("세대 구성 방법을 선택해 주세요.");
        return false;
    }
    if (mode === "NEW_HOUSEHOLD") {
        const selections = [...root.querySelectorAll("#newAddressHeadTableBody select[data-family-id]")];
        if (selections.some(select => !select.value)) {
            alert("신청인 외 함께 이사하는 가족의 관계를 모두 선택해 주세요.");
            selections.find(select => !select.value)?.focus();
            return false;
        }
    } else if (mode === "JOIN_EXISTING") {
        if (!$(root, "existingHeadName").value.trim()) {
            alert("기존 거주 세대주의 가상 이름을 입력해 주세요.");
            $(root, "existingHeadName").focus();
            return false;
        }
        if (!existingHeadMockConfirmed) {
            alert("기존 세대주 확인 체험을 완료해 주세요. 실제 주민등록번호는 입력하지 않습니다.");
            $(root, "mockExistingHeadConfirmBtn").focus();
            return false;
        }
        const headPhone = readPhoneParts($(root, "existingHeadSection").querySelector('[data-phone-group="existingHeadPhone"]'));
        if (!validOptionalPhone(headPhone)) {
            alert("기존 세대주 연락처를 입력한다면 010-1234-5678 형식으로 완성해 주세요.");
            return false;
        }
        for (const tr of $(root, "existingHeadRelationsBody").querySelectorAll("tr[data-family-id]")) {
            const select = tr.querySelector("select[data-family-id]");
            if (!select?.value) {
                alert("이사하는 모든 가족과 기존 세대주의 관계를 선택해 주세요.");
                select?.focus();
                return false;
            }
            if (!validOptionalPhone(readPhoneParts(tr.querySelector(".move-step4-family-phone")))) {
                alert("가족별 연락처는 010-1234-5678 형식으로 입력하거나 비워 주세요.");
                return false;
            }
        }
    }
    return true;
}

// simulation_answer가 도입되면 이 객체를 공통 답변 저장 API로 전송할 수 있음.
// 주민등록번호 필드는 저장하거나 전송하지 않음. 세대주 확인 여부는 학습용 표시값일 뿐 법적 확인이 아님.
export function getData({ root }) {
    const mode = root.querySelector('input[name="newHouseholdType"]:checked')?.value || null;
    let familyRelations = [];
    if (mode === "NEW_HOUSEHOLD") {
        familyRelations = movingFamilies.map(family => {
            const isHead = applicant && String(family.familyId) === String(applicant.familyId);
            const row = [...$(root, "newAddressHeadTableBody").querySelectorAll("tr[data-family-id]")]
                .find(tr => tr.dataset.familyId === String(family.familyId));
            return {
                familyId: Number(family.familyId),
                relationship: isHead ? "SELF" : (row?.querySelector("select")?.value || null)
            };
        });
    } else if (mode === "JOIN_EXISTING") {
        familyRelations = [...$(root, "existingHeadRelationsBody").querySelectorAll("tr[data-family-id]")]
            .map(tr => ({
                familyId: Number(tr.dataset.familyId),
                relationship: tr.querySelector("select[data-family-id]")?.value || null,
                phoneNum: readPhoneParts(tr.querySelector(".move-step4-family-phone"))
            }));
    }
    return {
        currentAddress: {
            roadAddress: $(root, "newRoadAddress").value || null,
            zipNo: $(root, "newZipNo").value || null,
            detailAddress: $(root, "newDetailAddress").value.trim() || null,
            jibunAddress: $(root, "newJibunAddress").value || null,
            admCd: $(root, "newAdmCd").value || null,
            rnMgtSn: $(root, "newRnMgtSn").value || null,
            bdMgtSn: $(root, "newBdMgtSn").value || null,
            sidoName: $(root, "newSiNm").value || null,
            sigunguName: $(root, "newSggNm").value || null,
            emdName: $(root, "newEmdNm").value || null,
            buildingPosition: $(root, "newBuildingPosition").value || null,
            buildingMainNo: $(root, "newBuildingMainNo").value || null,
            buildingSubNo: $(root, "newBuildingSubNo").value || null
        },
        householdType: mode,
        newHouseholdHeadFamilyId: mode === "NEW_HOUSEHOLD" ? Number(applicant?.familyId) : null,
        existingHeadName: mode === "JOIN_EXISTING" ? $(root, "existingHeadName").value.trim() || null : null,
        existingHeadPhoneNum: mode === "JOIN_EXISTING"
            ? readPhoneParts($(root, "existingHeadSection").querySelector('[data-phone-group="existingHeadPhone"]')) : null,
        existingHeadCheck: mode === "JOIN_EXISTING" && existingHeadMockConfirmed ? "SIMULATED" : null,
        familyRelations,
        additionalServices: [...root.querySelectorAll('input[name="additionalService"]:checked')].map(input => input.value)
    };
}
