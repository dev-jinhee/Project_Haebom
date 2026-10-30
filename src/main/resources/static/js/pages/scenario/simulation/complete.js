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
	// 4. 정부24 공식 안내 링크
	// ==============================

	const officialLink = root.querySelector("#completeOfficialLink");

	officialLink.href = guide?.officialUrl ?? "https://www.gov.kr/";

	// ==============================
	// 5. PDF 저장 / 인쇄
	// ==============================

	root.querySelector("#completePrintBtn")
		.addEventListener("click", () => {
			const printUrl =
				`/simulation/print?progressId=${encodeURIComponent(progressId)}`;

			window.open(printUrl, "_blank", "noopener");
		});
}