// ==============================
// 전입신고 1단계 유의사항 동의 검증
// ==============================
export function validate({ root }) {

    const agreeCheckbox = root.querySelector("#agreeNotice");

    if (!agreeCheckbox) {
        console.error("유의사항 동의 체크박스를 찾을 수 없습니다.");
        return false;
    }

    if (!agreeCheckbox.checked) {
        alert("유의사항을 확인하고 동의해주세요.");
        agreeCheckbox.focus();
        return false;
    }

    return true;
}