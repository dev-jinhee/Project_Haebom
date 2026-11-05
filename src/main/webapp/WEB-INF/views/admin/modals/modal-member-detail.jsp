<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
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
									<p class="small text-secondary mb-0">회원이 진행한 모든 시나리오별 연습 이력입니다.</p>
								</div>
							</div>
							<span class="admin-count-badge" data-member-draft-count></span>
						</div>

						<!-- 탭 필터(전체/진행중/완료) & 시나리오 드롭다운 바 -->
						<div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
							<div class="btn-group btn-group-sm" role="group" id="memberDraftStatusTabs">
								<button type="button" class="btn btn-primary active" data-draft-status="ALL">
									전체 <span class="badge bg-white text-primary ms-1" id="badgeDraftTotal">0</span>
								</button>
								<button type="button" class="btn btn-outline-primary" data-draft-status="IN_PROGRESS">
									진행중 <span class="badge bg-warning text-dark ms-1" id="badgeDraftWaiting">0</span>
								</button>
								<button type="button" class="btn btn-outline-primary" data-draft-status="COMPLETED">
									완료 <span class="badge bg-success ms-1" id="badgeDraftCompleted">0</span>
								</button>
							</div>

							<!-- 시나리오 드롭다운 (전입신고, 주민등록증 재발급 기본 장착!) -->
							<div style="width: 170px;">
								<select class="form-select form-select-sm" id="memberDraftScenarioFilter">
									<option value="ALL">전체 시나리오</option>
									<option value="1">전입신고</option>
									<option value="2">주민등록증 재발급</option>
								</select>
							</div>
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
						<!-- 연습 이력 5개 단위 페이징 영역 -->
						<div class="d-flex justify-content-between align-items-center pt-3 mt-2 border-top">
							<div class="small text-secondary">
								전체 <strong class="text-dark" id="memberDraftTotalListCount">0</strong>건 중 
								<span id="memberDraftPageRange">0 - 0</span>
							</div>
							<nav aria-label="연습 이력 페이징">
								<ul class="pagination pagination-sm mb-0" id="memberDraftPagination">
									<!-- JS에서 5개 단위 페이징 버튼이 동적으로 생성됩니다 -->
								</ul>
							</nav>
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
