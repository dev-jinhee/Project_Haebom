
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

let savedFormSnapshot = null;
let allowUnload = false;

function getFormSnapshot() {
	const root = document.querySelector("#stepContent");
	if (!root) return null;

	const fields = [...root.querySelectorAll(
		"input, select, textarea"
	)].filter(el =>
		!["button", "submit", "reset"].includes(el.type)
	);

	return JSON.stringify(fields.map(el => ({
		key: el.name || el.id,
		type: el.type,
		value: el.type === "checkbox" || el.type === "radio"
			? el.checked
			: el.type === "file"
				? [...el.files].map(file => [
					file.name,
					file.size,
					file.lastModified
				])
				: el.value
	})));
}

function hasUnsavedChanges() {
	return !simulationState.isCompleted &&
		savedFormSnapshot !== null &&
		getFormSnapshot() !== savedFormSnapshot;
}

// 시뮬레이션별 대표 아이콘
const SIMULATION_ICONS = {
	MOVE: "home",
	IDENTITY_REISSUE: "badge",
	RESIDENT_RECORD_ISSUE: "docs"
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
	},
	IDENTITY_REISSUE: {
		1: () => import("/js/pages/scenario/simulation/identity/step-1.js")
	},
	RESIDENT_RECORD_ISSUE: {
		1: () => import("/js/pages/scenario/simulation/certificate/step-1.js")
	}
};

// 아이콘 변경 함수
function updateSimulationIcon(scenarioCode) {
	const icon = document.querySelector(
		"#simulationIcon .material-symbols-outlined"
	);

	if (!icon) return;

	icon.textContent = SIMULATION_ICONS[scenarioCode] ?? "info";
}

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

	window.HaebomLoading.show(
		"학습을 준비하고 있어요",
		"시뮬레이션 정보를 불러오고 있습니다."
	);

	try {
		// 진행 이력 조회 API 호출
		const fromHistory = new URLSearchParams(window.location.search).get("history") === "true";
		const progressUrl = fromHistory
			? `/api/simulation/progress/${simulationState.progressId}/history`
			: `/api/simulation/progress/${simulationState.progressId}`;
		const progressResponse = await fetch(progressUrl);

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

		updateSimulationIcon(simulationState.scenarioCode);
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
		} else if (simulationState.scenarioCode === "IDENTITY_REISSUE") {
			// CSS 중복 로드 방지
			if (!document.querySelector('link[data-scenario="IDENTITY_REISSUE"]')) {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = "/css/pages/scenario/simulation/identity.css";
				link.dataset.scenario = "IDENTITY_REISSUE";
				document.head.appendChild(link);
			}
		} else if (simulationState.scenarioCode === "RESIDENT_RECORD_ISSUE") {
			// CSS 중복 로드 방지
			if (!document.querySelector('link[data-scenario="RESIDENT_RECORD_ISSUE"]')) {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = "/css/pages/scenario/simulation/certificate.css";
				link.dataset.scenario = "RESIDENT_RECORD_ISSUE";
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
	} finally {
		window.HaebomLoading.hide();
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

	// 0단계와 완료 화면에서는 인쇄 버튼 숨김
	document.querySelector("#printSection").hidden =
		isCompleteScreen || Number(activeStep?.stepOrder) === 0;

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
	savedFormSnapshot = null;

	const notice = document.getElementById("simulationNotice");

	if (notice) {
		notice.hidden = isCompleted && stepOrder === "complete";
	}

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
			scenarioId: simulationState.scenarioId,
			scenarioCode: simulationState.scenarioCode
		});

		window.scrollTo({
			top: 0,
			behavior: "smooth"
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
				stepId: step?.stepId,
				reload: loadSimulation
			});
		}
	}
	window.scrollTo({
		top: 0,
		behavior: "smooth"
	});
	// 단계별 JS 초기화 및 저장 데이터 복원이 끝난 뒤 기준값 설정
	savedFormSnapshot = isCompleted ? null : getFormSnapshot();
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
			nextStepBtn.textContent = "시나리오 목록보기";
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
// 현재 단계 입력값 수집
// ==============================
async function collectStepAnswers() {

	const root = document.querySelector("#stepContent");
	const stepId = simulationState.currentStep.stepId;

	// Step별 getData() 호출
	const data = activeStepModule?.getData
		? await activeStepModule.getData({ root })
		: {};

	// 입력값을 서버 DTO 형식으로 변환
	const answers = Object.entries(data)
		.filter(([, value]) => value !== null && value !== undefined)
		.map(([fieldKey, value]) => ({
			stepId,
			fieldKey,
			answerValue: typeof value === "string"
				? value
				: JSON.stringify(value),
			isJson: typeof value === "object"
		}));

	return { answers };
}

