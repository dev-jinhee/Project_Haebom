<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
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
