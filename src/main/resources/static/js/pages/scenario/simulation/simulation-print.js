// ============================================================
// 해봄 | 기존 JSP + 기존 단계별 JS로 화면을 그대로 조립해 인쇄
// ============================================================
const fragmentBase = "/simulation/fragment";
const moduleBase = "/js/pages/scenario/simulation";
const stepModules = {
	MOVE: {
		1: () => import(`${moduleBase}/move/step-1.js`),
		2: () => import(`${moduleBase}/move/step-2.js`),
		3: () => import(`${moduleBase}/move/step-3.js`),
		4: () => import(`${moduleBase}/move/step-4.js`)
	}
};

const status = document.querySelector("#printStatus");
const printBtn = document.querySelector("#printBtn");
const stepContainer = document.querySelector("#printStepContainer");
const completeContainer = document.querySelector("#printCompleteContainer");
const progressId = new URLSearchParams(location.search).get("progressId");

async function getJson(url) {
	const response = await fetch(url, { credentials: "same-origin" });
	if (!response.ok) throw new Error(`${url} 조회 실패 (HTTP ${response.status})`);
	return response.json();
}

async function getFragment(scenarioCode, order) {
	const response = await fetch(`${fragmentBase}/${encodeURIComponent(scenarioCode)}/${order}`, {
		credentials: "same-origin"
	});
	if (!response.ok) throw new Error(`${order}단계 화면 조회 실패 (HTTP ${response.status})`);
	return response.text();
}

function createPage(title, order) {
	const page = document.createElement("section");
	page.className = "print-step sim-card gov24-sim-card";
	page.dataset.printStep = String(order);

	const heading = document.createElement("header");
	heading.className = "print-step-header sim-card-head";
	const headingText = document.createElement("h2");
	headingText.textContent = title;
	heading.appendChild(headingText);
	page.appendChild(heading);

	const content = document.createElement("div");
	content.className = "print-step-content sim-step-content";
	page.appendChild(content);
	return { page, content };
}

function lockControls(root) {
	root.querySelectorAll("input, textarea, select, button").forEach(el => {
		if (el instanceof HTMLInputElement && el.type === "hidden") return;
		// disabled input/select의 값과 선택 상태는 그대로 출력됩니다.
		el.disabled = true;
	});
}

async function printStep(progressId, scenarioCode, step) {
	const { page, content } = createPage(`${step.stepOrder}단계 · ${step.stepTitle}`, step.stepOrder);
	// 문서에 먼저 붙여야 기존 JS의 root.isConnected 검사에 통과합니다.
	stepContainer.appendChild(page);
	content.innerHTML = await getFragment(scenarioCode, step.stepOrder);

	try {
		const loadModule = stepModules[scenarioCode]?.[step.stepOrder];
		if (loadModule) {
			const module = await loadModule();
			if (typeof module.init === "function") {
				await module.init({ root: content, progressId, stepId: step.stepId, readOnly: true });
			}
		}
	} catch (err) {
		console.error(`인쇄 ${step.stepOrder}단계 초기화 오류`, err);
		const notice = document.createElement("p");
		notice.className = "print-warning";
		notice.textContent = "일부 저장 정보를 불러오지 못했습니다. 해당 단계의 내용이 완전하지 않을 수 있습니다.";
		page.insertBefore(notice, content);
	}
	lockControls(content);
}

async function printComplete(progressId, scenarioId, scenarioCode) {
	const { page, content } = createPage("연습 완료 · 실제 신청 안내", "complete");
	page.classList.add("print-complete-page");
	completeContainer.appendChild(page);
	content.innerHTML = await getFragment(scenarioCode, "complete");
	const module = await import(`${moduleBase}/complete.js`);
	await module.init({ root: content, progressId, scenarioId, scenarioCode });
}

async function initPrint() {
	if (!progressId || !/^[1-9]\d*$/.test(progressId)) {
		throw new Error("올바른 진행기록 ID가 아닙니다.");
	}
	// 기존 API의 로그인/회원 소유권 검증을 그대로 사용합니다.
	const progress = await getJson(`/api/simulation/progress/${progressId}`);
	if (progress.progressStatus !== "COMPLETED") {
		throw new Error("완료된 시뮬레이션만 전체 연습 화면을 인쇄할 수 있습니다.");
	}
	const scenarioId = progress.scenarioId;
	const [scenario, steps] = await Promise.all([
		getJson(`/api/scenario/${scenarioId}`),
		getJson(`/api/scenario/${scenarioId}/steps`)
	]);
	const scenarioCode = scenario.scenarioCode;
	if (!stepModules[scenarioCode]) {
		throw new Error(`아직 인쇄를 지원하지 않는 시나리오입니다: ${scenarioCode}`);
	}
	document.querySelector("#printScenarioTitle").textContent =
		`${scenario.scenarioTitle} · 단계별 연습 화면`;

	const visibleSteps = steps.filter(step => Number(step.stepOrder) > 0)
		.sort((a, b) => Number(a.stepOrder) - Number(b.stepOrder));

	let hasStepErrors = false;
	for (const step of visibleSteps) {
		try {
			await printStep(progressId, scenarioCode, step);
		} catch (err) {
			hasStepErrors = true;
			console.error(err);
			const { page } = createPage(`${step.stepOrder}단계 · ${step.stepTitle}`, step.stepOrder);
			const p = document.createElement("p");
			p.className = "print-warning";
			p.textContent = "단계 화면을 불러오지 못했습니다. PDF 저장 전 다시 시도해 주세요.";
			page.appendChild(p);
			stepContainer.appendChild(page);
		}
	}
	try {
		await printComplete(progressId, scenarioId, scenarioCode);
	} catch (err) {
		hasStepErrors = true;
		console.error("완료 화면 로딩 실패", err);
	}
	status.className = hasStepErrors ? "alert alert-warning" : "alert alert-success";
	status.textContent = hasStepErrors
		? "일부 화면을 불러오지 못했습니다. PDF 저장 전 내용을 확인해 주세요."
		: "전체 단계 화면을 불러왔습니다. 확인 후 PDF 저장 / 인쇄를 누르세요.";
	printBtn.disabled = hasStepErrors;
}

printBtn.addEventListener("click", () => window.print());
initPrint().catch(err => {
	console.error("인쇄 화면 구성 오류", err);
	status.className = "alert alert-danger";
	status.textContent = err.message || "인쇄 화면을 불러오지 못했습니다.";
});
