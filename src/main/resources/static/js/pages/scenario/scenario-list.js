const catalog = document.getElementById("scenarioCatalog");
const template = document.getElementById("scenarioCardTemplate");
const scenarioSearchEmpty = document.getElementById("scenarioSearchEmpty");
const searchInput = document.getElementById("scenarioSearch");
async function loadScenarios() {
	// API 호출
	try {
		const response = await fetch("/api/scenario");

		if (!response.ok) {
			throw new Error("시나리오 목록 조회 실패");
		}

		const items = await response.json();

		// 기존에 생성된 카드 초기화
		catalog.querySelectorAll(".scenario-item")
			.forEach(card => card.remove());

		items.forEach(item => {
			const scenario = item.scenario;
			const progress = item.progress?.progressStatus === "DELETED"
				? null
				: item.progress;

			// 템플릿 복제
			const card = template.content.firstElementChild.cloneNode(true);

			// 시나리오 데이터 적용
			card.dataset.scenarioId = scenario.scenarioId;

			card.querySelector("[data-scenario-title]").textContent = scenario.scenarioTitle;

			card.querySelector("[data-scenario-description]").textContent =
				scenario.description;

			// 카테고리 적용
			card.querySelector("[data-scenario-category]").textContent = scenario.categoryLabel;
			// 단계 수 적용
			card.querySelector("[data-scenario-step-count]").textContent = `${scenario.stepCount}단계`;
			// 예상 소요 시간 적용
			card.querySelector("[data-scenario-estimated-minutes]").textContent = `예상 ${scenario.estimatedMinutes}분`;

			// 검색 대상 문자열 설정
			card.dataset.search = [
				scenario.scenarioTitle,
				scenario.categoryLabel
			].filter(Boolean).join(" ").toLowerCase();

			// 메인 버튼 가져오기
			const actionBtn = card.querySelector("[data-scenario-action]");

			// 진행 상태 적용
			if (progress) {

				const progressBox = card.querySelector("[data-scenario-progress]");
				const progressPercent = card.querySelector("[data-scenario-progress-percent]");
				const progressBar = card.querySelector("[data-scenario-progress-bar]");
				const restartBtn = card.querySelector("[data-scenario-restart]");
				const deleteBtn = card.querySelector("[data-scenario-delete]");

				card.querySelector("[data-scenario-state]").classList.remove("d-none");
				card.querySelector("[data-scenario-state]").textContent = progress.progressStatusLabel;
				if (progress.progressStatus === "IN_PROGRESS") {
					// 진행 중인 시나리오
					progressBox.classList.remove("d-none");
					// 진행률 계산
					const totalSteps = Number(scenario.stepCount);
					const currentStep = progress.stepOrder ?? 0;

					const completedSteps = Math.max(0, currentStep - 1);

					const percent = totalSteps > 0
						? Math.min(100, Math.round(completedSteps / totalSteps * 100))
						: 0;
					progressPercent.textContent = `${percent}%`;
					progressBar.style.width = `${percent}%`;

					// 버튼 변경
					actionBtn.textContent = "이어하기";

					actionBtn.addEventListener("click", () => {
						openSimulation(progress.progressId);
					});
				} else if (progress.progressStatus === "COMPLETED") {
					// 완료한 시나리오
					progressBox.classList.remove("d-none");
					progressPercent.textContent = "100%";
					progressBar.style.width = "100%";

					actionBtn.textContent = "작성 내역 보기";
					actionBtn.addEventListener("click", () => {
						openSimulation(progress.progressId);
					});
				}
				restartBtn.classList.remove("d-none");
				deleteBtn.classList.remove("d-none");
				restartBtn.addEventListener("click", async () => {
					// 기존 기록 삭제 후 연습 재시작
					const confirmed = confirm(
						"기존 진행기록을 삭제하고 처음부터 시작하시겠습니까?"
					);

					if (!confirmed) return;

					restartBtn.disabled = true;

					try {
						const newProgressId = await restartSimulation(
							progress.progressId
						);

						if (newProgressId == null) return;

						// 새 시뮬레이션으로 이동
						openSimulation(newProgressId);

					} finally {
						restartBtn.disabled = false;
					}

				});
				deleteBtn.addEventListener("click", async () => {
					// 진행 기록 삭제
					const confirmed = confirm(
						"진행기록을 삭제하시겠습니까?\n삭제된 입력값은 복구할 수 없습니다."
					);

					if (!confirmed) return;

					deleteBtn.disabled = true;

					const deleted = await deleteProgress(progress.progressId);

					if (deleted) {
						alert("진행기록이 삭제되었습니다.");
						await loadScenarios();
					} else {
						deleteBtn.disabled = false;
					}
				});
			}

			actionBtn.addEventListener("click", () => {
				if (!progress) {
					// 연습 시작하기
					startSimulation(scenario.scenarioId);
				}
			});
			// 6. 카드 출력
			catalog.insertBefore(card, scenarioSearchEmpty);
		});

	} catch (error) {
		console.error("시나리오 목록 조회 오류:", error);
	}
}

// 시뮬레이션 이동
function openSimulation(progressId) {
	//progressId는 SessionStorage로 관리
	sessionStorage.setItem("progressId", progressId);
	window.location.href = "/simulation";
}
//시뮬 시작
async function startSimulation(scenarioId) {
	try {
		const response = await fetch(`/api/scenario/${scenarioId}/start`, {
			method: "POST"
		});
		if (!response.ok) {
			throw new Error("시나리오 시작 실패");
		}
		const progressId = await response.json();

		openSimulation(progressId);

	} catch (error) {
		console.error("시나리오 시작 오류:", error);
	}
}
//시뮬 진행기록 삭제
async function deleteProgress(progressId) {
	try {
		const response = await fetch(`/api/simulation/progress/${progressId}`, {
			method: "DELETE"
		})
		if (!response.ok) {
			throw new Error("진행기록 삭제 실패");
		}
		return true;
	} catch (error) {
		console.error("시나리오 진행기록 삭제 오류:", error);
		alert("진행기록 삭제 중 오류가 발생했습니다.");
		return false;
	}
}

//시뮬 재시작
async function restartSimulation(progressId) {
	try {
		const response = await fetch(`/api/simulation/progress/${progressId}/restart`, {
			method: "POST"
		})
		if (!response.ok) {
			throw new Error("시뮬레이션 재시작 실패");
		}
		return true;
	} catch (error) {
		console.error("시뮬레이션 재시작 삭제 오류:", error);
		alert("시뮬레이션 재시작 중 오류가 발생했습니다.");
		return false;
	}
}

function filterScenarios() {
	const keyword = searchInput.value.trim().toLowerCase();

	// API로 생성한 카드들 조회
	const cards = catalog.querySelectorAll(".scenario-item");

	let visibleCount = 0;

	cards.forEach(card => {
		const searchText = card.dataset.search ?? "";

		const isMatch = searchText.includes(keyword);

		// 검색어와 일치하면 표시, 아니면 숨김
		card.classList.toggle("d-none", !isMatch);

		if (isMatch) {
			visibleCount++;
		}
	});

	// 표시되는 카드가 없으면 안내 문구 표시
	scenarioSearchEmpty.classList.toggle(
		"d-none",
		visibleCount > 0
	);
}

loadScenarios();
// 검색창에 입력할 때마다 실행
searchInput.addEventListener("input", filterScenarios);

