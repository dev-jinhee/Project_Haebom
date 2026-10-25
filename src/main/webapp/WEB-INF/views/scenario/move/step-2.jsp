<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<!-- ============================== -->
<!-- 전입신고 2단계 - 기본 정보 -->
<!-- ============================== -->
<section class="move-basic-step">

	<!-- ============================== -->
	<!-- 신청인 정보 -->
	<!-- ============================== -->
	<div class="border rounded-3 p-4 mb-3">

		<h3 class="h6 fw-bold mb-4">신청인 정보</h3>

		<!-- 신청인 성명 -->
		<div class="mb-4">
			<label for="applicantName" class="form-label fw-semibold">
				신청인 성명 </label> <input type="text" class="form-control bg-light"
				id="applicantName" name="applicantName" readonly style="max-width: 480px;">
		</div>

		<!-- 휴대전화번호 -->
		<div>
			<label class="form-label fw-semibold"> 휴대전화번호 <span
				class="text-primary small">(필수)</span>
			</label>

			<div class="d-flex align-items-center gap-2 gap-md-3">

				<input type="text" class="form-control text-center" id="phoneFirst"
					name="phoneFirst" value="010" maxlength="3" inputmode="numeric"
					aria-label="휴대전화번호 앞자리" style="max-width: 130px;"> <span
					class="text-muted">-</span> <input type="text"
					class="form-control text-center" id="phoneMiddle"
					name="phoneMiddle" placeholder="0000" maxlength="4"
					inputmode="numeric" aria-label="휴대전화번호 가운데 자리"
					style="max-width: 130px;"> <span class="text-muted">-</span>
				<input type="text" class="form-control text-center" id="phoneLast"
					name="phoneLast" placeholder="0000" maxlength="4"
					inputmode="numeric" aria-label="휴대전화번호 마지막 자리"
					style="max-width: 130px;">

			</div>

			<p class="text-muted small mt-2 mb-0">연습용 번호입니다. 입력한 내용은 실제 신청에
				전달되지 않습니다.</p>
		</div>

	</div>


	<!-- ============================== -->
	<!-- 전입사유 -->
	<!-- ============================== -->
	<div class="border rounded-3 p-4 mb-3">

		<h3 class="h6 fw-bold mb-4">전입사유</h3>

		<fieldset class="border-0 p-0 m-0">

			<legend class="fs-6 fw-semibold mb-3">
				구분 <span class="text-primary small">(필수)</span>
			</legend>

			<div class="row g-3">

				<!-- 직업 -->
				<div class="col-md-6">
					<div class="form-check">
						<input class="form-check-input" type="radio" id="reasonJob"
							name="moveReason" value="JOB"> <label
							class="form-check-label" for="reasonJob"> 직업 : 취업, 사업,
							직장이전 등 </label>
					</div>
				</div>

				<!-- 가족 -->
				<div class="col-md-6">
					<div class="form-check">
						<input class="form-check-input" type="radio" id="reasonFamily"
							name="moveReason" value="FAMILY"> <label
							class="form-check-label" for="reasonFamily"> 가족 : 가족과 함께
							거주, 결혼, 분가 등 </label>
					</div>
				</div>

				<!-- 주택 -->
				<div class="col-md-6">
					<div class="form-check">
						<input class="form-check-input" type="radio" id="reasonHousing"
							name="moveReason" value="HOUSING"> <label
							class="form-check-label" for="reasonHousing"> 주택 : 주택 구입,
							계약 만료, 전세, 재개발 등 </label>
					</div>
				</div>

				<!-- 교육 -->
				<div class="col-md-6">
					<div class="form-check">
						<input class="form-check-input" type="radio" id="reasonEducation"
							name="moveReason" value="EDUCATION"> <label
							class="form-check-label" for="reasonEducation"> 교육 : 진학,
							학업, 자녀교육 등 </label>
					</div>
				</div>

				<!-- 주거환경 -->
				<div class="col-md-6">
					<div class="form-check">
						<input class="form-check-input" type="radio" id="reasonLiving"
							name="moveReason" value="LIVING_ENV"> <label
							class="form-check-label" for="reasonLiving"> 주거환경 : 교통,
							문화·편의시설 등 </label>
					</div>
				</div>

				<!-- 자연환경 -->
				<div class="col-md-6">
					<div class="form-check">
						<input class="form-check-input" type="radio" id="reasonNature"
							name="moveReason" value="NATURE"> <label
							class="form-check-label" for="reasonNature"> 자연환경 : 건강,
							공해, 전원생활 등 </label>
					</div>
				</div>

				<!-- 기타 -->
				<div class="col-12">
					<div class="form-check">
						<input class="form-check-input" type="radio" id="reasonOther"
							name="moveReason" value="OTHER"> <label
							class="form-check-label" for="reasonOther"> 기타 </label>
					</div>

					<!-- 기타 선택 시 입력 활성화 -->
					<input type="text" class="form-control mt-3" id="moveReasonDetail"
						name="moveReasonDetail" placeholder="기타 전입사유를 입력하세요."
						maxlength="200" disabled style="max-width: 480px;">
				</div>

			</div>

		</fieldset>

	</div>


	<!-- ============================== -->
	<!-- 시뮬레이션 공통 안내 -->
	<!-- ============================== -->
	<div class="alert alert-info mb-3" role="note">
		<p class="small mb-0">
			<spring:message code="simulation.notice" />
		</p>
	</div>

	<!-- ============================== -->
	<!-- 입력 정보 및 진행 기록 안내 -->
	<!-- ============================== -->
	<div class="border rounded-3 bg-light p-3">

		<h4 class="fw-semibold small mb-2">입력 정보 및 진행 기록 안내</h4>

		<p class="text-muted small mb-0">
			<spring:message code="simulation.history" />
		</p>

		<p class="text-muted small mb-0">
			<spring:message code="simulation.privacy" />
		</p>

	</div>

</section>
