<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<%--
    해봄 | 공통 시뮬레이션 완료 화면

    위치: /WEB-INF/views/simulation/common/complete.jsp

    - simulation.jsp의 #stepContent에 삽입
    - 시나리오별 정보는 공통 JS에서 설정
    - 상단 진행률 및 단계 제목은 중복 생성하지 않음
    - 관련 정책 추천 기능 (보조금24 API 연동)
--%>

<div id="simulationComplete" class="sim-step-content sim-complete"
	data-view="complete">

	<%-- 1. 완료 메시지 --%>
	<section class="completion-panel text-center pt-3 pb-4"
		aria-labelledby="completeTitle">

		<div class="complete-mark" aria-hidden="true">
			<span class="material-symbols-outlined"> check </span>
		</div>

		<p id="completeStatusLabel"
			class="text-primary fw-semibold small mb-2">체험 완료</p>

		<h3 id="completeTitle" class="fw-bold mb-2">행정절차 연습을 완료했어요!</h3>

		<p id="completeDescription" class="text-secondary small mx-auto mb-0"
			style="max-width: 680px; line-height: 1.8;">모든 연습 단계를 마쳤습니다. 실제
			신청 전 필요한 사항을 확인해 보세요.</p>

		<p
			class="text-secondary mt-2 mb-0 d-inline-flex align-items-center gap-1"
			style="font-size: .78rem;">
			<span class="material-symbols-outlined"> info </span> 이 체험은 실제 민원
			신청으로 접수되지 않습니다.
		</p>
	</section>

	<%-- 2. 신청 전 준비사항 --%>
	<section id="completeChecklistSection" class="checklist-box mt-3"
		aria-labelledby="completeChecklistHeading">

		<h4 id="completeChecklistHeading"
			class="fw-bold mb-3 fs-6 d-inline-flex align-items-center gap-1">
			<span class="material-symbols-outlined"> inventory </span> <span
				class="m-0">실제 신청 전 준비사항</span>
		</h4>

		<ul id="completeChecklistList" class="mb-0 mt-0 ps-3">
		</ul>

		<p id="completeChecklistEmpty" class="text-secondary small mb-0">
			준비사항을 불러오는 중입니다.</p>

	</section>

	<%-- 3. 실제 민원 핵심 안내 --%>
	<section id="completeGuideSection"
		class="border rounded-4 p-3 p-md-4 mt-3 d-none"
		aria-labelledby="completeGuideHeading">

		<h4 id="completeGuideHeading"
			class="fw-bold fs-6 mb-2 d-inline-flex align-items-center gap-1">
			<span class="material-symbols-outlined"> info </span> 실제 신청 시 알아둘 사항
		</h4>

		<p id="completeGuideDescription" class="text-secondary small mb-3">
		</p>

		<div id="completeGuideList" class="row g-2"></div>

		<p id="completeGuideNote" class="text-secondary small mt-3 mb-0">
		</p>

	</section>

	<%-- [진희] 4. 맞춤 공공서비스 혜택 추천 (보조금24 API 연동) 시작 --%>
	<section id="completePolicySection" class="border rounded-4 p-3 p-md-4 mt-3 bg-white position-relative overflow-hidden shadow-sm"
		style="border-color: #dbeafe !important;"
		aria-labelledby="completePolicyHeading">

		<%-- 상단 블루 그라데이션 포인트 라인 --%>
		<div style="position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #3b82f6, #6366f1, #38bdf8);"></div>

		<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
			<div>
				<div class="d-flex align-items-center gap-2 mb-1">
					<span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill small">
						<span class="material-symbols-outlined align-middle" style="font-size: 1rem;">lightbulb</span> 맞춤 혜택
					</span>
					<span class="text-secondary small">행정안전부 공공서비스(보조금24) 연동</span>
				</div>
				<h4 id="completePolicyHeading" class="fw-bold fs-6 mb-1">
					놓치기 아쉬운 연계 정부 혜택 및 지원금
				</h4>
				<p id="completePolicyDescription" class="text-secondary small mb-0">
					방금 진행하신 연습과 밀접한 실생활 복지·주거 정책들을 추천해 드려요.
				</p>
			</div>
			<%-- [진희] 다른 정책 보기 (새로고침) 버튼 --%>
			<div>
				<button id="completePolicyRefreshBtn" type="button"
					class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1 shadow-sm bg-white"
					style="font-size: .8rem; font-weight: 500;"
					onclick="window.haebomRefreshPolicies &amp;&amp; window.haebomRefreshPolicies(this)"
					title="다른 추천 정책을 확인합니다">
					<span class="material-symbols-outlined policy-refresh-icon" style="font-size: 1rem;">refresh</span>
					<span>다른 정책 보기</span>
				</button>
			</div>
		</div>

		<%-- 정책 추천 카드 목록 (JS 동적 렌더링) --%>
		<div id="completePolicyCardGrid" class="row g-3 my-2">
			<div class="col-12 text-center py-4 text-secondary small">
				<div class="spinner-border spinner-border-sm text-primary me-2" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
				연관 맞춤 정책을 불러오는 중입니다...
			</div>
		</div>

		<div class="rounded-3 p-2 px-3 mt-3 d-flex flex-wrap align-items-center justify-content-between small text-secondary"
			style="background-color: #f8fafc; border: 1px solid #edf2f7; font-size: .8rem;">
			<span class="d-inline-flex align-items-center gap-1">
				<span class="material-symbols-outlined text-primary" style="font-size: 1rem;">verified</span>
				실제 혜택 자격 확인 및 신청은 정부24 공식 누리집에서 안전하게 진행됩니다.
			</span>
			<a href="https://www.gov.kr" target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-none fw-semibold">
				정부24 바로가기 <span class="material-symbols-outlined align-middle" style="font-size: .9rem;">open_in_new</span>
			</a>
		</div>

	</section>
	<%-- [진희] 맞춤 공공서비스 혜택 추천 끝 --%>
	
	<%-- 5. 정부24 공식 안내 --%>
	<section id="completeOfficialSection" class="mt-4"
		aria-labelledby="completeOfficialHeading">

		<h4 id="completeOfficialHeading" class="fw-bold fs-6 mb-2">
			정부24에서 실제 신청하기</h4>

		<p class="text-secondary small mb-3">실제 민원 신청은 정부24 또는 관할 행정기관을 통해
			진행해야 합니다.</p>

		<a id="completeOfficialLink"
			class="btn btn-outline-primary rounded-pill px-4"
			href="https://www.gov.kr/" target="_blank" rel="noopener noreferrer">

			<span class="complete-link-text">정부24 공식 안내 확인</span> <span
			class="material-symbols-outlined"> open_in_new </span>
		</a>

	</section>

	<%-- 6. 개인정보 및 체험 안내 --%>
	<section class="border rounded-4 p-3 p-md-4 mt-3"
		style="background-color: #f5f9f8;"
		aria-labelledby="completePrivacyHeading">

		<h4 id="completePrivacyHeading"
			class="fw-bold small mb-2 d-flex align-items-center gap-1">
			<span class="material-symbols-outlined"> verified_user </span><span>입력
				정보 및 보안 안내</span>
		</h4>

		<p class="text-secondary small mb-0" style="line-height: 1.8;">
			해봄은 행정절차를 연습하기 위한 모의 체험 서비스입니다. 입력한 정보는 실제 행정기관으로 전송되지 않으며, 진행 중인 기록은
			마지막 저장일로부터 30일이 지나면 관련 입력정보가 자동 삭제됩니다.</p>

	</section>

	<%-- 7. 완료 후 동작 --%>
	<div
		class="d-flex flex-wrap align-items-center
                justify-content-between gap-3
                border-top mt-4 pt-3 sim-complete-actions">

		<div>
			<button id="completePrintBtn" type="button"
				class="btn btn-link text-secondary
                           text-decoration-none p-0 small d-inline-flex align-items-center gap-1">
				<span class="material-symbols-outlined"> print </span> <span
					class="sim-print-text">전체 화면 인쇄 / PDF 저장</span>
			</button>

			<p class="text-secondary mb-0 mt-1" style="font-size: .72rem;">
				인쇄 창에서 'PDF로 저장'을 선택할 수 있습니다.</p>
		</div>

	</div>

</div>
