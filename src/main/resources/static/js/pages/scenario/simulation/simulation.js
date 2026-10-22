
const simulationState = {
	progressId: null,
	scenarioId: null,
	steps: [],
	displaySteps: [],
	isCompleted: false,
	currentStep: null,
	viewingStep: null
};

// ==============================
// 시뮬레이션 최초 로딩
// ==============================
async function loadSimulation() {
	// sessionStorage에서 progressId 가져오기
	simulationState.progressId = sessionStorage.getItem("progressId");

	// progressId가 없다면 시나리오 목록으로 이동
	if (!simulationState.progressId) {
		window.location.href = "/scenario";
		return;
	}

	try {
		// 진행 이력 조회 API 호출
		const progressResponse = await fetch(
			`/api/simulation/progress/${simulationState.progressId}`
		);

		if (!progressResponse.ok) {
			throw new Error("진행 이력 조회 실패");
		}

		// 진행 이력 데이터 받기
		const progress = await progressResponse.json();

		simulationState.scenarioId = progress.scenarioId;

		// 완료 여부
		simulationState.isCompleted =
			progress.progressStatus === "COMPLETED";

		// 시나리오 상세 조회 API 호출
		const scenarioResponse = await fetch(
			`/api/scenario/${simulationState.scenarioId}`
		);

		if (!scenarioResponse.ok) {
			throw new Error("시나리오 상세 조회 실패");
		}

		const scenario = await scenarioResponse.json();

		// 브레드 크럼
		document.querySelector("#breadcrumbScenarioTitle").textContent =
			scenario.scenarioTitle;

		// 시나리오 정보 출력
		document.querySelector("#scenarioCategory").textContent =
			scenario.categoryLabel;

		document.querySelector("#scenarioTitle").textContent =
			scenario.scenarioTitle;

		/*document.querySelector("#scenarioDescription").textContent =
			scenario.description ?? "";*/

		// 시나리오 전체 단계 조회
		const stepsResponse = await fetch(
			`/api/scenario/${simulationState.scenarioId}/steps`
		);

		if (!stepsResponse.ok) {
			throw new Error("시나리오 단계 조회 실패");
		}

		// Mapper에서 stepOrder ASC로 정렬되어 반환
		const steps = await stepsResponse.json();
		simulationState.steps = steps;

		// 상단에 표시할 단계 목록 (사전정보 0단계 제외)
		simulationState.displaySteps = steps.filter(
			step => step.stepOrder > 0
		);

		if (simulationState.displaySteps.length === 0) {
			throw new Error("시나리오 단계가 없습니다.");
		}

		// 현재 진행 중인 단계 찾기
		simulationState.currentStep = simulationState.isCompleted
			? null
			: steps.find(
				step => step.stepId === progress.stepId
			);

		if (!simulationState.isCompleted &&
			!simulationState.currentStep) {
			throw new Error("현재 단계를 찾을 수 없습니다.");
		}

		// 완료 상태 최초 진입 시 완료 화면 표시
		simulationState.viewingStep = null;

		// 화면 렌더링
		await renderSimulation();
	} catch (error) {
		console.error("시뮬레이션 조회 오류:", error);
	}
}

