
const simulationState = {
	progressId: null,
	scenarioId: null,
	scenarioCode: null,
	steps: [],
	displaySteps: [],
	isCompleted: false,
	currentStep: null,
	viewingStep: null
};

let activeStepModule = null;

// ==============================
// 시나리오별 단계 JS 모듈
// ==============================
const stepModules = {
	MOVE: {
		0: () => import("/js/pages/scenario/simulation/move/step-0.js"),
		1: () => import("/js/pages/scenario/simulation/move/step-1.js"),
		2: () => import("/js/pages/scenario/simulation/move/step-2.js"),
		3: () => import("/js/pages/scenario/simulation/move/step-3.js"),
		4: () => import("/js/pages/scenario/simulation/move/step-4.js")
	}
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

		simulationState.scenarioCode = scenario.scenarioCode;
		// 전입신고 전용 CSS 로드
		if (simulationState.scenarioCode === "MOVE") {

			// CSS 중복 로드 방지
			if (!document.querySelector('link[data-scenario="MOVE"]')) {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = "/css/pages/scenario/simulation/move.css";
				link.dataset.scenario = "MOVE";
				document.head.appendChild(link);
			}
		}

		// 브레드 크럼
		document.querySelector("#breadcrumbScenarioTitle").textContent =
			scenario.scenarioTitle;

		// 시나리오 정보 출력
		document.querySelector("#scenarioCategory").textContent =
			scenario.categoryLabel;

		document.querySelector("#scenarioTitle").textContent =
			scenario.scenarioTitle;

		// 시뮬레이션 전용 안내 문구
		document.querySelector("#scenarioDescription").textContent =
			scenario.simulationGuide ?? "";

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
	// 하단 네비게이션 갱신
	updateNavigation();

	// 단계별 JSP 화면 로딩
	await loadStepFragment(
		simulationState.scenarioCode,
		isCompleteScreen ? "complete" : activeStep.stepOrder,
		simulationState.isCompleted
	);

}

// ==============================
// 단계별 JSP 화면 불러오기
// ==============================
async function loadStepFragment(scenarioCode, stepOrder, isCompleted) {

	const response = await fetch(
		`/simulation/fragment/${scenarioCode}/${stepOrder}`
	);

	if (!response.ok) {
		throw new Error("단계 화면 조회 실패");
	}

	const html = await response.text();

	const stepContent = document.querySelector("#stepContent");
	stepContent.innerHTML = html;

	// 현재 단계 모듈 초기화
	activeStepModule = null;

	// 1. 공통 완료 화면
	if (stepOrder === "complete") {

		const completeModule = await import(
			"/js/pages/scenario/simulation/complete.js"
		);

		await completeModule.init({
			root: stepContent,
			progressId: simulationState.progressId,
			scenarioId: simulationState.scenarioId
		});

		return;
	}

	// 완료 후 단계 다시보기
	if (isCompleted) {
		stepContent
			.querySelectorAll("input, textarea, select, button")
			.forEach(element => {
				element.disabled = true;
			});
	}

	// 시나리오별 단계 JS
	const loadModule = stepModules[scenarioCode]?.[stepOrder];

	if (loadModule) {
		const stepModule = await loadModule();

		activeStepModule = stepModule;

		// init이 있는 단계에서만 실행
		if (stepModule.init) {
			// 현재 표시 중인 단계 정보
			const step = simulationState.steps.find(
				step => step.stepOrder === stepOrder
			);
			await stepModule.init({
				root: stepContent,
				progressId: simulationState.progressId,
				readOnly: isCompleted,
				// 입력 값 조회를 위한 stepId 넘기기
				//stepId: step?.stepId,
				reload: loadSimulation
			});
		}
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

	//사전 준비 단계에서는 navigation 안 보이게 설정
	const navigation = document.querySelector("#simulationNavigation");
	navigation.classList.toggle("d-none", isPreparation);

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
		return;

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
		// 완료된 시뮬레이션 - 작성 내역 조회
		const viewingStep = simulationState.viewingStep;

		prevStepBtn.classList.remove("d-none");
		nextStepBtn.classList.remove("d-none");

		if (viewingStep === null) {
			// 완료 화면
			prevStepBtn.disabled = false;
			nextStepBtn.textContent = "마치기";
		} else {
			// 단계별 작성 내역 조회
			prevStepBtn.disabled =
				viewingStep.stepOrder ===
				simulationState.displaySteps[0].stepOrder;

			nextStepBtn.textContent =
				viewingStep.stepOrder === lastStepOrder
					? "완료 화면"
					: "다음 단계";
		}

	}
}
// ==============================
// 이전 버튼 클릭 처리
// ==============================
async function handlePrevStep() {
	const steps = simulationState.displaySteps;

	if (simulationState.isCompleted) {
		// 완료 화면이라면 마지막 단계로 이동
		if (simulationState.viewingStep === null) {
			simulationState.viewingStep = steps[steps.length - 1];

		} else {
			// 현재 조회 중인 단계 위치
			const currentIndex = steps.findIndex(
				step => step.stepId === simulationState.viewingStep.stepId
			);

			// 첫 단계라면 이동하지 않음
			if (currentIndex <= 0) return;

			simulationState.viewingStep = steps[currentIndex - 1];
		}

	} else {
		// 현재 조회 중인 단계 위치
		const currentIndex = steps.findIndex(
			step => step.stepId === simulationState.currentStep.stepId
		);

		// 첫 단계라면 이동하지 않음
		if (currentIndex <= 0) return;

		const prevStep = steps[currentIndex - 1];

		// 이전 단계 이동 API 호출
		const response = await fetch(
			`/api/simulation/progress/${simulationState.progressId}/prevStep?targetStepId=${prevStep.stepId}`,
			{
				method: "PATCH"
			}
		);
		if (!response.ok) {
			throw new Error("이전 단계 이동 실패");
		}
		// API 성공 후 currentStep 갱신
		simulationState.currentStep = prevStep;
	}
	await renderSimulation();
}
// ==============================
// 다음 버튼 클릭 처리
// ==============================

