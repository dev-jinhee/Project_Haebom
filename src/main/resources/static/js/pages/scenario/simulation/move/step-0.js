
// ==============================
// 전입신고 0단계 초기화
// ==============================
export function init({ root, progressId, readOnly, reload }) {

	// 완료 후 다시보기에서는 수정 이벤트 등록하지 않음
	if (readOnly) return;

	const tbody = root.querySelector("#householdPeopleBody");
	const template = root.querySelector("#householdPersonRowTemplate");

	const addButton = root.querySelector("#addHouseholdPerson");
	const removeButton = root.querySelector("#removeHouseholdPerson");
	const startButton = root.querySelector("#startMoveSimulation");

	loadMemberProfile(tbody);

	// 가족 구성원 행 목록
	const getRows = () => Array.from(
		tbody.querySelectorAll("tr[data-person-row]")
	);

	// 마지막 행 삭제 버튼 상태 갱신
	function updateRemoveButton() {
		removeButton.disabled = getRows().length <= 1;
	}

	// ==============================
	// 가족 구성원 추가
	// ==============================
	addButton.addEventListener("click", () => {
		const newRow = template.content.firstElementChild.cloneNode(true);

		tbody.appendChild(newRow);
		updateRemoveButton();
	});

	// ==============================
	// 마지막 가족 구성원 삭제
	// ==============================
	removeButton.addEventListener("click", () => {
		const rows = getRows();

		if (rows.length <= 1) return;

		const lastRow = rows[rows.length - 1];
		const wasHead = lastRow.querySelector(
			'[name="householdHead"]'
		).checked;

		lastRow.remove();

		// 삭제한 사람이 세대주였다면 신청인을 세대주로 복구
		if (wasHead) {
			const applicantRow = tbody.querySelector(
				'[data-person-id="applicant"]'
			);

			selectHouseholdHead(applicantRow);
		}

		updateRemoveButton();
	});

	// ==============================
	// 세대주 단일 선택
	// ==============================
	function selectHouseholdHead(selectedRow) {
		const rows = getRows();

		const previousHead = rows.find(row =>
			row.querySelector('[name="householdHead"]').checked
		);

		rows.forEach(row => {
			const checkbox = row.querySelector('[name="householdHead"]');
			const relationship = row.querySelector('[name="householdRelation"]');

			const isSelected = row === selectedRow;

			checkbox.checked = isSelected;

			if (isSelected) {
				relationship.value = "SELF";
			} else if (previousHead !== selectedRow) {
				// 세대주 변경 시 기존 관계를 다시 선택하도록 초기화
				relationship.value = "";
			}
		});
	}

	// 체크박스 변경 이벤트
	tbody.addEventListener("change", event => {

		if (event.target.matches('[name="householdHead"]')) {
			const row = event.target.closest("tr");

			if (event.target.checked) {
				selectHouseholdHead(row);
			} else {
				// 세대주가 반드시 한 명 있도록 유지
				event.target.checked = true;
			}
		}

		if (event.target.matches('[name="householdRelation"]')) {
			const row = event.target.closest("tr");
			const checkbox = row.querySelector('[name="householdHead"]');

			if (event.target.value === "SELF") {
				selectHouseholdHead(row);
			} else if (checkbox.checked) {
				// 세대주의 관계는 항상 SELF
				event.target.value = "SELF";
			}
		}
	});

	// ==============================
	// 시뮬레이션 시작 버튼
	// ==============================
	startButton.addEventListener("click", async () => {
		if (startButton.disabled) return;

		try {
			startButton.disabled = true;

			// 1. 가족 정보 수집
			const familyMembers = collectFamilyMembers(tbody);

			// 2. 입력값 검증
			validateFamilyMembers(familyMembers);

			// 3. urlsearchparams로 변환
			const params = new URLSearchParams();
			familyMembers.forEach((member, index) => {
				params.append(`familyMembers[${index}].familyName`, member.familyName);
				params.append(`familyMembers[${index}].birthDate`, member.birthDate);
				params.append(`familyMembers[${index}].gender`, member.gender);
				params.append(`familyMembers[${index}].isApplicant`, member.isApplicant);
				params.append(`familyMembers[${index}].isOriginalHead`, member.isOriginalHead);
				params.append(`familyMembers[${index}].originalRelationship`, member.originalRelationship);
			});

			// 4. 사전정보 저장 및 1단계 이동 API
			const response = await fetch(
				`/api/simulation/move/${progressId}/start`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
					},
					body: params
				}
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);

				throw new Error(
					errorData?.message ?? "사전정보 저장에 실패했습니다."
				);
			}

			// 5. 변경된 진행 정보 조회 및 화면 갱신
			await reload();

		} catch (error) {
			console.error("전입신고 시작 실패:", error);
			alert(error.message);

		} finally {
			startButton.disabled = false;
		}
	});

	updateRemoveButton();
}

