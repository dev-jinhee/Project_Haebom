// ==============================
// 시나리오별 완료 안내 데이터
// ==============================

const completionGuides = {
	MOVE: {
		title: "전입신고 절차를 연습했어요!",
		description:
			"전입신고의 모든 단계를 체험했습니다. " +
			"실제 신고 전에 아래 내용을 확인해 보세요.",

		checklist: [
			"이사한 주소와 전입일 확인",
			"전입할 세대원 및 세대주 정보 확인",
			"온라인 신청을 위한 본인인증 수단 준비",
			"방문 신청 시 필요한 신분증 등 서류 확인",
			"세대주 확인이 필요한 경우 해당 절차 확인"
		],

		guideDescription:
			"실제 전입신고 시 알아두어야 할 기본 사항입니다.",

		guide: [
			{
				label: "신고 기한",
				value: "전입한 날부터 14일 이내"
			},
			{
				label: "신청 방법",
				value: "인터넷 또는 방문"
			},
			{
				label: "온라인 신청",
				value: "본인 신청 가능 (대리 신청 불가)"
			},
			{
				label: "수수료",
				value: "없음"
			},
			{
				label: "처리 기간",
				value: "즉시 (근무시간 내 3시간)"
			}
		],

		note:
			"세대 구성과 신청 상황에 따라 확인 절차 및 " +
			"필요 서류가 달라질 수 있습니다. " +
			"정확한 사항은 정부24 공식 안내를 확인하세요.",

		officialUrl:
			"https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000016"
	}
};

// ==============================
// 공통 완료 화면 초기화
// ==============================

export async function init({
	root,
	progressId,
	scenarioId,
	scenarioCode
}) {

	const guide = completionGuides[scenarioCode];

	// ==============================
	// 1. 완료 메시지
	// ==============================

	const title = root.querySelector("#completeTitle");
	const description = root.querySelector("#completeDescription");

	title.textContent =
		guide?.title ?? "행정절차 연습을 완료했어요!";

	description.textContent =
		guide?.description ??
		"모든 연습 단계를 마쳤습니다. 실제 신청 전 필요한 사항을 확인해 보세요.";

	// ==============================
	// 2. 실제 신청 전 준비사항
	// ==============================

	const checklist = root.querySelector("#completeChecklistList");
	const checklistEmpty = root.querySelector("#completeChecklistEmpty");

	checklist.replaceChildren();

	const checklistItems = guide?.checklist ?? [];

	checklistItems.forEach(item => {
		const li = document.createElement("li");

		li.className = "text-secondary mb-2";
		li.textContent = item;

		checklist.appendChild(li);
	});

	checklistEmpty.classList.toggle(
		"d-none",
		checklistItems.length > 0
	);

	if (checklistItems.length === 0) {
		checklistEmpty.textContent =
			"현재 등록된 준비사항이 없습니다. 공식 민원 안내를 확인해 주세요.";
	}

	// ==============================
	// 3. 실제 신청 시 알아둘 사항
	// ==============================

	const guideSection = root.querySelector("#completeGuideSection");
	const guideList = root.querySelector("#completeGuideList");

	guideList.replaceChildren();

	if (guide?.guide?.length) {

		guideSection.classList.remove("d-none");

		root.querySelector("#completeGuideDescription").textContent =
			guide.guideDescription ?? "";

		guide.guide.forEach(item => {

			const col = document.createElement("div");
			col.className = "col-12 col-md-6";

			const box = document.createElement("div");
			box.className = "h-100 rounded-3 p-3";
			box.style.backgroundColor = "#f4f7fa";

			const label = document.createElement("p");
			label.className = "text-secondary small mb-1";
			label.textContent = item.label;

			const value = document.createElement("p");
			value.className = "fw-semibold small mb-0";
			value.textContent = item.value;

			box.append(label, value);
			col.appendChild(box);
			guideList.appendChild(col);
		});

		root.querySelector("#completeGuideNote").textContent =
			guide.note ?? "";

	} else {
		guideSection.classList.add("d-none");
	}

	// ==============================
	// [진희] 4. 맞춤 정부 혜택 추천 (보조금24 API)
	// ==============================

	await loadPolicyRecommendations(root, scenarioCode);

	// ==============================
	// 5. 정부24 공식 안내 링크
	// ==============================

	const officialLink = root.querySelector("#completeOfficialLink");

	officialLink.href = guide?.officialUrl ?? "https://www.gov.kr/";

	// ==============================
	// 6. PDF 저장 / 인쇄
	// ==============================

	root.querySelector("#completePrintBtn")
		.addEventListener("click", () => {
			const printUrl =
				`/simulation/print?progressId=${encodeURIComponent(progressId)}`;

			window.open(printUrl, "_blank", "noopener");
		});
}

