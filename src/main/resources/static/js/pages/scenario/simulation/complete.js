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
	},

	IDENTITY_REISSUE: {
		title: "주민등록증 재발급 절차를 연습했어요!",
		description:
			"주민등록증 재발급 신청 절차를 체험했습니다. " +
			"실제 신청 전에 아래 내용을 확인해 보세요.",

		checklist: [
			"재발급 사유 및 IC칩 포함 여부 확인",
			"6개월 이내 촬영한 증명사진 준비",
			"증명사진 규격 확인 (3.5cm × 4.5cm)",
			"신청인 본인인증 수단 준비",
			"주민등록증 수령기관 확인",
			"기존 주민등록증 준비 (분실·파기 등 제외)",
			"수수료 및 면제 대상 여부 확인"
		],

		guideDescription:
			"실제 주민등록증 재발급 신청 시 알아두어야 할 기본 사항입니다.",

		guide: [
			{
				label: "신청 방법",
				value: "인터넷(정부24) 또는 방문"
			},
			{
				label: "신청 대상",
				value: "주민등록증 재발급 대상자"
			},
			{
				label: "증명사진",
				value: "6개월 이내 촬영한 3.5cm × 4.5cm 사진 1장"
			},
			{
				label: "수수료",
				value: "일반 5,000원 / IC칩 포함 10,000원"
			},
			{
				label: "처리 기간",
				value: "총 14일"
			},
			{
				label: "수령 방법",
				value: "지정한 수령기관 방문 및 본인 확인"
			}
		],

		note:
			"재발급 사유와 IC칩 포함 여부에 따라 수수료 및 준비 서류가 " +
			"달라질 수 있습니다. 온라인으로 신청하더라도 주민등록증 수령을 " +
			"위한 방문이 필요하며, 실제 발급 및 수령 일정은 신청기관에 " +
			"확인해 주세요. 정확한 사항은 정부24 공식 안내를 참고하세요.",

		officialUrl:
			"https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000018"
	},

	
RESIDENT_RECORD_ISSUE: {
    title: "주민등록표 등본(초본) 발급 절차를 연습했어요!",

    description:
        "주민등록표 등본(초본) 발급 신청 절차를 체험했습니다. " +
        "실제 발급 전에 아래 내용을 확인해 보세요.",

    checklist: [
        "발급할 서류 확인 (주민등록표 등본 또는 초본)",
        "주민등록상 주소 및 신청 정보 확인",
        "전체 발급 또는 선택 발급 여부 확인",
        "주민등록번호 뒷자리 등 표시할 개인정보 항목 확인",
        "증명서 제출처에서 요구하는 표시 항목 확인",
        "수령 방법 및 본인인증 수단 확인"
    ],

    guideDescription:
        "실제 주민등록표 등본(초본) 발급 시 알아두어야 할 기본 사항입니다.",

    guide: [
        {
            label: "신청 방법",
            value: "인터넷, 방문, 무인발급기"
        },
        {
            label: "신청 자격",
            value: "본인 또는 대리인 (온라인 대리 신청 불가)"
        },
        {
            label: "발급 서류",
            value: "주민등록표 등본 또는 초본"
        },
        {
            label: "수수료",
            value: "인터넷 무료 / 일반 발급 1통 400원"
        },
        {
            label: "처리 기간",
            value: "즉시 (근무시간 내 3시간)"
        },
        {
            label: "방문 신청",
            value: "신분증 등 구비서류 확인 필요"
        }
    ],

    note:
        "주민등록표 등본은 세대별 주민등록 사항을, " +
        "초본은 개인의 상세한 주민등록 사항을 확인하는 서류입니다. " +
        "발급 목적과 제출처에 따라 필요한 표시 항목이 달라질 수 있습니다. " +
        "해봄에서의 신청은 실제 증명서 발급으로 이어지지 않으며, " +
        "정확한 신청 자격과 구비서류는 정부24 공식 안내를 확인해 주세요.",

    officialUrl:
        "https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000015&HighCtgCD=A01010001&tp_seq=01&Mcode=10200"
}


};

// ==============================
// 공통 완료 화면 초기화
// ==============================

export async function init({
	root,
	progressId,
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
	// [진희] 4. 맞춤 정부 혜택 추천 (보조금24 API - 지역 맞춤 연동)
	// ==============================

	await loadPolicyRecommendations(root, scenarioCode, progressId);

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
// [진희] 보조금24 맞춤 정책 추천 로드 및 렌더링 (지역 맞춤 + 랜덤 셔플)
// ==============================

async function loadPolicyRecommendations(root, scenarioCode, progressId) {
	const grid = root.querySelector("#completePolicyCardGrid");
	if (!grid) return;

	const descEl = root.querySelector("#completePolicyDescription");

	try {
		const targetScenario = (scenarioCode || "MOVE").toLowerCase();
		let requestUrl = `/api/policies/recommend?scenario=${encodeURIComponent(targetScenario)}&_t=${Date.now()}`;
		if (progressId) {
			requestUrl += `&progressId=${encodeURIComponent(progressId)}`;
		}

		const response = await fetch(requestUrl, {
			headers: { "Accept": "application/json" }
		});

		if (!response.ok) {
			throw new Error(`정책 추천 API 응답 오류 (상태코드: ${response.status})`);
		}

		const contentType = response.headers.get("content-type");
		if (contentType && !contentType.includes("application/json")) {
			throw new Error("서버 응답이 JSON 형식이 아닙니다. (서버 재시작이 필요할 수 있습니다)");
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

		// 시나리오 및 추천된 지자체 지역에 맞춘 안내 문구 반영
		if (descEl) {
			const code = (scenarioCode || "").toUpperCase();
			if (code.includes("IDENTITY") || code.includes("ID-CARD") || code.includes("ID_CARD") || code === "2") {
				descEl.textContent = "방금 진행하신 주민등록증 재발급과 연관된 신분증 및 디지털 증명서 지원 정책들을 추천해 드려요.";
			} else {
				// 지자체(시·군·구 / 시·도) 맞춤 정책이 포함되어 있는지 확인
				const localPolicy = policies.find(p => p.deptName && (p.deptName.includes("시") || p.deptName.includes("구") || p.deptName.includes("군")));
				if (localPolicy && localPolicy.deptName && !localPolicy.deptName.includes("행정안전부") && !localPolicy.deptName.includes("국토교통부") && !localPolicy.deptName.includes("농림축산식품부")) {
					descEl.innerHTML = `방금 전입신고하신 <strong>${escapeHtml(localPolicy.deptName)}</strong> 지역 및 실생활 주거·이사 지원 정책들을 추천해 드려요.`;
				} else {
					descEl.textContent = "방금 진행하신 전입신고와 밀접한 실생활 주거·이사 지원 정책들을 추천해 드려요.";
				}
			}
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
