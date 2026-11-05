/**
 * 해봄 | 주민등록증 재발급 단일 단계
 * 공통 simulation.js 모듈 규약: init / getData / validate / restore
 *
 * 주의: 증명사진은 선택·미리보기만 지원한다.
 * S3 이미지 업로드 API가 아직 없어 uploadAttachments()는 구현하지 않았다.
 * 실제 완료 연동 전에는 사진 업로드 및 서버 Validator를 연결해야 한다.
 */
import { initIdentityStepUi } from "./step1-ui.js";

const $ = (root, selector) => root.querySelector(selector);
const value = (root, selector) => $(root, selector)?.value?.trim() ?? "";
const checked = (root, name) => $(root, `input[name="${name}"]:checked`)?.value ?? "";
const isChecked = (root, selector) => Boolean($(root, selector)?.checked);

function radio(root, name, val) {
    root.querySelectorAll(`input[name="${name}"]`).forEach(input => {
        input.checked = input.value === val;
    });
}

function checkConsent(root, selected) {
    const values = new Set(Array.isArray(selected) ? selected : []);
    root.querySelectorAll('input[name="documentConsent"]').forEach(input => {
        input.checked = values.has(input.value);
    });
    const items = [...root.querySelectorAll('input[name="documentConsent"]')];
    const all = $(root, "#identityConsentAll");
    if (all) all.checked = items.length > 0 && items.every(input => input.checked);
}

// 데모용 지역 선택지. 실제 수령기관 목록과 별개이며 필요한 지역은 확장 가능.
const REGIONS = {
    "서울특별시": ["종로구", "강남구"],
    "경기도": ["성남시 중원구"],
    "부산광역시": ["부산진구"]
};

function setupAddressSelects(root) {
    const sido = $(root, "#identitySido");
    const sigungu = $(root, "#identitySigungu");
    if (!sido || !sigungu) return;

    Object.keys(REGIONS).forEach(name => sido.add(new Option(name, name)));

    function renderDistricts(selected = "") {
        sigungu.replaceChildren(new Option("시군구 선택", ""));
        (REGIONS[sido.value] ?? []).forEach(name => sigungu.add(new Option(name, name)));
        sigungu.disabled = !sido.value;
        sigungu.value = selected;
    }

    sido.addEventListener("change", () => renderDistricts());
    root.renderIdentityDistricts = renderDistricts;
    renderDistricts();
}

function setupPhotoPreview(root, readOnly) {
    const input = $(root, "#identityPhotoInput");
    const preview = $(root, "#identityPhotoPreview");
    if (!input || !preview || readOnly) return;

    let currentUrl = null;
    input.addEventListener("change", () => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        currentUrl = null;
        preview.replaceChildren();
        const file = input.files?.[0];
        if (!file) return;
        const note = document.createElement("p");
        note.textContent = `선택한 파일: ${file.name}`;
        preview.appendChild(note);
        if (file.type.startsWith("image/")) {
            currentUrl = URL.createObjectURL(file);
            const img = document.createElement("img");
            img.src = currentUrl;
            img.alt = "선택한 증명사진 미리보기";
            img.style.cssText = "max-width:160px;max-height:200px;object-fit:contain;display:block;";
            preview.appendChild(img);
        }
    });
}

export async function init({ root, progressId, stepId, readOnly = false, savedData = null }) {
    if (!root) return;
    setupAddressSelects(root);
    initIdentityStepUi(root, { readOnly });
    setupPhotoPreview(root, readOnly);

    // 저장된 답변은 다른 단계와 동일한 기존 API로 읽는다.
    if (savedData) {
        restore({ root, data: savedData, readOnly });
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
        if (Object.keys(data).length) restore({ root, data, readOnly });
    }

    if (readOnly) {
        root.querySelectorAll("input, textarea, select, button").forEach(el => { el.disabled = true; });
    }
}

export function getData({ root }) {
    return {
        applicantInfo: {
            // 주민등록번호 등 민감정보는 단계 답변 JSON에 중복 저장하지 않는다.
            phone: ["#identityPhoneFirst", "#identityPhoneMiddle", "#identityPhoneLast"]
                .map(sel => value(root, sel)).join("-"),
            sido: value(root, "#identitySido"),
            sigungu: value(root, "#identitySigungu")
        },
        applicationDetails: {
            icChipIncluded: checked(root, "icChipIncluded"),
            reissueReason: checked(root, "reissueReason"),
            feeExemption: checked(root, "feeExemption"),
            pickupNotice: checked(root, "pickupNotice"),
            brailleSticker: checked(root, "brailleSticker"),
            noticeConfirmed: isChecked(root, "#identityNoticeConfirmed")
        },
        pickupDetails: {
            pickupMethod: checked(root, "pickupMethod"),
            officeName: value(root, "#identityPickupOffice"),
            officeCode: value(root, "#identityPickupOfficeCode")
        },
        documentConsents: [...root.querySelectorAll('input[name="documentConsent"]:checked')]
            .map(el => el.value)
        // 사진은 S3 업로드 완료 후 서버에서 발급된 메타데이터를 저장해야 한다.
    };
}

export function restore({ root, data = {}, readOnly = false }) {
    const applicant = data.applicantInfo ?? {};
    const application = data.applicationDetails ?? {};
    const pickup = data.pickupDetails ?? {};

    const phone = String(applicant.phone ?? "").split("-");
    ["#identityPhoneFirst", "#identityPhoneMiddle", "#identityPhoneLast"].forEach((sel, i) => {
        const el = $(root, sel);
        if (el && phone[i]) el.value = phone[i];
    });

    const sido = $(root, "#identitySido");
    if (sido) sido.value = applicant.sido ?? "";
    root.renderIdentityDistricts?.(applicant.sigungu ?? "");

    ["icChipIncluded", "reissueReason", "feeExemption", "pickupNotice", "brailleSticker"]
        .forEach(name => radio(root, name, application[name] ?? ""));
    root.syncIdentityOtherReason?.();
    const notice = $(root, "#identityNoticeConfirmed");
    if (notice) notice.checked = Boolean(application.noticeConfirmed);

    radio(root, "pickupMethod", pickup.pickupMethod ?? "VISIT");
    if ($(root, "#identityPickupOffice")) $(root, "#identityPickupOffice").value = pickup.officeName ?? "";
    if ($(root, "#identityPickupOfficeCode")) $(root, "#identityPickupOfficeCode").value = pickup.officeCode ?? "";
    checkConsent(root, data.documentConsents);

    if (readOnly) root.querySelectorAll("input, textarea, select, button").forEach(el => { el.disabled = true; });
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
        [value(root, "#identityPickupOfficeCode"), "수령기관"]
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
    const photo = $(root, "#identityPhotoInput")?.files?.[0];
    if (!photo || !/\.(jpe?g|png)$/i.test(photo.name)) {
        alert("JPG, JPEG, PNG 증명사진 1장을 선택해 주세요."); return false;
    }
    return true;
}
