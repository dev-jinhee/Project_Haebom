<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
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