// ==============================
// [진희] 보조금24 맞춤 정책 추천 로드 및 렌더링
// ==============================

async function loadPolicyRecommendations(root, scenarioCode) {
	const grid = root.querySelector("#completePolicyCardGrid");
	if (!grid) return;

	// 시나리오별 안내 문구 맞춤 조정
	const descEl = root.querySelector("#completePolicyDescription");
	if (descEl) {
		const code = (scenarioCode || "").toUpperCase();
		if (code === "MOVE" || code === "1") {
			descEl.textContent = "방금 진행하신 전입신고와 밀접한 실생활 주거·이사 지원 정책들을 추천해 드려요.";
		} else if (code === "ID-CARD" || code === "2") {
			descEl.textContent = "방금 진행하신 주민등록증 재발급과 연관된 신분증 및 디지털 증명서 지원 정책들을 추천해 드려요.";
		} else {
			descEl.textContent = "방금 진행하신 연습과 관련된 맞춤 공공서비스 및 생활 지원 정책들을 추천해 드려요.";
		}
	}

	try {
		const targetScenario = (scenarioCode || "MOVE").toLowerCase();
		const response = await fetch(`/api/policies/recommend?scenario=${encodeURIComponent(targetScenario)}`, {
			headers: { "Accept": "application/json" }
		});

		if (!response.ok) {
			throw new Error(`정책 추천 API 응답 오류 (상태코드: ${response.status})`);
		}

		const policies = await response.json();

		if (!Array.isArray(policies) || policies.length === 0) {
			grid.innerHTML = `
				<div class="col-12 text-center py-4 text-secondary small">
					현재 추천 가능한 연관 정책 정보를 찾을 수 없습니다.
				</div>
			`;
			return;
		}

		grid.replaceChildren();

		policies.forEach(policy => {
			const col = document.createElement("div");
			col.className = "col-12 col-md-4";

			const dept = escapeHtml(policy.deptName || "정부부처");
			const type = escapeHtml(policy.supportType || "지원");
			const name = escapeHtml(policy.serviceName || "공공서비스 안내");
			const summary = escapeHtml(policy.serviceSummary || "상세 지원 내용은 정부24에서 확인하세요.");
			const period = escapeHtml(policy.applyPeriod || "상시 신청");
			const url = sanitizeUrl(policy.detailUrl);

			col.innerHTML = `
				<div class="card h-100 border rounded-3 p-3 d-flex flex-column justify-content-between shadow-sm bg-white policy-recommend-card" style="transition: transform 0.2s ease, box-shadow 0.2s ease;">
					<div>
						<div class="d-flex align-items-center justify-content-between gap-1 mb-2">
							<span class="badge bg-light text-secondary border px-2 py-1 text-truncate" style="max-width: 55%;" title="${dept}">${dept}</span>
							<span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 text-truncate" style="max-width: 45%;" title="${type}">${type}</span>
						</div>
						<h5 class="fw-bold fs-6 text-dark mb-2 text-truncate" title="${name}">
							${name}
						</h5>
						<p class="text-secondary small mb-3" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; min-height: 4.5em;" title="${summary}">
							${summary}
						</p>
					</div>
					<div class="pt-2 border-top d-flex align-items-center justify-content-between small text-secondary mt-auto">
						<span class="text-muted" style="font-size: .75rem;" title="${period}">${period}</span>
						<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-none fw-semibold d-inline-flex align-items-center gap-1">
							정부24 바로가기 <span class="material-symbols-outlined" style="font-size: .9rem;">open_in_new</span>
						</a>
					</div>
				</div>
			`;

			const card = col.querySelector(".policy-recommend-card");
			if (card) {
				card.addEventListener("mouseenter", () => {
					card.style.transform = "translateY(-3px)";
					card.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.08)";
				});
				card.addEventListener("mouseleave", () => {
					card.style.transform = "none";
					card.style.boxShadow = "";
				});
			}

			grid.appendChild(col);
		});

	} catch (error) {
		console.error("추천 정책 불러오기 실패:", error);
		grid.innerHTML = `
			<div class="col-12 text-center py-4 text-secondary small">
				정책 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.
			</div>
		`;
	}
}

function escapeHtml(str) {
	if (!str) return "";
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function sanitizeUrl(url) {
	if (!url || typeof url !== "string") return "https://www.gov.kr/";
	if (url.startsWith("http://") || url.startsWith("https://")) {
		return url;
	}
	return "https://www.gov.kr/";
}