// ==============================
// 이전 버튼 클릭 처리
// ==============================
async function handlePrevStep() {
	const steps = simulationState.displaySteps;
	if (!simulationState.isCompleted && hasUnsavedChanges()) {
		const confirmed = confirm(
			"현재 단계에서 입력한 내용은 저장되지 않았습니다.\n" +
			"이전 단계로 이동하면 작성 중인 내용이 사라질 수 있습니다.\n" +
			"이동하시겠습니까?"
		);

		if (!confirmed) return;
	}

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

	// 첨부파일 업로드
	if (!simulationState.isCompleted && activeStepModule?.uploadAttachments) {
		try {
			await activeStepModule.uploadAttachments({
				root: document.querySelector("#stepContent"),
				progressId: simulationState.progressId
			});
		} catch (error) {
			console.error("첨부파일 업로드 실패:", error);
			alert("첨부파일 업로드에 실패했습니다. 다시 시도해 주세요.");
			return;
		}
	}

	// 입력값 저장 api 호출
	const requestBody = !simulationState.isCompleted
		? await collectStepAnswers()
		: null;

	const params = toAnswerParams(requestBody);

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
			try {
				const completeResponse = await fetch(
					`/api/simulation/progress/${simulationState.progressId}/complete`,
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
						},
						body: params
					}
				);

				if (!completeResponse.ok) {
					// 완료 API 실패 시 S3 첨부파일 정리
					// 4xx 검증 오류에 한해서만 자동 삭제
					if (completeResponse.status >= 400 &&
						completeResponse.status < 500 &&
						activeStepModule?.cleanupAttachments) {

						await activeStepModule.cleanupAttachments({
							root: document.querySelector("#stepContent"),
							progressId: simulationState.progressId
						});
					}

					alert("신청 완료에 실패했습니다. 입력값을 확인하고 다시 시도해 주세요.");
					return;
				}

			} catch (error) {
				console.error("시뮬레이션 완료 요청 오류:", error);
				alert("신청 결과를 확인할 수 없습니다. 진행 상태를 확인해 주세요.");
				return;
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
					method: "PATCH",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
					},
					body: params
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
// 입력값을 URLSearchParams로 변환
// ==============================

function toAnswerParams(requestBody) {

	const params = new URLSearchParams();

	requestBody?.answers?.forEach((answer, index) => {
		params.append(`answers[${index}].stepId`, answer.stepId);
		params.append(`answers[${index}].fieldKey`, answer.fieldKey);

		const value = answer.answerValue ?? "";

		params.append(
			`answers[${index}].answerValue`,
			answer.isJson
				? encodeURIComponent(value)
				: value
		);
	});

	return params;
}

// ==============================
// 공통 텍스트 입력 특수문자 제한
// ==============================

function filterSpecialCharacters(event) {

	const input = event.target;

	if (!input.matches('input[type="text"], textarea')) return;

	// 상세주소는 별도 규칙 적용
	if (input.matches("[data-address-detail]")) {
		input.value = input.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s#(),/-]/g, "");
		return;
	}

	// 일반 텍스트: 한글, 영문, 숫자, 공백만 허용
	input.value = input.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/g, "");
}

// ==============================
// 이벤트 등록
// ==============================
// 버튼 연속 클릭 시 중복 저장/이동 API 호출 방지
let simulationActionInProgress = false;

