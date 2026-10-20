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

		console.log("시나리오 목록:", items);

		items.forEach(item => {
			const scenario = item.scenario;
			const progress = item.progress;

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

			// 진행 상태 적용
			if (progress) {

				const progressBox = card.querySelector("[data-scenario-progress]");
				const progressPercent = card.querySelector("[data-scenario-progress-percent]");
				const progressBar = card.querySelector("[data-scenario-progress-bar]");

				const actionText = card.querySelector("[data-scenario-action]");
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
					actionText.textContent = "이어하기";
				} else if (progress.progressStatus === "COMPLETED") {
					// 완료한 시나리오
					progressBox.classList.remove("d-none");
					progressPercent.textContent = "100%";
					progressBar.style.width = "100%";

					actionText.textContent = "작성 내역 보기";
				}
				restartBtn.classList.remove("d-none");
				deleteBtn.classList.remove("d-none");
			}
			// 6. 카드 출력
			catalog.insertBefore(card, scenarioSearchEmpty);
		});

	} catch (error) {
		console.error("시나리오 목록 조회 오류:", error);
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

