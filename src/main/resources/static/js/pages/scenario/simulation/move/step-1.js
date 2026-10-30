// ==============================
// 전입신고 1단계 초기화
// ==============================
export async function init({ root, progressId, readOnly,stepId }) {
	 // 저장된 입력값 조회
    const response = await fetch(
        `/api/simulation/answers/${progressId}/${stepId}`
    );

    if (!response.ok) {
        throw new Error("1단계 입력값 조회 실패");
    }

    const answers = await response.json();

    // 저장된 동의 여부 복원
    const agreeAnswer = answers.find(
        answer => answer.fieldKey === "agreeNotice"
    );

    if (agreeAnswer) {
        root.querySelector("#agreeNotice").checked =
            agreeAnswer.answerValue === "true";
    }
}

// ==============================
// 전입신고 1단계 DB 저장 데이터
// ==============================
export function getData({ root }) {
    return {
        agreeNotice: root.querySelector("#agreeNotice").checked
    };
}
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