<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
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
							<!-- 회원 목록 페이징 영역 -->
							<div class="card-footer bg-white d-flex justify-content-between align-items-center py-3">
								<div class="small text-secondary">
									전체 <strong class="text-dark" id="adminMemberTotalCount">0</strong>명 중 
									<span id="adminMemberPageRange">0 - 0</span>
								</div>
								<nav aria-label="회원 목록 페이징">
									<ul class="pagination pagination-sm mb-0 justify-content-center" id="adminMemberPagination">
										<!-- JS에서 버튼이 동적으로 생성됩니다 -->
									</ul>
								</nav>
							</div>
						</section>
					</div>
