<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!doctype html>
<html lang="ko" data-bs-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>관리자 | 해봄</title>
<link
	href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
	rel="stylesheet">
<link
	href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
	rel="stylesheet">
<link
	href="https://cdn.jsdelivr.net/npm/admin-lte@4.10.0/dist/css/adminlte.min.css"
	rel="stylesheet">
<link href="${pageContext.request.contextPath}/css/common.css"
	rel="stylesheet">
<link href="${pageContext.request.contextPath}/css/pages/admin.css"
	rel="stylesheet">
</head>
<body class="layout-fixed sidebar-expand-lg bg-body-tertiary admin-page">
	<div class="app-wrapper">
		<!-- 상단 네비게이션 헤더 -->
		<nav class="app-header navbar navbar-expand bg-body">
			<div class="container-fluid">
				<a class="nav-link" data-lte-toggle="sidebar" href="#"
					aria-label="관리 메뉴 열기"><i class="bi bi-list"></i></a>
				<div class="admin-header-title-wrap">
					<h1 class="admin-header-page-title" data-admin-page-title
						aria-live="polite">이용 현황</h1>
					<span class="admin-demo-badge d-none" data-admin-demo-badge>데모 데이터</span>
				</div>
				<ul class="navbar-nav ms-auto align-items-center">
					<li class="nav-item dropdown">
						<button class="nav-link dropdown-toggle" type="button"
							data-bs-toggle="dropdown" aria-expanded="false"
							aria-label="글씨 크기 설정">
							<i class="bi bi-fonts me-1" aria-hidden="true"></i><span
								data-mode-label>보통</span>
						</button>
						<ul class="dropdown-menu dropdown-menu-end text-size-menu"
							aria-label="글씨 크기 선택">
							<li><button class="dropdown-item active" type="button"
									data-text-size="normal" aria-pressed="true">보통</button></li>
							<li><button class="dropdown-item" type="button"
									data-text-size="large" aria-pressed="false">크게</button></li>
							<li><button class="dropdown-item" type="button"
									data-text-size="largest" aria-pressed="false">가장 크게</button></li>
						</ul>
					</li>
					<li class="nav-item"><span class="nav-link">관리자 계정</span></li>
				</ul>
			</div>
		</nav>

		<!-- 좌측 사이드바 (LNB) -->
		<aside class="app-sidebar bg-primary-subtle" data-bs-theme="dark">
			<div class="sidebar-brand">
				<a href="${pageContext.request.contextPath}/admin"
					class="brand-link"><span class="brand-image"><i
						class="bi bi-building-fill-check"></i></span><span class="brand-text">해봄
						<b>관리</b>
				</span></a>
			</div>
			<div class="sidebar-wrapper">
				<nav class="mt-2">
					<ul class="nav sidebar-menu flex-column">
						<li class="nav-header">OVERVIEW</li>
						<li class="nav-item"><a href="#dashboard"
							class="nav-link active" data-admin-nav="dashboard"
							aria-current="page"><i class="nav-icon bi bi-grid-1x2"></i>
							<p>이용 현황</p></a></li>
						<li class="nav-header admin-nav-header-secondary">MANAGEMENT</li>
						<li class="nav-item"><a href="#members" class="nav-link"
							data-admin-nav="members"><i class="nav-icon bi bi-people"></i>
							<p>회원</p></a></li>
						<li class="nav-item"><a href="#scenarios" class="nav-link"
							data-admin-nav="scenarios"><i
								class="nav-icon bi bi-diagram-3"></i>
							<p>시나리오</p></a></li>
						<li class="nav-item"><a href="#inquiries-admin"
							class="nav-link" data-admin-nav="inquiries"><i
								class="nav-icon bi bi-chat-left-text"></i>
							<p>
									문의 게시판<span class="admin-nav-badge"
										id="adminSidebarInquiryBadge">0</span>
								</p></a></li>
						<li class="nav-item admin-home-item"><a
							href="${pageContext.request.contextPath}/" class="nav-link"><i
								class="nav-icon bi bi-house-door"></i>
							<p>서비스 홈</p></a></li>
					</ul>
				</nav>
			</div>
		</aside>

		<!-- 메인 컨텐츠 영역 -->
		<main class="app-main" id="dashboard">
			<div class="app-content pt-3 pb-4">
				<div class="container-fluid">
					<!-- 1. 이용 현황 (대시보드 페이지) -->
					<div data-admin-page="dashboard">
						<div class="row g-3 mb-4">
							<div class="col-6 col-xl-3">
								<article class="admin-kpi-card blue h-100">
									<div class="admin-kpi-top">
										<span>가입 회원</span><i class="bi bi-people"></i>
									</div>
									<strong id="adminDashboardTotalMembers">0</strong>
									<div class="admin-kpi-foot">
										<span class="positive">누적 가입</span><span>회원</span>
									</div>
									<svg viewBox="0 0 220 34" aria-hidden="true">
										<path data-kpi-sparkline="members" d="M0 26 L220 26" style="opacity: 0.35;" />
									</svg>
								</article>
							</div>
							<div class="col-6 col-xl-3">
								<article class="admin-kpi-card teal h-100">
									<div class="admin-kpi-top">
										<span>이번 달 연습 시작</span><i class="bi bi-play-circle"></i>
									</div>
									<strong id="adminDashboardMonthlyStarts">0</strong>
									<div class="admin-kpi-foot">
										<span class="positive">이번 달</span><span>시작 건수</span>
									</div>
									<svg viewBox="0 0 220 34" aria-hidden="true">
										<path data-kpi-sparkline="starts" d="M0 26 L220 26" style="opacity: 0.35;" />
									</svg>
								</article>
							</div>
							<div class="col-6 col-xl-3">
								<article class="admin-kpi-card slate h-100">
									<div class="admin-kpi-top">
										<span>연습 완료율</span><i class="bi bi-check2-circle"></i>
									</div>
									<strong id="adminDashboardCompletionRate">0.0<small>%</small></strong>
									<div class="admin-kpi-foot">
										<span class="positive">누적</span><span>완료율</span>
									</div>
									<svg viewBox="0 0 220 34" aria-hidden="true">
										<path data-kpi-sparkline="completion" d="M0 26 L220 26" style="opacity: 0.35;" />
									</svg>
								</article>
							</div>
							<div class="col-6 col-xl-3">
								<article class="admin-kpi-card amber h-100">
									<div class="admin-kpi-top">
										<span>답변 대기 문의</span><i class="bi bi-chat-left-text"></i>
									</div>
									<strong id="adminDashboardWaitingInquiryCount">0</strong>
									<div class="admin-kpi-foot">
										<div class="admin-kpi-foot-label">
											<span class="attention">확인 필요</span><span>미답변 문의</span>
										</div>
										<a href="#inquiries-admin" class="admin-kpi-action-link" data-admin-nav="inquiries">
											<span>답변하러 가기</span><i class="bi bi-arrow-right-short"></i>
										</a>
									</div>
								</article>
							</div>
						</div>

						<div class="row g-3 mb-4">
							<div class="col-xl-8">
								<section class="card admin-analytics-card h-100"
									aria-labelledby="dashboardTrendTitle">
									<div class="card-header flex-wrap">
										<div>
											<h2 class="card-title fw-semibold" id="dashboardTrendTitle">전체
												연습 추이</h2>
										</div>
										<div class="admin-trend-controls ms-auto">
											<label class="visually-hidden" for="dashboardScenarioFilter">시나리오
												선택</label><select class="form-select form-select-sm"
												id="dashboardScenarioFilter" data-dashboard-scenario-filter
												aria-label="전체 연습 추이 시나리오 선택"><option value="all">전체
													시나리오</option>
												<option value="move-in" data-current-scenario-option>전입신고</option></select><label
												class="visually-hidden" for="dashboardTrendPeriod">집계
												단위</label><select class="form-select form-select-sm"
												id="dashboardTrendPeriod" data-dashboard-trend-period
												aria-label="연습 추이 집계 단위"><option value="daily">일별</option>
												<option value="monthly" selected>월별</option>
												<option value="yearly">연도별</option></select>
										</div>
									</div>
									<div class="card-body">
										<div class="admin-line-legend">
											<span><i class="start"></i>연습 시작</span><span><i
												class="complete"></i>연습 완료</span>
										</div>
										<div class="admin-svg-chart">
											<svg viewBox="0 0 800 280" role="img"
												aria-label="최근 12개월간 연습 시작과 완료 건수 추이">
              <defs>
												<linearGradient id="practiceArea" x1="0" x2="0" y1="0"
													y2="1">
												<stop offset="0" stop-color="#247db4" stop-opacity=".18" />
												<stop offset="1" stop-color="#247db4" stop-opacity="0" /></linearGradient></defs>
              <g class="admin-chart-grid" data-trend-grid>
												<line x1="48" y1="26" x2="790" y2="26" />
												<line x1="48" y1="82" x2="790" y2="82" />
												<line x1="48" y1="138" x2="790" y2="138" />
												<line x1="48" y1="194" x2="790" y2="194" />
												<line x1="48" y1="238" x2="790" y2="238" /></g>
              <g class="admin-chart-labels" data-trend-y-labels></g>
              <path class="admin-chart-area" id="dashboardTrendArea" d="" />
              <path class="admin-chart-line start-line" id="dashboardTrendStart" d="" />
              <path class="admin-chart-line complete-line" id="dashboardTrendComplete" d="" />
              <g class="admin-chart-months" data-trend-x-labels></g>
            </svg>
										</div>
									</div>
								</section>
							</div>
							<div class="col-xl-4">
								<section class="card admin-demographics h-100"
									aria-labelledby="memberDemographicsTitle">
									<div class="card-header flex-wrap gap-2">
										<div>
											<h2 class="card-title fw-semibold"
												id="memberDemographicsTitle">회원 구성</h2>
											<p class="small text-secondary mb-0 mt-1">성별·연령대별 가입 회원</p>
										</div>
									</div>
									<div class="card-body">
										<section aria-labelledby="memberGenderTitle">
											<h3 class="admin-demographics-subtitle"
												id="memberGenderTitle">성별 구성</h3>
											<div class="admin-gender-summary">
												<div class="admin-gender-chart" id="adminGenderChart" role="img"
													aria-label="남성 0%, 여성 0%">
													<div>
														<strong id="adminGenderTotalMembers">0</strong><span>전체 회원</span>
													</div>
												</div>
												<ul class="admin-gender-legend list-unstyled mb-0">
													<li><span class="admin-legend-label"><i
															class="admin-legend-dot male"></i>남성</span><strong><span id="adminMaleCount">0</span>명
															<small id="adminMaleRate">0%</small>
													</strong></li>
													<li><span class="admin-legend-label"><i
															class="admin-legend-dot female"></i>여성</span><strong><span id="adminFemaleCount">0</span>명
															<small id="adminFemaleRate">0%</small>
													</strong></li>
												</ul>
											</div>
										</section>
										<section class="admin-age-section"
											aria-labelledby="memberAgeTitle">
											<div
												class="d-flex align-items-center justify-content-between gap-2 mb-2">
												<h3 class="admin-demographics-subtitle mb-0"
													id="memberAgeTitle">연령대 분포</h3>
												<span class="small text-secondary">명 · %</span>
											</div>
											<div class="admin-age-list" id="adminAgeList">
												<div class="admin-age-row">
													<span>10대</span>
													<div class="admin-age-track" role="img" aria-label="10대 0명, 0%">
														<i style="--age-share: 0%"></i>
													</div>
													<strong>0 <small>0%</small></strong>
												</div>
												<div class="admin-age-row">
													<span>20대</span>
													<div class="admin-age-track" role="img" aria-label="20대 0명, 0%">
														<i style="--age-share: 0%"></i>
													</div>
													<strong>0 <small>0%</small></strong>
												</div>
												<div class="admin-age-row">
													<span>30대</span>
													<div class="admin-age-track" role="img" aria-label="30대 0명, 0%">
														<i style="--age-share: 0%"></i>
													</div>
													<strong>0 <small>0%</small></strong>
												</div>
												<div class="admin-age-row">
													<span>40대</span>
													<div class="admin-age-track" role="img" aria-label="40대 0명, 0%">
														<i style="--age-share: 0%"></i>
													</div>
													<strong>0 <small>0%</small></strong>
												</div>
												<div class="admin-age-row">
													<span>50대</span>
													<div class="admin-age-track" role="img" aria-label="50대 0명, 0%">
														<i style="--age-share: 0%"></i>
													</div>
													<strong>0 <small>0%</small></strong>
												</div>
												<div class="admin-age-row">
													<span>60대 이상</span>
													<div class="admin-age-track" role="img" aria-label="60대 이상 0명, 0%">
														<i style="--age-share: 0%"></i>
													</div>
													<strong>0 <small>0%</small></strong>
												</div>
											</div>
										</section>
									</div>
								</section>
							</div>
						</div>

						<div class="row g-3 mb-4">
							<div class="col-xl-7">
								<section class="card h-100 admin-scenario-overview">
									<div class="card-header">
										<h2 class="card-title fw-semibold">시나리오 요약</h2>
									</div>
									<div class="card-body">
										<div class="admin-scenario-summary-grid">
											<article class="admin-scenario-summary-item">
												<span class="admin-scenario-summary-icon"><i
													class="bi bi-diagram-3"></i></span>
												<div>
													<span class="admin-scenario-summary-label">운영 중 시나리오
														수</span><strong data-active-scenario-count>1개</strong><small>등록
														시나리오 <span data-total-scenario-count>1</span>개 중
													</small>
												</div>
											</article>
											<article class="admin-scenario-summary-item top-scenario">
												<span class="admin-scenario-summary-icon"><i
													class="bi bi-trophy"></i></span>
												<div>
													<span class="admin-scenario-summary-label">이번 달 이용
														상위 시나리오</span><strong data-top-scenario-name>전입신고</strong><small><b data-top-scenario-starts>0회</b>
														연습 시작 · 완료 <span data-top-scenario-completes>0</span>회</small>
												</div>
											</article>
										</div>
									</div>
								</section>
							</div>
							<div class="col-xl-5">
								<section class="card h-100 admin-activity-card">
									<div class="card-header">
										<h2 class="card-title fw-semibold">최근 운영자 활동</h2>
									</div>
									<div class="admin-activity-list" data-admin-activity-list
										aria-live="polite"></div>
								</section>
							</div>
						</div>
					</div>

					<!-- 2. 회원 목록 페이지 -->
					<div data-admin-page="members" class="d-none">
						<section class="card mb-4" id="members">
							<div class="card-header flex-wrap gap-2 d-flex align-items-center justify-content-between">
								<h2 class="card-title fw-semibold mb-0">
									<i class="bi bi-people text-info me-2"></i>회원 목록
								</h2>
								<div class="d-flex align-items-center gap-2 ms-auto">
									<div class="input-group input-group-sm admin-search">
										<span class="input-group-text"><i class="bi bi-search"></i></span>
										<input class="form-control" placeholder="이름·아이디 검색"
											aria-label="회원 검색" data-member-search>
									</div>
									<button type="button" class="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold text-nowrap" id="btnExportMembersExcel" title="회원 목록을 엑셀 파일로 다운로드합니다">
										<i class="bi bi-file-earmark-excel me-1"></i>엑셀 다운로드
									</button>
								</div>
							</div>
							<div class="table-responsive">
								<table class="table table-hover align-middle mb-0">
									<thead>
										<tr>
											<th class="ps-3">회원</th>
											<th>아이디</th>
											<th>이메일</th>
											<th>가입일</th>
											<th>계정 상태</th>
											<th>상세</th>
										</tr>
									</thead>
									<tbody id="adminMemberTableBody">
										<tr>
											<td colspan="6" class="text-center py-5 text-secondary">
												<div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
												회원 목록을 불러오는 중입니다...
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>
					</div>

					<!-- 3. 문의 게시판 페이지 -->
					<div data-admin-page="inquiries" class="d-none">
						<section class="card" id="inquiries-admin">
							<div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
								<h2 class="card-title fw-semibold mb-0">
									<i class="bi bi-chat-left-text text-warning me-2"></i>문의 게시판 목록
								</h2>
								<button type="button" class="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold text-nowrap ms-auto" id="btnExportInquiriesExcel" title="문의 목록을 엑셀 파일로 다운로드합니다">
									<i class="bi bi-file-earmark-excel me-1"></i>엑셀 다운로드
								</button>
							</div>
							<div class="table-responsive">
								<table class="table table-hover align-middle mb-0">
									<thead>
										<tr>
											<th class="ps-3">문의 제목</th>
											<th>작성자</th>
											<th>분류</th>
											<th>등록일</th>
											<th>상태
												<button type="button" class="inquiry-status-sort"
													data-inquiry-status-sort aria-label="상태순 정렬"
													aria-pressed="false" title="상태순 정렬">
													<i class="bi bi-arrow-down-up" aria-hidden="true"></i>
												</button>
											</th>
											<th>담당자 ID</th>
											<th>상세</th>
										</tr>
									</thead>
									<tbody id="adminInquiryTableBody">
										<tr>
											<td colspan="7" class="text-center py-4 text-secondary">문의
												목록을 불러오는 중입니다...</td>
										</tr>
									</tbody>
								</table>
							</div>
						</section>
						<section class="card mt-4 admin-inquiry-overview"
							aria-labelledby="inquiryOverviewTitle">
							<div class="card-header">
								<h2 class="card-title fw-semibold" id="inquiryOverviewTitle">
									<i class="bi bi-bar-chart-line text-info me-2"></i>문의 처리 현황
								</h2>
							</div>
							<div class="card-body">
								<div class="admin-inquiry-summary">
									<article class="waiting">
										<span class="admin-inquiry-summary-icon"><i
											class="bi bi-hourglass-split" aria-hidden="true"></i></span>
										<div>
											<span>답변 대기</span><strong id="adminInquiryWaitingCount">0<small>건</small></strong>
										</div>
									</article>
									<article class="done">
										<span class="admin-inquiry-summary-icon"><i
											class="bi bi-check2-circle" aria-hidden="true"></i></span>
										<div>
											<span>답변 완료</span><strong id="adminInquiryDoneCount">0<small>건</small></strong>
										</div>
									</article>
									<article class="new">
										<span class="admin-inquiry-summary-icon"><i
											class="bi bi-chat-square-text" aria-hidden="true"></i></span>
										<div>
											<span>이번 달 접수</span><strong id="adminInquiryTotalCount">0<small>건</small></strong>
										</div>
									</article>
								</div>
								<section class="admin-category-section"
									aria-labelledby="inquiryCategoryTitle">
									<div class="admin-category-heading">
										<h3 id="inquiryCategoryTitle">문의 분류별 접수</h3>
										<span id="adminCategoryHeadingTotal">총 0건</span>
									</div>
									<div class="admin-category-distribution">
										<div class="admin-category-donut" id="adminCategoryDonut"
											role="img" aria-label="문의 분류 비율">
											<div>
												<strong id="adminCategoryDonutTotal">0</strong><span>총
													접수</span>
											</div>
										</div>
										<ul class="admin-category-legend" aria-label="문의 분류별 건수와 비율">
											<li><span class="admin-category-dot member"></span><span>회원·계정
													문의</span><strong id="adminCatCount1">0건</strong><small
												id="adminCatPercent1">0%</small></li>
											<li><span class="admin-category-dot simulation"></span><span>시뮬레이션
													문의</span><strong id="adminCatCount2">0건</strong><small
												id="adminCatPercent2">0%</small></li>
											<li><span class="admin-category-dot bug"></span><span>오류·버그
													신고</span><strong id="adminCatCount3">0건</strong><small
												id="adminCatPercent3">0%</small></li>
											<li><span class="admin-category-dot other"></span><span>기타
													문의</span><strong id="adminCatCount4">0건</strong><small
												id="adminCatPercent4">0%</small></li>
										</ul>
									</div>
								</section>
							</div>
						</section>
					</div>

					<!-- 4. 시나리오 목록 페이지 -->
					<div data-admin-page="scenarios" class="d-none">
						<section class="card mb-4" id="scenarios-admin">
							<div class="card-header flex-wrap gap-2">
								<h2 class="card-title fw-semibold">
									<i class="bi bi-diagram-3 text-info me-2"></i>시나리오 목록
								</h2>
								<div class="d-flex flex-wrap gap-2 ms-auto">
									<div class="input-group input-group-sm admin-search">
										<span class="input-group-text"><i class="bi bi-search"></i></span><input
											class="form-control" placeholder="시나리오명 검색"
											aria-label="시나리오 검색" data-scenario-search>
									</div>
								</div>
							</div>
							<div class="table-responsive">
								<table class="table table-hover align-middle mb-0">
									<thead>
										<tr>
											<th class="ps-3">시나리오</th>
											<th class="text-nowrap" style="width: 100px;">분류</th>
											<th class="text-nowrap" style="width: 130px;">예상 소요시간</th>
											<th class="text-nowrap" style="width: 110px;">운영 상태</th>
											<th class="text-end pe-3 text-nowrap" style="width: 120px;">관리</th>
										</tr>
									</thead>
									<tbody id="adminScenarioTableBody">
										<tr>
											<td colspan="5" class="py-5 text-center text-secondary">
												<div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
												시나리오 목록을 불러오는 중입니다...
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div class="admin-scenario-table-footer">
								<span id="adminScenarioTotalCount">0개 시나리오</span>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>

		<footer class="app-footer">
			<strong>해봄 관리자</strong>
		</footer>
	</div>

	<!-- 시나리오 상세 모달 -->
	<div class="modal fade" id="scenarioDetailModal" tabindex="-1"
		aria-labelledby="scenarioDetailTitle" aria-hidden="true">
		<div
			class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable admin-detail-dialog">
			<div class="modal-content admin-detail-modal">
				<div class="modal-header admin-detail-header">
					<div class="d-flex align-items-center gap-3">
						<span class="admin-detail-icon"><i
							class="bi bi-diagram-3-fill"></i></span>
						<div>
							<div class="admin-detail-eyebrow">
								시나리오 관리 <span>&gt;</span> 상세 정보
							</div>
							<h2 class="modal-title admin-detail-title"
								id="scenarioDetailTitle">전입신고</h2>
						</div>
					</div>
					<button type="button" class="btn-close" data-bs-dismiss="modal"
						aria-label="닫기"></button>
				</div>
				<div class="modal-body admin-detail-body">
					<section class="admin-detail-section mb-4"
						aria-labelledby="scenarioInfoHeading">
						<div class="admin-detail-section-heading">
							<span class="admin-detail-section-icon"><i
								class="bi bi-sliders"></i></span>
							<div>
								<h3 class="h6 fw-bold mb-1" id="scenarioInfoHeading">시나리오
									정보</h3>
								<p class="small text-secondary mb-0">목록에 표시할 이름과 운영 정보를
									관리합니다.</p>
							</div>
						</div>
						<form id="scenarioDetailForm"
							class="row g-3 mt-1 admin-detail-form">
							<input type="hidden" id="scenarioId" value="">
							<div class="col-md-4">
								<label class="form-label" for="scenarioName">시나리오명</label><input
									class="form-control" id="scenarioName" value="" required>
							</div>
							<div class="col-md-3">
								<label class="form-label" for="scenarioCategory">분류</label><select
									class="form-select" id="scenarioCategory"><option value="1">주거·이사</option>
									<option value="2">신분증·주민등록</option></select>
							</div>
							<div class="col-md-2">
								<label class="form-label" for="scenarioEstimatedMinutes">예상
									시간 (분)</label><input class="form-control" id="scenarioEstimatedMinutes"
									type="number" min="1" max="180" value="5" required>
							</div>
							<div class="col-md-3">
								<label class="form-label" for="scenarioStatus">운영 상태</label><select
									class="form-select" id="scenarioStatus"><option value="true">운영 중</option>
									<option value="false">점검 중</option></select>
							</div>
							<div class="col-12">
								<label class="form-label" for="scenarioDescription">시나리오 설명</label>
								<textarea class="form-control" id="scenarioDescription" rows="3"
									placeholder="시나리오 목록에 노출될 소개 및 안내 설명을 입력하세요."></textarea>
							</div>
						</form>
					</section>
					<section class="admin-detail-section admin-chart-section"
						aria-label="임시 저장 단계별 현황">
						<div class="table-responsive">
							<table class="table table-sm align-middle mb-0">
								<thead>
									<tr>
										<th>마지막 저장 단계</th>
										<th style="min-width: 180px">임시 저장 비율</th>
										<th class="text-end">저장 건수</th>
										<th class="text-end">전체 대비</th>
									</tr>
								</thead>
								<tbody id="scenarioStepStatsTableBody">
									<tr>
										<td colspan="4" class="text-center py-4 text-secondary">
											<div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
											단계별 통계를 불러오는 중입니다...
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						<p class="small text-secondary mt-3 mb-0">진행률은 마지막으로 임시 저장한 단계
							÷ 전체 단계로 계산합니다.</p>
					</section>
					<section
						class="admin-detail-section admin-scenario-detail-usage mt-4"
						aria-labelledby="scenarioUsageHeading">
						<div class="admin-detail-section-heading mb-3">
							<span class="admin-detail-section-icon"><i
								class="bi bi-bar-chart-line"></i></span>
							<div>
								<h3 class="h6 fw-bold mb-1" id="scenarioUsageHeading">누적 이용
									현황</h3>
								<p class="small text-secondary mb-0" id="scenarioUsageDescription">시나리오 운영 이후의 전체 이용
									흐름입니다.</p>
							</div>
						</div>
						<div class="admin-scenario-detail-kpis">
							<article>
								<span>전체 연습 시작</span><strong id="scenarioKpiStarts">0<small>회</small></strong>
							</article>
							<article>
								<span>전체 연습 완료</span><strong id="scenarioKpiCompleted">0<small>회</small></strong>
							</article>
							<article>
								<span>누적 완료율</span><strong id="scenarioKpiRate">0.0<small>%</small></strong>
							</article>
							<article>
								<span>이탈이 많은 단계</span><strong
									class="admin-scenario-detail-dropoff" id="scenarioKpiDropoff">—</strong><small
									class="admin-scenario-detail-dropoff-rate" id="scenarioKpiDropoffRate">이탈 비율 0.0%</small>
							</article>
						</div>
					</section>
				</div>
				<div class="modal-footer admin-detail-footer">
					<button type="submit" form="scenarioDetailForm"
						class="btn btn-primary px-4">
						<i class="bi bi-check2-circle me-1"></i>변경사항 저장
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- 회원 상세 모달 -->
	<div class="modal fade" id="memberDetailModal" tabindex="-1"
		aria-labelledby="memberDetailTitle" aria-hidden="true">
		<div
			class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable admin-detail-dialog">
			<div class="modal-content admin-detail-modal">
				<div class="modal-header admin-detail-header">
					<div class="d-flex align-items-center gap-3">
						<span class="admin-detail-icon"><i
							class="bi bi-person-vcard-fill"></i></span>
						<div>
							<div class="admin-detail-eyebrow">
								회원 관리 <span>&gt;</span> 계정 및 이용 정보
							</div>
							<h2 class="modal-title admin-detail-title" id="memberDetailTitle">회원
								정보</h2>
						</div>
					</div>
					<button type="button" class="btn-close" data-bs-dismiss="modal"
						aria-label="닫기"></button>
				</div>
				<div class="modal-body admin-detail-body">
					<div class="row g-3 mb-4 admin-member-meta">
						<div class="col-md-4">
							<div class="admin-member-meta-card">
								<span class="admin-member-meta-icon"><i
									class="bi bi-person-badge"></i></span>
								<div>
									<div class="admin-member-meta-label">아이디</div>
									<strong data-member-detail-id></strong>
								</div>
							</div>
						</div>
						<div class="col-md-4">
							<div class="admin-member-meta-card">
								<span class="admin-member-meta-icon"><i
									class="bi bi-envelope"></i></span>
								<div>
									<div class="admin-member-meta-label">이메일</div>
									<strong data-member-detail-email></strong>
								</div>
							</div>
						</div>
						<div class="col-md-4">
							<div class="admin-member-meta-card">
								<span class="admin-member-meta-icon"><i
									class="bi bi-calendar3"></i></span>
								<div>
									<div class="admin-member-meta-label">가입일</div>
									<strong data-member-detail-joined></strong>
								</div>
							</div>
						</div>
					</div>
					<section class="admin-detail-section mb-4"
						aria-labelledby="memberStatusHeading">
						<div class="admin-detail-section-heading">
							<span class="admin-detail-section-icon"><i
								class="bi bi-shield-check"></i></span>
							<div>
								<h3 class="h6 fw-bold mb-1" id="memberStatusHeading">계정 관리</h3>
								<p class="small text-secondary mb-0">회원의 서비스 이용 상태를 설정합니다.</p>
							</div>
						</div>
						<div class="row g-3 mt-1">
								<label class="form-label" for="memberAccountStatus">계정 상태</label>
								<select class="form-select" id="memberAccountStatus">
									<option value="ACTIVE">정상</option>
									<option value="SUSPENDED">이용 정지</option>
									<option value="WITHDRAWN">탈퇴</option>
								</select>
						</div>
					</section>
					<section class="admin-detail-section admin-member-drafts"
						aria-labelledby="memberDraftTitle">
						<div
							class="d-flex justify-content-between align-items-center gap-3 mb-3">
							<div class="admin-detail-section-heading">
								<span class="admin-detail-section-icon"><i
									class="bi bi-bookmark-check"></i></span>
								<div>
									<h3 class="h6 fw-bold mb-1" id="memberDraftTitle">연습 진행 및 이력</h3>
									<p class="small text-secondary mb-0">각 시나리오별 가장 최근에 진행한 연습 내역입니다.</p>
								</div>
							</div>
							<span class="admin-count-badge" data-member-draft-count></span>
						</div>
						<div class="table-responsive">
							<table class="table table-sm align-middle mb-0">
								<thead>
									<tr>
										<th>시나리오</th>
										<th>상태</th>
										<th>마지막 진행 단계</th>
										<th>진행률</th>
										<th>저장/완료 일시</th>
										<th>자동 삭제 예정</th>
									</tr>
								</thead>
								<tbody data-member-drafts></tbody>
							</table>
						</div>
					</section>
				</div>
				<div class="modal-footer admin-detail-footer">
					<button type="button" class="btn btn-primary px-4"
						data-save-member-status>
						<i class="bi bi-check2-circle me-1"></i>상태 변경 저장
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- 문의 상세 모달 -->
	<div class="modal fade" id="inquiryDetailModal" tabindex="-1"
		aria-labelledby="inquiryDetailTitle" aria-hidden="true">
		<div
			class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable inquiry-detail-dialog">
			<div class="modal-content inquiry-detail-modal">
				<div class="modal-header inquiry-detail-header">
					<div class="d-flex align-items-center gap-3">
						<span class="inquiry-detail-icon"><i
							class="bi bi-chat-square-text-fill"></i></span>
						<div>
							<div class="inquiry-detail-eyebrow">
								문의 관리 <span>&gt;</span> 상세 내용
							</div>
							<h2 class="modal-title inquiry-detail-title"
								id="inquiryDetailTitle">문의 제목</h2>
						</div>
					</div>
					<button type="button" class="btn-close" data-bs-dismiss="modal"
						aria-label="닫기"></button>
				</div>
				<div class="modal-body inquiry-detail-body">
					<div class="row g-3 mb-4 inquiry-meta-grid">
						<div class="col-sm-6">
							<div class="inquiry-meta-card">
								<span class="inquiry-meta-icon"><i class="bi bi-person"></i></span>
								<div>
									<div class="inquiry-meta-label">작성자</div>
									<strong data-inquiry-author></strong>
								</div>
							</div>
						</div>
						<div class="col-sm-6">
							<div class="inquiry-meta-card">
								<span class="inquiry-meta-icon"><i
									class="bi bi-calendar3"></i></span>
								<div>
									<div class="inquiry-meta-label">등록일</div>
									<strong data-inquiry-date></strong>
								</div>
							</div>
						</div>
					</div>
					<section class="inquiry-content-panel mb-4"
						aria-labelledby="inquiryContentLabel">
						<div class="inquiry-content-heading">
							<span id="inquiryContentLabel"><i
								class="bi bi-card-text me-2"></i>문의 내용</span>
							<div class="inquiry-category-inline">
								<label for="inquiryCategorySelect">문의 분류</label><select
									class="form-select form-select-sm" id="inquiryCategorySelect"><option>시뮬레이션
										문의</option>
									<option>회원·계정 문의</option>
									<option>오류·버그 신고</option>
									<option>기타 문의</option></select>
							</div>
						</div>
						<p class="mb-0" data-inquiry-content></p>
					</section>
					<section class="inquiry-reply-panel mb-4"
						aria-labelledby="inquiryReplyTitle">
						<div class="inquiry-processing-heading">
							<span class="inquiry-processing-icon"><i
								class="bi bi-reply-fill"></i></span>
							<div>
								<h3 class="h6 fw-bold mb-1" id="inquiryReplyTitle">답변 기록</h3>
								<p class="small text-secondary mb-0">하나의 문의에 답변을 여러 번 등록할 수
									있습니다.</p>
							</div>
						</div>
						<div class="inquiry-answer-list mt-3" data-inquiry-answers></div>
						<label class="form-label fw-semibold mt-3" for="inquiryReplyText">새
							답변</label>
						<textarea class="form-control inquiry-reply-input"
							id="inquiryReplyText" rows="4"
							placeholder="회원에게 전달할 답변을 입력해 주세요."></textarea>
						<div class="d-flex justify-content-end mt-3">
							<button type="button" class="btn btn-primary"
								data-save-inquiry-reply>
								<i class="bi bi-send me-1"></i>답변 등록
							</button>
						</div>
					</section>
					<section class="inquiry-processing-panel"
						aria-labelledby="inquiryProcessingTitle">
						<div class="inquiry-processing-heading">
							<span class="inquiry-processing-icon"><i
								class="bi bi-sliders"></i></span>
							<div>
								<h3 class="h6 fw-bold mb-1" id="inquiryProcessingTitle">답변
									처리</h3>
								<p class="small text-secondary mb-0">문의에 대한 답변 상태를 관리합니다.</p>
							</div>
						</div>
						<div class="row g-3 mt-1">
							<div class="col-sm-6">
								<label class="form-label" for="inquiryStatusSelect">답변
									상태</label><select class="form-select" id="inquiryStatusSelect"><option>답변
										대기</option>
									<option>답변 완료</option></select>
							</div>
						</div>
					</section>
				</div>
				<div class="modal-footer inquiry-detail-footer">
					<button type="button" class="btn btn-primary px-4"
						data-save-inquiry-status>
						<i class="bi bi-check2-circle me-1"></i>변경사항 저장
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="toast-container position-fixed bottom-0 end-0 p-3">
		<div id="siteToast" class="toast" role="status">
			<div class="toast-body">
				<span id="toastMessage"></span>
			</div>
		</div>
	</div>

	<!-- 스크립트 라이브러리 -->
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
	<script
		src="https://cdn.jsdelivr.net/npm/admin-lte@4.10.0/dist/js/adminlte.min.js"></script>
	<!-- SheetJS (Excel 내보내기 전용 라이브러리) -->
	<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
	<script src="${pageContext.request.contextPath}/js/app.js"></script>
	<script src="${pageContext.request.contextPath}/js/pages/admin.js?v=<%= System.currentTimeMillis() %>"></script>
	<script
		src="${pageContext.request.contextPath}/js/pages/demo-actions.js"></script>
</body>
</html>