// ==============================
// 로그인 회원정보 조회
// ==============================
async function loadMemberProfile(tbody) {
	try {
		const response = await fetch("/api/mypage/profile");

		if (!response.ok) {
			throw new Error("회원정보 조회 실패");
		}

		const profile = await response.json();

		// 실제 Step0의 input ID에 맞게 수정
		const nameInput = tbody.querySelector("#householdName");
		const birthInput = tbody.querySelector("#householdBirthdate");
		const genderInput = tbody.querySelector("#householdGender");

		if (nameInput) {
			nameInput.value = profile.memberName ?? "";
		}

		if (birthInput) {
			birthInput.value = profile.birthDate ?? "";
		}

		if (genderInput) {
			genderInput.value = profile.gender ?? "";
		}

	} catch (error) {
		console.error("회원정보 자동 입력 실패:", error);
	}
}

// ==============================
// 가족 구성원 정보 수집
// ==============================
function collectFamilyMembers(tbody) {

	const rows = tbody.querySelectorAll("tr[data-person-row]");

	return Array.from(rows).map(row => ({
		familyName: row.querySelector('[name="personName"]').value.trim(),
		birthDate: row.querySelector('[name="personBirthdate"]').value,
		gender: row.querySelector('[name="personGender"]').value,

		isApplicant: row.dataset.personId === "applicant",

		isOriginalHead: row.querySelector(
			'[name="householdHead"]'
		).checked,

		originalRelationship: row.querySelector(
			'[name="householdRelation"]'
		).value
	}));
}


// ==============================
// 가족 구성원 정보 검증
// ==============================
function validateFamilyMembers(members) {

	if (members.length === 0) {
		throw new Error("가족 구성원을 입력해주세요.");
	}

	for (const member of members) {

		if (!member.familyName) {
			throw new Error("가족 구성원의 이름을 입력해주세요.");
		}

		if (!member.birthDate) {
			throw new Error("생년월일을 입력해주세요.");
		}

		if (!member.gender) {
			throw new Error("성별을 선택해주세요.");
		}

		if (!member.originalRelationship) {
			throw new Error("세대주와의 관계를 선택해주세요.");
		}
	}

	// 신청인은 정확히 한 명
	const applicantCount = members.filter(
		member => member.isApplicant
	).length;

	if (applicantCount !== 1) {
		throw new Error("신청인은 반드시 한 명이어야 합니다.");
	}

	// 최초 세대주는 정확히 한 명
	const headCount = members.filter(
		member => member.isOriginalHead
	).length;

	if (headCount !== 1) {
		throw new Error("세대주는 반드시 한 명이어야 합니다.");
	}

	// 세대주 여부와 관계 일치 확인
	for (const member of members) {

		const isHead = member.isOriginalHead;
		const isSelf = member.originalRelationship === "SELF";

		if (isHead !== isSelf) {
			throw new Error(
				"세대주와의 관계를 확인해주세요."
			);
		}
	}
}
