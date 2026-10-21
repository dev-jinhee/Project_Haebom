async function loadSimulation() {
	// sessionStorage에서 progressId 가져오기
	const progressId = sessionStorage.getItem("progressId");

	// progressId가 없다면 시나리오 목록으로 이동
	if (!progressId) {
		window.location.href = "/scenario";
		return;
	}
	try {
		// 진행 이력 조회 API 호출
		const progressResponse = await fetch(
			`/api/simulation/progress/${progressId}`
		);

		if (!progressResponse.ok) {
			throw new Error("진행 이력 조회 실패");
		}

		// 진행 이력 데이터 받기
		const progress = await progressResponse.json();
		//완료 여부
		const isCompleted = progress.progressStatus === "COMPLETED";

		//시나리오 상세 조회 API 호출
		const scenarioResponse = await fetch(
			`/api/scenario/${progress.scenarioId}`
		);
		if (!scenarioResponse.ok) {
			throw new Error("시나리오 상세 조회 실패");
		}
		const scenario = await scenarioResponse.json();

		//브레드 크럼
		document.querySelector("#breadcrumbScenarioTitle").textContent = scenario.scenarioTitle;

		//시나리오 정보 출력
		document.querySelector("#scenarioCategory").textContent = scenario.categoryLabel;
		document.querySelector("#scenarioTitle").textContent = scenario.scenarioTitle;
		document.querySelector("#scenarioDescription").textContent = scenario.scenarioDescription;

		// 시나리오 전체 단계 조회
		const stepsResponse = await fetch(
			`/api/scenario/${progress.scenarioId}/steps`
		);

		if (!stepsResponse.ok) {
			throw new Error("시나리오 단계 조회 실패");
		}

		const steps = await stepsResponse.json();

		// 현재 진행 중인 단계 찾기
		const currentStep = isCompleted
			? null
			: steps.find(step => step.stepId === progress.stepId);

		if (!isCompleted && !currentStep) {
			throw new Error("현재 단계를 찾을 수 없습니다.");
		}

		// 상단에 표시할 단계 목록 (사전정보 0단계 제외)
		const displaySteps = steps.filter(step => step.stepOrder > 0);


		// 현재 단계 / 전체 단계
		const stepCurrent = document.querySelector("#stepCurrent");
		stepCurrent.textContent = isCompleted
			? displaySteps.length
			: currentStep.stepOrder;
		const stepTotal = document.querySelector("#stepTotal");
		stepTotal.textContent = displaySteps.length;

		// 진행률 계산
		let progressPercent = 0;

		if (isCompleted) {
			progressPercent = 100;
		} else if (displaySteps.length > 1) {
			progressPercent =
				(Math.max(0, currentStep.stepOrder - 1)
					/ (displaySteps.length - 1)) * 100;
		}

		// 진행률 바 반영
		const stepProgress = document.querySelector("#stepProgress");
		stepProgress.style.width = `${progressPercent}%`;

		// 완료 상태에 따라 클래스 적용
		stepProgress.classList.toggle("is-completed", isCompleted);
		document.body.classList.toggle("is-completed", isCompleted);

		// 접근성을 위한 진행률 정보
		const progressBar = document.querySelector(".sim-progress-card .progress");
		progressBar.setAttribute("aria-valuenow", progressPercent);

		// 현재 단계 제목
		document.querySelector("#stepTitle").textContent = isCompleted
			? "시뮬레이션 완료"
			: currentStep.stepTitle;

		// 단계 목록 동적 생성
		const stepLabels = document.querySelector("#stepLabels");
		stepLabels.replaceChildren();

		displaySteps.forEach(step => {
			const label = document.createElement("span");

			label.classList.add("step-label");
			label.textContent = step.stepTitle;

			if (isCompleted || step.stepOrder < currentStep.stepOrder) {
				label.classList.add("completed");
			} else if (step.stepOrder === currentStep.stepOrder) {
				label.classList.add("active");
			}

			stepLabels.appendChild(label);
		});

		if (isCompleted) {
			// 완료 화면
			document.querySelector("#currentQuestion").textContent =
				"시뮬레이션 완료";

			/*document.querySelector("#questionHelp")
				.classList.add("d-none");*/

			await loadStepFragment(
				progress.scenarioId,
				"complete",
				true
			);

		} else {
			// 현재 진행 중인 단계
			document.querySelector("#currentQuestion").textContent =
				currentStep.stepTitle;

			const questionHelp = document.querySelector("#questionHelp");
			questionHelp.textContent = currentStep.stepDescription ?? "";
			questionHelp.classList.toggle(
				"d-none",
				!currentStep.stepDescription
			);

			await loadStepFragment(
				progress.scenarioId,
				currentStep.stepOrder,
				false
			);
		}
	} catch (error) {
		console.error("시뮬레이션 조회 오류:", error);
	}
}
// 단계별 JSP 화면 불러오기
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

loadSimulation();