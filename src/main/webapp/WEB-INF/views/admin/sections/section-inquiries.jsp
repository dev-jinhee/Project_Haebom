<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
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
							<!-- 문의 목록 페이징 영역 -->
							<div class="card-footer bg-white d-flex justify-content-between align-items-center py-3">
								<div class="small text-secondary">
									전체 <strong class="text-dark" id="adminInquiryTotalListCount">0</strong>건 중 
									<span id="adminInquiryPageRange">0 - 0</span>
								</div>
								<nav aria-label="문의 목록 페이징">
									<ul class="hb-pagination" id="adminInquiryPagination">
										<!-- JS에서 버튼이 동적으로 생성됩니다 -->
									</ul>
								</nav>
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
