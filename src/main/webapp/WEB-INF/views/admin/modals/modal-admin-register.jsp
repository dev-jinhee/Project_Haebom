<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
	<!-- 새 관리자 등록 모달 -->
	<div class="modal fade" id="adminRegisterModal" tabindex="-1" aria-labelledby="adminRegisterModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content shadow-lg border-0 rounded-4">
				<div class="modal-header border-bottom py-3 px-4 bg-light rounded-top-4">
					<div class="d-flex align-items-center gap-2">
						<span class="badge bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center">
							<i class="bi bi-person-plus-fill fs-6 text-white"></i>
						</span>
						<h2 class="modal-title fs-5 fw-bold text-dark mb-0" id="adminRegisterModalLabel">새 관리자 등록</h2>
					</div>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
				</div>
				<form id="adminRegisterForm">
					<div class="modal-body p-4">
						<div class="mb-3">
							<label for="newAdminLoginId" class="form-label fw-semibold text-secondary small">로그인 아이디 <span class="text-danger">*</span></label>
							<div class="input-group">
								<span class="input-group-text bg-white"><i class="bi bi-person text-secondary"></i></span>
								<input type="text" class="form-control" id="newAdminLoginId" name="loginId" placeholder="예: admin_sec" maxlength="16" required>
							</div>
							<div class="form-text small">영문/숫자 조합으로 입력해 주세요.</div>
						</div>
						<div class="mb-3">
							<label for="newAdminPassword" class="form-label fw-semibold text-secondary small">초기 비밀번호 <span class="text-danger">*</span></label>
							<div class="input-group">
								<span class="input-group-text bg-white"><i class="bi bi-lock text-secondary"></i></span>
								<input type="password" class="form-control" id="newAdminPassword" name="password" placeholder="비밀번호 입력" required>
							</div>
						</div>
						<div class="mb-3">
							<label for="newAdminMemberName" class="form-label fw-semibold text-secondary small">관리자 이름 (담당업무) <span class="text-danger">*</span></label>
							<div class="input-group">
								<span class="input-group-text bg-white"><i class="bi bi-badge-ad text-secondary"></i></span>
								<input type="text" class="form-control" id="newAdminMemberName" name="memberName" placeholder="예: 김보안 (보안운영팀)" maxlength="20" required>
							</div>
						</div>
						<div class="mb-2">
							<label for="newAdminEmail" class="form-label fw-semibold text-secondary small">관리자 이메일 <span class="text-danger">*</span></label>
							<div class="input-group">
								<span class="input-group-text bg-white"><i class="bi bi-envelope text-secondary"></i></span>
								<input type="email" class="form-control" id="newAdminEmail" name="email" placeholder="예: admin_sec@haebom.co.kr" maxlength="50" required>
							</div>
						</div>
					</div>
					<div class="modal-footer border-top bg-light py-3 px-4 rounded-bottom-4">
						<button type="button" class="btn btn-secondary px-3" data-bs-dismiss="modal">취소</button>
						<button type="submit" class="btn btn-primary px-4 fw-semibold" id="btnSubmitAdminRegister">
							<i class="bi bi-check-lg me-1"></i>관리자 등록
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
