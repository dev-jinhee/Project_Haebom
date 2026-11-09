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