async function runSimulationNavigation(action, title, description) {
	if (simulationActionInProgress) return;
	simulationActionInProgress = true;

	const prevButton = document.querySelector("#prevStep");
	const nextButton = document.querySelector("#nextStep");
	const prevDisabled = prevButton?.disabled;
	const nextDisabled = nextButton?.disabled;

	if (prevButton) prevButton.disabled = true;
	if (nextButton) nextButton.disabled = true;

	try {
		await window.HaebomLoading.run(action, title, description);
	} catch (error) {
		console.error("시뮬레이션 단계 처리 오류:", error);
		alert("요청을 처리하지 못했습니다. 다시 시도해 주세요.");
	} finally {
		simulationActionInProgress = false;
		if (prevButton) prevButton.disabled = prevDisabled;
		if (nextButton) nextButton.disabled = nextDisabled;
		if (simulationState.displaySteps.length > 0) updateNavigation();
	}
}

document.querySelector("#prevStep")
	.addEventListener("click", () => {
		void runSimulationNavigation(
			handlePrevStep,
			"이전 단계를 불러오고 있어요",
			"작성 내용을 준비하고 있습니다."
		);
	});

document.querySelector("#nextStep")
	.addEventListener("click", () => {
		const steps = simulationState.displaySteps;
		const isLastStep = !simulationState.isCompleted &&
			simulationState.currentStep?.stepId === steps[steps.length - 1]?.stepId;
		const title = simulationState.isCompleted
			? "작성 내용을 불러오고 있어요"
			: isLastStep
				? "신청 체험을 마무리하고 있어요"
				: "다음 단계를 준비하고 있어요";
		const description = simulationState.isCompleted
			? "이전 학습 내용을 확인하고 있습니다."
			: "입력한 내용을 저장하고 있습니다.";

		void runSimulationNavigation(handleNextStep, title, description);
	});
document.querySelector("#printBtn")
	.addEventListener("click", () => {
		window.print();
	});
document.querySelector("#stepContent").addEventListener(
	"input",
	filterSpecialCharacters
);

//휴대전화번호 숫자만 입력 허용
function sanitizeDigitsOnly(input) {
	input.value = input.value.replace(/\D/g, "");
}

// 숫자가 아닌 문자 제거
document.addEventListener("input", (event) => {
	const input = event.target;

	if (!input.matches?.("input[data-digits-only]")) return;
	if (event.isComposing) return;

	sanitizeDigitsOnly(input);
});

// 한글 입력기(IME) 조합이 끝난 경우에도 처리
document.addEventListener("compositionend", (event) => {
	const input = event.target;

	if (!input.matches?.("input[data-digits-only]")) return;

	sanitizeDigitsOnly(input);
});

// 최초 실행
loadSimulation();


// 새로고침, 탭 닫기, 브라우저 뒤로 가기 등
window.addEventListener("beforeunload", event => {
	if (allowUnload || !hasUnsavedChanges()) return;

	event.preventDefault();
	event.returnValue = "";
});

// 페이지 내 링크를 클릭하여 이동하려는 경우
document.addEventListener("click", event => {
	const link = event.target.closest?.("a[href]");
	if (!link || event.defaultPrevented) return;

	// 새 탭 열기, 다운로드, Ctrl/Command 클릭은 제외
	if (
		(link.target && link.target !== "_self") ||
		link.hasAttribute("download") ||
		event.ctrlKey || event.metaKey ||
		event.shiftKey || event.altKey
	) return;

	const destination = new URL(link.href, location.href);

	if (!["http:", "https:"].includes(destination.protocol)) return;

	// 같은 페이지 내부 앵커 이동은 제외
	const samePageHash =
		destination.origin === location.origin &&
		destination.pathname === location.pathname &&
		destination.search === location.search &&
		destination.hash &&
		destination.hash !== location.hash;

	if (samePageHash || !hasUnsavedChanges()) return;

	const confirmed = confirm(
		"현재 단계에서 입력한 내용은 저장되지 않았습니다.\n" +
		"페이지를 나가면 입력한 내용이 사라질 수 있습니다.\n" +
		"정말 나가시겠습니까?"
	);

	if (!confirmed) {
		event.preventDefault();
		event.stopPropagation();
		return;
	}

	// 확인한 경우 브라우저 기본 경고가 중복되지 않도록 처리
	allowUnload = true;
}, true);

