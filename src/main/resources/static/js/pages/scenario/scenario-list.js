const catalog = document.getElementById("scenarioCatalog");
const template = document.getElementById("scenarioCardTemplate");
const scenarioSearchEmpty = document.getElementById("scenarioSearchEmpty");
const searchInput = document.getElementById("scenarioSearch");
const categoryFilters = document.getElementById("scenarioCategoryFilters");
let selectedCategory = null; // null = 전체
// 시뮬레이션별 대표 아이콘
const SIMULATION_ICONS = {
	MOVE: "home",
	IDENTITY_REISSUE: "badge",
	RESIDENT_RECORD_ISSUE: "docs"
};

async function loadScenarios() {
	window.HaebomLoading.show(
		"학습을 준비하고 있어요",
		"시뮬레이션 정보를 불러오고 있습니다."
	);
	// API 호출
	try {
		const [scenarioResponse, categoryResponse] = await Promise.all([
			fetch("/api/scenario"),
			fetch("/api/scenario/categories")
		]);

		if (!scenarioResponse.ok) {
			throw new Error("시나리오 목록 조회 실패");
		}

		if (!categoryResponse.ok) {
			throw new Error("카테고리 목록 조회 실패");
		}

		const [items, categories] = await Promise.all([
			scenarioResponse.json(),
			categoryResponse.json()
		]);

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

			const icon = card.querySelector(
				".scenario-card-icon .material-symbols-outlined"
			);

			icon.textContent = SIMULATION_ICONS[scenario.scenarioCode] ?? "info";

			// 시나리오 데이터 적용
			card.dataset.scenarioId = scenario.scenarioId;
			// 카테고리 필터링용 영문 코드
			card.dataset.category = (scenario.categoryName ?? "").trim();

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
					// 기존 기록을 보존하고 새 시뮬레이션 시작
					restartBtn.disabled = true;

					try {
						await startSimulation(scenario.scenarioId);

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

					try {
						const deleted = await window.HaebomLoading.run(
							async () => {
								const success = await deleteProgress(
									progress.progressId
								);

								if (success) {
									await loadScenarios();
								}

								return success;
							},
							"진행 기록을 삭제하고 있어요",
							"삭제한 내용을 목록에 반영하고 있습니다."
						);

						if (deleted) {
							alert("진행기록이 삭제되었습니다.");
						}
					} finally {
						if (deleteBtn.isConnected) {
							deleteBtn.disabled = false;
						}
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

		// 카테고리 버튼 생성 및 필터 적용
		renderCategoryFilters(categories);
		filterScenarios();
	} catch (error) {
		console.error("시나리오 목록 조회 오류:", error);
	} finally {
		HaebomLoading.hide();
	}
}

// 시뮬레이션 이동
function openSimulation(progressId) {
	//progressId는 SessionStorage로 관리
	sessionStorage.setItem("progressId", progressId);
	window.location.href = "/simulation";
}

let isStartingSimulation = false;
//시뮬 시작
async function startSimulation(scenarioId) {
	if (isStartingSimulation) return;

	isStartingSimulation = true;
	try {
		await window.HaebomLoading.run(async () => {
			const response = await fetch(
				`/api/scenario/${scenarioId}/start`,
				{ method: "POST" }
			);

			if (!response.ok) {
				throw new Error("시나리오 시작 실패");
			}

			const progressId = await response.json();
			openSimulation(progressId);
		},
			"학습을 시작하고 있어요",
			"시뮬레이션 진행 정보를 준비하고 있습니다."
		);
	} catch (error) {
		console.error("시나리오 시작 오류:", error);
		alert("시뮬레이션 시작 중 오류가 발생했습니다.");
	} finally {
		isStartingSimulation = false;
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


// ==============================
// 카테고리 필터 버튼 생성
// ==============================
function renderCategoryFilters(categories) {
	if (!categoryFilters) return;

	// DB에서 가져온 카테고리 목록
	const availableCategories = Array.isArray(categories)
		? categories.filter(category => category?.categoryName)
		: [];

	// 삭제된 카테고리가 선택되어 있다면 전체로 변경
	if (
		selectedCategory !== null &&
		!availableCategories.some(
			category => category.categoryName === selectedCategory
		)
	) {
		selectedCategory = null;
	}

	// 기존 버튼 초기화
	categoryFilters.replaceChildren();

	// 전체 + DB 카테고리
	const options = [
		{ categoryName: null, categoryLabel: "전체" },
		...availableCategories
	];

	options.forEach(({ categoryName, categoryLabel }) => {
		const button = document.createElement("button");

		button.type = "button";
		button.className = "scenario-category-button";
		button.textContent = categoryLabel || categoryName || "전체";

		// 선택된 버튼 활성화
		const isActive = selectedCategory === categoryName;

		button.classList.toggle("is-active", isActive);
		button.setAttribute("aria-pressed", String(isActive));

		// 카테고리 선택 이벤트
		button.addEventListener("click", () => {
			selectedCategory = categoryName;

			renderCategoryFilters(categories);
			filterScenarios();
		});

		categoryFilters.appendChild(button);
	});
}

// ==============================
// 시나리오 검색 및 카테고리 필터링
// ==============================
function filterScenarios() {
	const keyword = searchInput.value.trim().toLowerCase();

	const cards = catalog.querySelectorAll(".scenario-item");

	let visibleCount = 0;

	cards.forEach(card => {
		const searchText = card.dataset.search ?? "";

		// 검색어 일치 여부
		const isSearchMatch = searchText.includes(keyword);

		// 카테고리 일치 여부
		const isCategoryMatch =
			selectedCategory === null ||
			card.dataset.category === selectedCategory;

		// 검색어와 카테고리 조건 모두 충족
		const isMatch = isSearchMatch && isCategoryMatch;

		card.classList.toggle("d-none", !isMatch);

		if (isMatch) {
			visibleCount++;
		}
	});

	// 검색어가 있을 때만 검색 결과 없음 표시
	const showSearchEmpty =
		keyword.length > 0 && visibleCount === 0;

	scenarioSearchEmpty.classList.toggle(
		"d-none",
		!showSearchEmpty
	);
}

loadScenarios();
// 검색창에 입력할 때마다 실행
searchInput.addEventListener("input", filterScenarios);

