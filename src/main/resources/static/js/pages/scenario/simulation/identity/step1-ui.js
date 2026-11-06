// 주민등록증 재발급 단일 단계: UI 전용 로직
// step-1.js의 init({ root, readOnly }) 내부에서 initIdentityStepUi(root, { readOnly }) 호출
// save/getData/restoreData 로직은 별도로 유지하세요.

// 실제 기관 코드나 수령 가능 여부가 아닌 해봄 체험용 예시 데이터
const EXAMPLE_OFFICES = [
    { code: "DEMO-001", name: "서울특별시 종로구 청운효자동 주민센터 (예시)", area: "서울 종로구 청운효자동" },
    { code: "DEMO-002", name: "서울특별시 종로구 사직동 주민센터 (예시)", area: "서울 종로구 사직동" },
    { code: "DEMO-003", name: "서울특별시 강남구 역삼1동 주민센터 (예시)", area: "서울 강남구 역삼1동" },
    { code: "DEMO-004", name: "경기도 성남시 중원구 금광1동 행정복지센터 (예시)", area: "경기 성남시 중원구 금광1동" },
    { code: "DEMO-005", name: "경기도 성남시 중원구 상대원1동 행정복지센터 (예시)", area: "경기 성남시 중원구 상대원1동" },
    { code: "DEMO-006", name: "부산광역시 부산진구 부전1동 행정복지센터 (예시)", area: "부산 부산진구 부전1동" }
];

export function initIdentityStepUi(root, { readOnly = false } = {}) {
    if (!root) return;
    const chipRadios = root.querySelectorAll('input[name="icChipIncluded"]');
    const otherLabel = root.querySelector("#identityOtherReasonOption");
    const otherRadio = otherLabel?.querySelector('input[name="reissueReason"]');
    const dialog = root.querySelector("#identityOfficeDialog");
    const openBtn = root.querySelector("#identitySearchOfficeBtn");
    const closeBtn = root.querySelector("#identityOfficeCloseBtn");
    const searchBtn = root.querySelector("#identityOfficeSearchBtn");
    const searchInput = root.querySelector("#identityOfficeKeyword");
    const resultBody = root.querySelector("#identityOfficeResults");
    const resultStatus = root.querySelector("#identityOfficeResultStatus");
    const officeName = root.querySelector("#identityPickupOffice");
    const officeCode = root.querySelector("#identityPickupOfficeCode");

    function syncOtherReason() {
        const selected = root.querySelector('input[name="icChipIncluded"]:checked')?.value;
        const show = selected === "Y";
        if (!otherLabel || !otherRadio) return;
        otherLabel.hidden = !show;
        otherRadio.disabled = !show || readOnly;
        if (!show) otherRadio.checked = false;
    }

    chipRadios.forEach(radio => radio.addEventListener("change", syncOtherReason));
    syncOtherReason();

    // 다른 로직이 값을 복원한 다음 호출해도 상태를 동기화할 수 있도록 공개
    root.syncIdentityOtherReason = syncOtherReason;

    function renderOffices() {
        if (!resultBody) return;
        resultBody.replaceChildren();
        const keyword = (searchInput?.value || "").trim().toLocaleLowerCase("ko-KR");
        const matches = EXAMPLE_OFFICES.filter(item =>
            `${item.name} ${item.area}`.toLocaleLowerCase("ko-KR").includes(keyword)
        );

        for (const item of matches) {
            const row = document.createElement("tr");
            const nameCell = document.createElement("td");
            const areaCell = document.createElement("td");
            const actionCell = document.createElement("td");
            const choose = document.createElement("button");
            nameCell.textContent = item.name;
            areaCell.textContent = item.area;
            choose.type = "button";
            choose.className = "btn btn-sm btn-outline-primary";
            choose.textContent = "선택";
            choose.addEventListener("click", () => {
                if (officeName) officeName.value = item.name;
                if (officeCode) officeCode.value = item.code;
                dialog?.close();
                openBtn?.focus();
            });
            actionCell.append(choose);
            row.append(nameCell, areaCell, actionCell);
            resultBody.append(row);
        }
        if (resultStatus) resultStatus.textContent = `${matches.length}개 예시 기관이 검색되었습니다.`;
    }

    if (readOnly) {
        if (openBtn) openBtn.disabled = true;
        return;
    }

    openBtn?.addEventListener("click", () => {
        renderOffices();
        if (dialog && !dialog.open) dialog.showModal();
        searchInput?.focus();
    });
    closeBtn?.addEventListener("click", () => dialog?.close());
    searchBtn?.addEventListener("click", renderOffices);
    searchInput?.addEventListener("input", renderOffices);
    searchInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") { event.preventDefault(); renderOffices(); }
    });

    const all = root.querySelector("#identityConsentAll");
    const items = [...root.querySelectorAll('input[name="documentConsent"]')];
    all?.addEventListener("change", () => {
        items.forEach(input => { input.checked = all.checked; });
    });
    items.forEach(input => input.addEventListener("change", () => {
        if (all) all.checked = items.length > 0 && items.every(item => item.checked);
    }));
    if (all) all.checked = items.length > 0 && items.every(item => item.checked);
}