// ==============================
// 렌더링 부분 - 진행률
// ==============================
async function renderSimulation() {

	// 실제 화면에 표시할 단계
	const activeStep = simulationState.isCompleted
		? simulationState.viewingStep
		: simulationState.currentStep;

	// 완료 화면인지 확인
	const isCompleteScreen =
		simulationState.isCompleted && simulationState.viewingStep === null;

	// 현재 단계 / 전체 단계
	const stepCurrent = document.querySelector("#stepCurrent");

	stepCurrent.textContent = isCompleteScreen
		? simulationState.displaySteps.length
		: activeStep.stepOrder;

	const stepTotal = document.querySelector("#stepTotal");
	stepTotal.textContent = simulationState.displaySteps.length;

	// 진행률 계산
	let progressPercent = 0;

	if (simulationState.isCompleted) {
		progressPercent = 100;
	} else if (simulationState.displaySteps.length > 1) {
		progressPercent =
			(Math.max(0, activeStep.stepOrder - 1)
				/ (simulationState.displaySteps.length - 1)) * 100;
	}

	// 진행률 바 반영
	const stepProgress = document.querySelector("#stepProgress");
	stepProgress.style.width = `${progressPercent}%`;

	// 완료 상태에 따라 클래스 적용
	stepProgress.classList.toggle(
		"is-completed",
		simulationState.isCompleted
	);

	document.body.classList.toggle(
		"is-completed",
		simulationState.isCompleted
	);

	// 접근성을 위한 진행률 정보
	const progressBar = document.querySelector(
		".sim-progress-card .progress"
	);

	progressBar.setAttribute("aria-valuenow", progressPercent);

	// 현재 단계 제목
	document.querySelector("#stepTitle").textContent =
		isCompleteScreen
			? "시뮬레이션 완료"
			: activeStep.stepTitle;

	// 공통 질문 영역
	const currentQuestion = document.querySelector("#currentQuestion");
	const questionHelp = document.querySelector("#questionHelp");

	if (currentQuestion) {
		currentQuestion.textContent = isCompleteScreen
			? "시뮬레이션 완료"
			: activeStep.stepTitle;
	}

	if (questionHelp && !isCompleteScreen) {
		questionHelp.textContent = activeStep.stepDescription ?? "";
		questionHelp.classList.toggle(
			"d-none",
			!activeStep.stepDescription
		);
	}

	// 완료 화면일 때 도움말 숨김 (추후 필요하면 사용)
	/*if (isCompleteScreen) {
		document.querySelector("#questionHelp")
			.classList.add("d-none");
	}*/

	// 단계 목록 동적 생성
	const stepLabels = document.querySelector("#stepLabels");
	stepLabels.replaceChildren();

	simulationState.displaySteps.forEach(step => {
		const label = document.createElement("span");

		label.classList.add("step-label");
		label.textContent = step.stepTitle;

		if (
			simulationState.isCompleted ||
			step.stepOrder < activeStep.stepOrder
		) {
			label.classList.add("completed");

		} else if (
			step.stepOrder === activeStep.stepOrder
		) {
			label.classList.add("active");
		}

		stepLabels.appendChild(label);
	});

	// 단계별 JSP 화면 로딩
	await loadStepFragment(
		simulationState.scenarioId,
		isCompleteScreen ? "complete" : activeStep.stepOrder,
		simulationState.isCompleted
	);
	// 하단 네비게이션 갱신
	updateNavigation();
}

// ==============================
// 단계별 JSP 화면 불러오기
// ==============================
async function loadStepFragment(scenarioId, stepOrder, isCompleted) {

	const response = await fetch(
		`/simulation/fragment/${scenarioId}/${stepOrder}`
	);

	if (!response.ok) {
		throw new Error("단계 화면 조회 실패");
	}

	const html = await response.text();

	const stepContent = document.querySelector("#stepContent");
	stepContent.innerHTML = html;

	// 완료된 시뮬레이션은 입력 기능 비활성화
	if (isCompleted) {
		stepContent
			.querySelectorAll("input, textarea, select, button")
			.forEach(element => {
				element.disabled = true;
			});
	}
}

// ==============================
// 하단 네비게이션 버튼 설정
// ==============================
function updateNavigation() {

	// 사전 준비 단계 여부
	const isPreparation =
		!simulationState.isCompleted &&
		simulationState.currentStep.stepOrder === 0;

	// 마지막 실제 단계 번호
	const lastStepOrder =
		simulationState.displaySteps[simulationState.displaySteps.length - 1].stepOrder;

	// 진행 중인 마지막 단계인지
	const isLastStep =
		!simulationState.isCompleted &&
		simulationState.currentStep.stepOrder === lastStepOrder;

	const prevStepBtn = document.querySelector("#prevStep");
	const nextStepBtn = document.querySelector("#nextStep");

	if (isPreparation) {
		// 사전 정보 단계 = 0단계
		prevStepBtn.classList.add("d-none");

		nextStepBtn.classList.remove("d-none");
		nextStepBtn.textContent = "시뮬레이션 시작하기";

	} else if (!simulationState.isCompleted) {
		// 1단계부터 마지막 단계까지
		prevStepBtn.classList.remove("d-none");

		prevStepBtn.disabled =
			simulationState.currentStep.stepOrder ===
			simulationState.displaySteps[0].stepOrder;

		nextStepBtn.classList.remove("d-none");

		nextStepBtn.textContent = isLastStep
			? "신청하기"
			: "다음 단계";

	} else {
		// 완료 화면
		// TODO : 추후 viewingStep으로 작성 내역 탐색 구현
		prevStepBtn.classList.remove("d-none");
		prevStepBtn.disabled = false;

		nextStepBtn.classList.remove("d-none")
		nextStepBtn.textContent = "마치기"
	}
}
// ==============================
// 다음 버튼 클릭 처리
// ==============================

function handleNextStep() {
	// 완료 화면에서 마치기
	if (simulationState.isCompleted &&
		simulationState.viewingStep === null) {

		window.location.href = "/scenario";
		return;
	}
	// TODO : 추후 다음 단계 이동 기능 구현
}

// ==============================
// 이벤트 등록
// ==============================
document.querySelector("#nextStep").addEventListener("click", () => {
	handleNextStep()
});
// 최초 실행
loadSimulation();
