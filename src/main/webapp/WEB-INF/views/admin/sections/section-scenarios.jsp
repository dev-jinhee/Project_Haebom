<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
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
