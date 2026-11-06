<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
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
