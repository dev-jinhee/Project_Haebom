<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
					<!-- 관리자 목록 페이지 -->
					<div data-admin-page="admins" class="d-none">
						<section class="card mb-4" id="admins">
							<div class="card-header flex-wrap gap-2 d-flex align-items-center justify-content-between">
								<h2 class="card-title fw-semibold mb-0">
									<i class="bi bi-shield-lock text-primary me-2"></i>관리자 목록
								</h2>
								<div class="d-flex flex-wrap align-items-center gap-2 ms-auto">
									<div class="input-group input-group-sm admin-search">
										<span class="input-group-text"><i class="bi bi-search"></i></span>
										<input class="form-control" placeholder="관리자명·아이디 검색"
											aria-label="관리자 검색" data-admin-account-search>
									</div>
									<button type="button" class="btn btn-primary btn-sm rounded-pill px-3 fw-semibold text-nowrap" id="btnOpenAdminRegisterModal" data-bs-toggle="modal" data-bs-target="#adminRegisterModal">
										<i class="bi bi-person-plus-fill me-1"></i>새 관리자 등록
									</button>
								</div>
							</div>
							<div class="table-responsive">
								<table class="table table-hover align-middle mb-0">
									<thead>
										<tr>
											<th class="ps-3">관리자</th>
											<th>아이디</th>
											<th>이메일</th>
											<th>등록일시</th>
											<th>권한</th>
											<th>계정 상태</th>
										</tr>
									</thead>
									<tbody id="adminAccountTableBody">
										<tr>
											<td colspan="6" class="text-center py-5 text-secondary">
												<div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
												관리자 목록을 불러오는 중입니다...
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<!-- 관리자 목록 페이징 영역 -->
							<div class="card-footer bg-white d-flex justify-content-between align-items-center py-3">
								<div class="small text-secondary">
									전체 <strong class="text-dark" id="adminAccountTotalCount">0</strong>명 중 
									<span id="adminAccountPageRange">0 - 0</span>
								</div>
								<nav aria-label="관리자 목록 페이징">
									<ul class="hb-pagination" id="adminAccountPagination">
										<!-- JS에서 버튼이 동적으로 생성됩니다 -->
									</ul>
								</nav>
							</div>
						</section>
					</div>
