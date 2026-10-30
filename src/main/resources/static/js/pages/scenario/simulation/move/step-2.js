// ==============================
// 전입신고 2단계 초기화
// ==============================
export async function init({ root, progressId, readOnly, stepId }) {
	const phoneInputs = [
		root.querySelector("#phoneFirst"),
		root.querySelector("#phoneMiddle"),
		root.querySelector("#phoneLast")
	];
	const reasonRadios = root.querySelectorAll(
		'input[name="moveReason"]'
	);

	const otherRadio = root.querySelector("#reasonOther");
	const otherInput = root.querySelector("#moveReasonDetail");

	// 저장된 입력 값 있으면 가져와 화면에 반영
	// 저장된 입력값 조회
	const initresponse = await fetch(
		`/api/simulation/answers/${progressId}/${stepId}`
	);

	if (!initresponse.ok) {
		throw new Error("2단계 입력값 조회 실패");
	}

	const answers = await initresponse.json();

	// 저장된 전입 사유 복원
	const moveReason = answers.find(
		answers => answers.fieldKey === "moveReason"
	);

	if (moveReason) {
		const selectedRadio = Array.from(reasonRadios).find(
			radio => radio.value === moveReason.answerValue
		);

		if (selectedRadio) {
			selectedRadio.checked = true;
		}
		// 기타 사유 복원
		if (moveReason.answerValue == "OTHER") {
			const detail = answers.find(
				answers => answers.fieldKey === "moveReasonDetail"
			);
			otherInput.disabled = false;
			otherInput.value = detail?.answerValue ?? "";
		}
	}


	// 가족정보 조회 API 구현 후 연결
	const response = await fetch(`/api/simulation/move/${progressId}/applicant`);
	if (!response) {
		throw new Error("신청인 조회 실패");
	}

	// 신청인 데이터 받기
	const applicant = await response.json();
	root.querySelector("#applicantName").value = applicant.familyName;

	if (applicant.phoneNum) {
		const phoneNumbers = applicant.phoneNum.split("-");

		phoneInputs[0].value = phoneNumbers[0];
		phoneInputs[1].value = phoneNumbers[1];
		phoneInputs[2].value = phoneNumbers[2];

	}
	// 완료 후 다시보기에서는 수정 이벤트 등록하지 않음
	if (readOnly) return;

	// 휴대전화번호 숫자만 입력
	phoneInputs.forEach(input => {

		input.addEventListener("input", () => {

			input.value = input.value.replace(/\D/g, "");

		});
	});

	// 기타 사유 입력 활성화
	function updateOtherInput() {

		const isOther = otherRadio.checked;

		otherInput.disabled = !isOther;

		if (!isOther) {
			otherInput.value = "";
		}
	}

	// 전입사유 선택 변경
	reasonRadios.forEach(radio => {

		radio.addEventListener("change", updateOtherInput);

	});

	// 최초 화면 상태 적용
	updateOtherInput();
}
// ==============================
// 전입신고 2단계 필수 입력값 검증
// ==============================
export function validate({ root }) {
	const phoneInputs = [
		root.querySelector("#phoneFirst"),
		root.querySelector("#phoneMiddle"),
		root.querySelector("#phoneLast")
	];
	const reasonRadios = root.querySelectorAll(
		'input[name="moveReason"]'
	);
	const selectedReason = root.querySelector(
		'input[name="moveReason"]:checked'
	);

	const otherRadio = root.querySelector("#reasonOther");
	const otherInput = root.querySelector("#moveReasonDetail");

	// 휴대전화번호 검증
	if (!/^010$/.test(phoneInputs[0].value) ||
		!/^\d{4}$/.test(phoneInputs[1].value) ||
		!/^\d{4}$/.test(phoneInputs[2].value)) {

		alert("휴대전화번호를 올바르게 입력해주세요.");

		if (phoneInputs[0].value !== "010") {
			phoneInputs[0].focus();
		} else if (!/^\d{4}$/.test(phoneMiddle.value)) {
			phoneInputs[1].focus();
		} else {
			phoneInputs[2].focus();
		}

		return false;
	}
	// 전입 사유 라디오 버튼 검증
	if (!selectedReason || (otherRadio.checked && !otherInput.value.trim())) {
		if (!selectedReason) {
			alert("전입 사유를 선택해 주세요.");
			reasonRadios.focus();
		} else if (otherRadio.checked && !otherInput.value.trim()) {
			alert("기타 전입 사유를 입력해주세요.");
			otherInput.focus();
		}
		return false;
	}
	// 모든 검증 통과
	return true;
}

// ==============================
// 전입신고 2단계 공통 입력값 수집
// ==============================
export function getData({ root }) {

	const selectedReason = root.querySelector(
		'input[name="moveReason"]:checked'
	);

	const otherRadio = root.querySelector("#reasonOther");
	const otherInput = root.querySelector("#moveReasonDetail");

	return {
		moveReason: selectedReason?.value ?? null,
		moveReasonDetail: otherRadio.checked
			? otherInput.value.trim()
			: null
	};
}

// ==============================
// 전입신고 2단계 가족정보 저장
// ==============================
export async function save({ root, progressId }) {

	const phoneInputs = [
		root.querySelector("#phoneFirst"),
		root.querySelector("#phoneMiddle"),
		root.querySelector("#phoneLast")
	];

	const phoneNum = phoneInputs
		.map(input => input.value)
		.join("-");
		
	const params = new URLSearchParams();
	params.append("phoneNum",phoneNum);

	// 신청인 휴대전화번호 UPDATE
	const response = await fetch(
		`/api/simulation/move/${progressId}/applicant/phone`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
			},
			body: params
		}
	);

	if (!response.ok) {
		throw new Error("신청인 휴대전화번호 저장 실패");
	}

}