async function handleNextStep() {
	// 진행 중인 단계의 입력값 검증
	if (!simulationState.isCompleted && activeStepModule?.validate) {

		const isValid = await activeStepModule.validate({
			root: document.querySelector("#stepContent")
		});

		if (!isValid) {
			return;
		}
	}

	// 단계별 저장 처리
	if (!simulationState.isCompleted && activeStepModule?.save) {
		try {
			await activeStepModule.save({
				root: document.querySelector("#stepContent"),
				progressId: simulationState.progressId
			});

		} catch (error) {
			console.error("단계별 저장 오류:", error);
			alert("정보 저장에 실패했습니다. 다시 시도해주세요.");
			return;
		}
	}
	
	// TODO : 입력값 저장 api 호출
	
	const steps = simulationState.displaySteps;
	// 완료 상태일 경우
	if (simulationState.isCompleted) {
		// 완료 화면이라면 시나리오 목록으로 이동
		if (simulationState.viewingStep === null) {
			window.location.href = "/scenario";
			return;
		} else {
			// 현재 조회 중인 단계 위치
			const currentIndex = steps.findIndex(
				step => step.stepId === simulationState.viewingStep.stepId
			);

			if (currentIndex === -1) return;

			// 마지막 단계라면 완료 화면으로 이동
			if (currentIndex >= steps.length - 1) {
				simulationState.viewingStep = null
			} else {
				simulationState.viewingStep = steps[currentIndex + 1];
			}
		}
	} else {
		// 현재 조회 중인 단계 위치
		const currentIndex = steps.findIndex(
			step => step.stepId === simulationState.currentStep.stepId
		);

		if (currentIndex === -1) return;

		// 마지막 단계라면 완료 상태 변경 후 완료 페이지 이동
		if (currentIndex === steps.length - 1) {
			//진행 상태 완료 변경 후 step_id null 처리
			const completeResponse = await fetch(
				`/api/simulation/progress/${simulationState.progressId}/complete`,
				{
					method: "PATCH"
				}
			);
			if (!completeResponse.ok) {
				throw new Error("시뮬레이션 완료 실패");
			}
			simulationState.currentStep = null
			simulationState.isCompleted = true;
			simulationState.viewingStep = null;
		} else {

			const nextStep = steps[currentIndex + 1];
			// 진행 중 다음 단계 이동 API 호출
			const nextStepResponse = await fetch(
				`/api/simulation/progress/${simulationState.progressId}/nextStep?targetStepId=${nextStep.stepId}`,
				{
					method: "PATCH"
				}
			);
			if (!nextStepResponse.ok) {
				throw new Error("다음 단계 이동 실패");
			}
			// API 성공 후 currentStep 갱신
			simulationState.currentStep = nextStep;
		}
	}
	await renderSimulation();
}

// ==============================
// 이벤트 등록
// ==============================
document.querySelector("#prevStep")
	.addEventListener("click", handlePrevStep);
document.querySelector("#nextStep")
	.addEventListener("click", handleNextStep);
// 최초 실행
loadSimulation();
