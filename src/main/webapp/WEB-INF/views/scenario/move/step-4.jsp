<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<!-- 해봄 / 전입신고 4단계 fragment. 단계 이동 버튼·진행률은 simulation.jsp에서 처리 -->

<div class="sim-step-content move-step4" data-step="4">

	<section
		class="gov24-form-panel gov24-address-panel move-step4-main-panel">

		<h3>현재 거주지 정보</h3>

		<p class="text-muted small mb-4">이사한 후 거주할 주소와 세대 구성 방법을 확인해 주세요.</p>

		<div class="gov24-form-field mb-4">

			<label class="form-label fw-semibold" for="newRoadAddress">

				주소 확인 <span class="text-primary small fw-normal">(필수)</span>

			</label>

			<div class="gov24-address-controls move-step4-address-controls">

				<input id="newRoadAddress" class="form-control" type="text"
					placeholder="검색 버튼을 눌러 주소를 선택해 주세요" readonly>

				<button id="searchNewAddressBtn" class="btn btn-outline-primary"
					type="button">검색</button>

			</div>

			<p id="newAddressStatus" class="text-muted small mt-2 mb-0"
				role="status" aria-live="polite">검색 버튼을 누르면 도로명주소 검색 팝업이 열립니다.</p>

			<div id="newAddressResultSection" class="mt-3 d-none">

				<table class="gov24-result-table" aria-label="이사 온 곳 주소 조회 결과">

					<tbody>

						<tr>

							<th scope="row">기본 주소</th>

							<td id="newAddressResultText">-</td>

						</tr>

						<tr>

							<th scope="row">관할 읍·면·동 행정복지센터</th>

							<td id="newWelfareCenter">해봄동 행정복지센터 (가상)</td>

						</tr>

					</tbody>

				</table>

				<p class="text-muted small mt-2 mb-0">※ 행정복지센터는 실제 관할 기관 조회 결과가

					아닌 시뮬레이션용 가상 정보입니다.</p>

			</div>

		</div>

		<!-- 우편번호는 화면에 보이지 않지만 팝업 반환·답변 저장을 위해 유지 -->

		<input id="newZipNo" type="hidden"> <input
			id="newJibunAddress" type="hidden"> <input id="newAdmCd"
			type="hidden"> <input id="newRnMgtSn" type="hidden">

		<input id="newBdMgtSn" type="hidden"> <input id="newSiNm"
			type="hidden"> <input id="newSggNm" type="hidden"> <input
			id="newEmdNm" type="hidden">

		<div class="gov24-building-fields move-step4-building-fields">

			<label for="newBuildingPosition">건축물 구분 <select
				id="newBuildingPosition" class="form-select" disabled>

					<option value="">주소 검색 후 표시</option>

					<option value="0">지상</option>

					<option value="1">지하</option>

			</select>

			</label> <label for="newBuildingMainNo">본번 <input
				id="newBuildingMainNo" class="form-control" type="text" readonly>

			</label> <label for="newBuildingSubNo">부번 <input
				id="newBuildingSubNo" class="form-control" type="text" readonly>

			</label>

		</div>

		<div class="gov24-detail-address move-step4-detail-field">

			<label class="form-label fw-semibold" for="newDetailAddress">그

				외 주소</label> <input id="newDetailAddress" class="form-control" type="text"
				maxlength="150" autocomplete="off"
				placeholder="예) 101동 501호 (상세주소가 있는 경우 입력)">

			<div class="mt-2">

				<p class="small text-muted mb-1">※ 주소 검색 시 입력한 상세주소가 자동 반영되며,

					해봄에서도 수정할 수 있습니다.</p>

				<p class="small text-muted mb-0 mt-0">

					※ 상세한 주소가 있다면 <strong class="text-primary">그 외 주소란</strong>에 반드시

					기재해 주세요. <strong class="text-danger"> (미기재 시 실제 전입신고가 반려될

						수 있음) </strong> <span class="d-block ms-2"> (건축물의 이름, 동 번호 및 호수까지

						작성하고 호수가 없는 경우 층수를 작성) </span>

				</p>

			</div>

		</div>

		<!-- 참고 이미지처럼 세대 구성 라디오와 테이블을 동일한 패널 내부에 배치 -->

		<fieldset class="move-step4-household-fieldset">

			<legend>

				세대 구성 방법 <span class="move-step4-required">(필수)</span>

			</legend>

			<div class="move-step4-methods">

				<label class="move-step4-method-label" for="householdTypeEmpty">

					<input type="radio" class="form-check-input" name="householdType"
					id="householdTypeEmpty" value="NEW_HOUSEHOLD"> <span>이사

						온 사람끼리 세대 구성 (빈집으로 이사)</span>

				</label>

				<div id="emptyHouseholdOptions"
					class="move-step4-strategy-options d-none">

					<label for="emptyHeadKeep"> <input type="radio"
						class="form-check-input" name="emptyHeadType" id="emptyHeadKeep"
						value="KEEP_ORIGINAL"> <span id="emptyHeadKeepLabel">기존

							세대주로 유지</span>

					</label> <label for="emptyHeadChange"> <input type="radio"
						class="form-check-input" name="emptyHeadType" id="emptyHeadChange"
						value="CHANGE_HEAD"> <span>새로운 세대주로 변경</span>

					</label>

				</div>

				<p id="noOriginalHeadNotice" class="move-step4-help d-none">기존

					세대주가 이사 대상에 없으므로 이사하는 가족 중 새 세대주를 지정해야 합니다.</p>

				<label class="move-step4-method-label" for="householdTypeExisting">

					<input type="radio" class="form-check-input" name="householdType"
					id="householdTypeExisting" value="JOIN_EXISTING"> <span>이사

						온 곳에 기존에 살고 있는 세대주가 있는 경우</span>

				</label>

				<p id="existingHouseholdNotice"
					class="small text-muted mt-2 mb-0 d-none">※ 이사 온 곳에 기존에 살고 있는

					세대주와 별도 세대를 구성하려는 경우 온라인 전입신고가 불가하며, 관할 읍·면·동 행정복지센터에 문의하신 후 방문하여

					신고하시기 바랍니다.</p>

			</div>

			<p id="newHouseholdHeadSummary"
				class="move-step4-head-summary d-none" aria-live="polite"></p>

			<!-- 기존 세대주와 함께 이사 + 기존 세대주 유지 -->

			<div id="keepOriginalHeadSection"
				class="move-step4-household-detail d-none">

				<h4>

					세대주 및 세대원을 확인해 주세요. <span class="move-step4-required">(필수)</span>

				</h4>

				<div class="table-responsive">

					<table
						class="gov24-people-table move-step4-family-table move-step4-keep-table">

						<thead>

							<tr>

								<th scope="col">세대주와의 관계</th>

								<th scope="col">성명</th>

								<th scope="col">생년월일</th>

								<th scope="col">성별</th>

								<th scope="col">연락처(휴대전화번호)</th>

							</tr>

						</thead>

						<tbody id="keepOriginalHeadTableBody"></tbody>

					</table>

				</div>

				<p class="move-step4-validation-help">모든 가족의 연락처를 새로 입력해 주세요.</p>

			</div>

			<!-- 이사 대상에서 새 세대주 선정 -->

			<div id="changeNewHeadSection"
				class="move-step4-household-detail d-none">

				<h4>

					세대주를 선택하세요. <span class="move-step4-required">(필수)</span>

				</h4>

				<div class="table-responsive">

					<table
						class="gov24-people-table move-step4-family-table move-step4-change-table">

						<thead>

							<tr>

								<th scope="col">선택</th>

								<th scope="col">세대주와의 관계</th>

								<th scope="col">성명</th>

								<th scope="col">생년월일</th>

								<th scope="col">성별</th>

								<th scope="col">연락처(휴대전화번호)</th>

							</tr>

						</thead>

						<tbody id="changeNewHeadTableBody"></tbody>

					</table>

				</div>

				<p class="move-step4-validation-help">세대주 한 명을 선택하고 나머지 가족의 관계 및

					전체 연락처를 입력해 주세요.</p>

				<div id="minorNewHeadNotice"
					class="alert alert-warning small mt-3 d-none" role="status">

					<strong>미성년자 세대주 안내</strong>

					<p class="mb-1 mt-2">선택한 새 세대주가 미성년자입니다. 실제 전입신고에서는 법정대리인 확인 등

						추가 절차가 필요할 수 있으며, 온라인 신청 가능 여부는 관할 행정복지센터에 확인해야 합니다.</p>

					<p class="mb-0">해봄에서는 학습 목적으로 계속 진행할 수 있습니다.</p>

				</div>

			</div>

			<!-- 이미 다른 세대주가 살고 있는 주소에 편입 -->

			<div id="existingHouseholdSection"
				class="move-step4-household-detail d-none">

				<h4>

					이사 온 곳의 기존 세대주 확인이 필요합니다. <span class="move-step4-required">(필수)</span>

				</h4>

				<div class="move-step4-existing-fields">

					<div>

						<label class="form-label" for="existingHeadName">기존 세대주 명

							<span class="move-step4-required">(필수)</span>

						</label> <input id="existingHeadName" class="form-control" type="text"
							maxlength="50" autocomplete="off"
							placeholder="학습용 가상 이름을 입력해 주세요">

					</div>

					<div>

						<span class="form-label d-block">기존 세대주 확인 (학습용)</span>

						<div class="move-step4-mock-verify">

							<span class="move-step4-mock-id" aria-label="주민등록번호는 수집하지 않습니다">••••••-•••••••</span>

							<button id="mockExistingHeadConfirmBtn"
								class="btn btn-outline-primary" type="button">세대주 확인 체험</button>

						</div>

						<p id="existingHeadConfirmStatus" class="move-step4-help mt-2"
							role="status" aria-live="polite">실제 주민등록번호 입력이나 본인인증 없이 확인

							절차만 연습합니다.</p>

					</div>

					<div>

						<span class="form-label d-block">기존 세대주 휴대전화번호 <span
							class="move-step4-required">(필수)</span></span>

						<div class="move-step4-phone-fields sim-phone-group"
							id="existingHeadPhoneGroup" data-phone-group="existingHeadPhone">

							<input id="existingHeadPhoneFirst" class="form-control"
								type="tel" inputmode="numeric" maxlength="3" autocomplete="off"
								value="010" aria-label="기존 세대주 연락처 앞자리"> <span
								aria-hidden="true">–</span> <input id="existingHeadPhoneMiddle"
								class="form-control" type="tel" inputmode="numeric"
								maxlength="4" autocomplete="off" placeholder="0000"
								aria-label="기존 세대주 연락처 가운데자리"> <span aria-hidden="true">–</span>

							<input id="existingHeadPhoneLast" class="form-control" type="tel"
								inputmode="numeric" maxlength="4" autocomplete="off"
								placeholder="0000" aria-label="기존 세대주 연락처 뒷자리">

						</div>

					</div>

				</div>

				<h4 class="move-step4-relation-heading">

					이사 온 곳의 기존 세대주와의 관계를 입력하세요. <span class="move-step4-required">(필수)</span>

				</h4>

				<div class="table-responsive">

					<table
						class="gov24-people-table move-step4-family-table move-step4-existing-table">

						<thead>

							<tr>

								<th scope="col">세대주와의 관계</th>

								<th scope="col">성명</th>

								<th scope="col">생년월일</th>

								<th scope="col">성별</th>

								<th scope="col">연락처(휴대전화번호)</th>

							</tr>

						</thead>

						<tbody id="existingHouseholdTableBody"></tbody>

					</table>

				</div>

				<p class="move-step4-validation-help">기존 세대주와 이사 가족 전원의 전화번호를 새로

					입력해 주세요.</p>

			</div>

			<p class="move-step4-notice mt-3 mb-0">※ 실제 정부24에서는 세대 구성 방법 및 신고

				대상자의 상황에 따라 세대주 확인이나 추가 절차가 필요할 수 있습니다. 해봄에서는 실제 문자 발송이나 민원 신청이

				이루어지지 않습니다.</p>

		</fieldset>

	</section>

	<section class="gov24-extra-services mt-4">

		<h3>전입 신고와 함께 신청할 수 있는 서비스</h3>

		<div class="gov24-service-item">

			<div class="gov24-service-heading">

				<label> <input type="checkbox" class="form-check-input"
					name="additionalService" value="LEASE_REPORT"> <span>임대차계약

						신고 관련 안내 확인 (선택)</span>

				</label>

			</div>


			<!-- 임대차계약 신고 및 서류 제출 -->
			<div class="move-step4-service-detail d-none"
				data-service-section="LEASE_REPORT">

				<h5 class="fw-semibold fs-6 mb-3">이·통장 등의 사후확인 생략 및 임대차계약 신고를
					위한 서류 제출</h5>

				<p class="small text-secondary mb-3">전입신고 후 이·통장 등의 사후확인을 생략하거나
					주택 임대차계약 신고(확정일자 의제)를 함께 진행하려는 경우, 임대차계약서 등 관련 서류를 제출할 수 있습니다.</p>

				<!-- 서류 제출 선택 -->
				<div class="bg-light rounded-3 p-3 p-md-4 mb-4">
					<label class="d-flex align-items-start gap-2 fw-semibold mb-3">
						<input type="checkbox" class="form-check-input mt-1"
						name="leaseReportRequested"> <span>주택 임대차계약 신고(확정일자
							의제)를 위한 서류 제출 (선택)</span>
					</label>

					<ul class="small text-secondary mb-0 ps-3">
						<li class="mb-2">주택 임대차계약 신고 대상 계약에 해당하는 경우, 관련 법령에 따른 별도 신고
							의무가 있을 수 있습니다.</li>
						<li class="mb-2">임대차계약서의 내용이 정확히 입력되어 있지 않으면 신고 처리가 지연되거나 추가
							확인이 필요할 수 있습니다.</li>
						<li class="mb-2">실제 임대차계약 신고의 처리 여부는 부동산거래관리시스템 또는 관할 행정기관에서
							확인해야 합니다.</li>
						<li>신고가 완료된 경우에도 처리 결과와 관련 안내를 확인하는 것이 좋습니다.</li>
					</ul>

					<p class="small mt-3 mb-0">※ 관련 서류를 첨부하지 않는 경우에도 전입신고 자체가 반드시
						거부되는 것은 아닙니다. 다만 별도의 임대차계약 신고 의무는 확인해야 합니다.</p>
				</div>

				<!-- 첨부 서류 안내 -->
				<h5 class="fw-semibold fs-6 mb-3">서류명</h5>
				<p class="fw-semibold mb-3">이·통장 등의 사후확인 생략 및 주택 임대차계약 신고를 위한 서류
					제출</p>

				<ul class="small text-secondary ps-3 mb-3">
					<li class="mb-2">참고 파일 형식: JPG, JPEG, BMP, PDF</li>
					<li class="mb-2">정부24 화면의 안내 기준: 파일당 2MB</li>
					<li class="mb-2">실제 제출 시 파일 형식과 용량 제한은 해당 민원 서비스에서 다시 확인해야
						합니다.</li>
					<li>해봄에서는 실제 계약서나 개인정보가 포함된 파일을 업로드하지 않습니다.</li>
				</ul>

				<!-- 가상 서류 첨부 -->
				<div class="border rounded-3 p-3">
					<div class="fw-semibold mb-2">임대차계약서 첨부 (가상 체험)</div>

					<p class="small text-secondary mb-3">예시 임대차계약서를 첨부하는 과정을 연습합니다.
						실제 파일은 선택하거나 전송하지 않습니다.</p>

					<div id="leaseMockFileStatus"
						class="bg-light border rounded-3 p-3 mb-3">
						<span class="text-muted small"> 첨부된 가상 서류가 없습니다. </span>
					</div>

					<button type="button" id="attachLeaseMockFileBtn"
						class="btn btn-outline-primary btn-sm d-flex align-items-center">
						<span class="material-symbols-outlined" aria-hidden="true">attach_file</span>
						예시 임대차계약서 첨부하기
					</button>

					<button type="button" id="removeLeaseMockFileBtn"
						class="btn btn-outline-secondary btn-sm d-none">첨부 삭제</button>

					<p class="small text-secondary mt-3 mb-0">※ 이 첨부는 학습용 가상 체험이며,
						실제 전입신고나 임대차계약 신고가 이루어지지 않습니다.</p>
				</div>
			</div>

		</div>

		<div class="gov24-service-item">

			<div class="gov24-service-heading">

				<label> <input type="checkbox" class="form-check-input"
					name="additionalService" value="MAIL_FORWARD"> <span>우편물

						주소 이전 서비스 신청 (선택)</span>

				</label>

			</div>


			<div class="move-step4-service-detail d-none"
				data-service-section="MAIL_FORWARD">

				<!-- 서비스 안내 -->
				<ul class="small text-secondary ps-3 mb-4">
					<li class="mb-2">이전 주소로 배달되는 우편물을 전입 신고한 주소로 배달하는 서비스입니다.</li>
					<li class="mb-2">세대주 및 세대원의 개인정보가 우체국에 제공되므로 신청인의 동의가 필요합니다.</li>
					<li>정부24 안내에 따르면 관내 이사 시 3개월간 무료이며, 관외 이사 시에는 요금이 발생할 수 있습니다.
						실제 이용 조건은 우체국에서 확인해 주세요.</li>
				</ul>

				<hr class="my-4">

				<!-- 신청인 전화번호 (선택) -->
				<div class="mb-4">
					<label class="form-label fw-semibold"> 신청인 전화번호 <span
						class="small text-secondary">(선택)</span>
					</label>
					<div id="mailForwardLandlineGroup" class="sim-phone-group">
						<input type="text" class="form-control text-center" maxlength="3"
							inputmode="numeric" aria-label="신청인 전화번호 앞자리"> <span
							class="text-muted">-</span> <input type="text"
							class="form-control text-center" maxlength="4"
							inputmode="numeric" aria-label="신청인 전화번호 가운데 자리"> <span
							class="text-muted">-</span> <input type="text"
							class="form-control text-center" maxlength="4"
							inputmode="numeric" aria-label="신청인 전화번호 마지막 자리">
					</div>
				</div>

				<!-- 신청인 휴대전화번호 (필수) -->
				<div class="mb-3">
					<label class="form-label fw-semibold"> 신청인 휴대전화번호 <span
						class="text-primary small">(필수)</span>
					</label>
					<div id="mailForwardPhoneGroup" class="sim-phone-group">
						<input type="text" class="form-control text-center" maxlength="3"
							inputmode="numeric" value="010" aria-label="신청인 휴대전화번호 앞자리">
						<span class="text-muted">-</span> <input type="text"
							class="form-control text-center" maxlength="4"
							inputmode="numeric" placeholder="0000"
							aria-label="신청인 휴대전화번호 가운데 자리"> <span class="text-muted">-</span>
						<input type="text" class="form-control text-center" maxlength="4"
							inputmode="numeric" placeholder="0000"
							aria-label="신청인 휴대전화번호 마지막 자리">
					</div>
				</div>

				<!-- 신청인 정보와 동일 -->
				<label class="d-flex align-items-center gap-2 mb-2"> <input
					type="checkbox" class="form-check-input" name="mailSameAsApplicant">
					신청인 정보와 동일
				</label>

				<p class="small text-secondary mb-3">입력한 휴대전화번호로 우편물 주소 이전 서비스의
					이용 안내를 받을 수 있습니다. 해봄에서는 실제 안내 문자가 발송되지 않습니다.</p>

				<!-- 기존 추가 대상자 선택 영역은 여기부터 그대로 유지 -->
				<h4 class="small fw-semibold">추가 대상자 선택 (필수)</h4>
				<div class="table-responsive">
					<table class="gov24-people-table">
						<thead>
							<tr>
								<th>선택</th>
								<th>세대주와의 관계</th>
								<th>성명</th>
								<th>생년월일</th>
								<th>성별</th>
							</tr>
						</thead>
						<tbody id="mailFamilyTableBody"></tbody>
					</table>
				</div>
			</div>

		</div>

		<div class="gov24-service-item">

			<div class="gov24-service-heading">

				<label> <input type="checkbox" class="form-check-input"
					name="additionalService" value="SCHOOL_ADDRESS"> <span>초등학교
						배정 정보 확인 (선택)</span>
				</label>

			</div>

			<div class="move-step4-service-detail d-none"
				data-service-section="SCHOOL_ADDRESS">
				<p class="small text-muted">※ 초등학교 배정에 관한 자세한 사항은 이사하는 곳의 주민센터에
					문의해 주세요. 실제 배정 신청은 이루어지지 않습니다.</p>
				<p class="small text-muted">Step3에서 이사 대상으로 선택한 자녀 중 초등학생 연령대의
					후보를 표시합니다. 학적·실제 신청 자격은 판정하지 않습니다.</p>
				<div class="table-responsive">
					<table class="gov24-people-table">
						<thead>
							<tr>
								<th>선택</th>
								<th>세대주와의 관계</th>
								<th>성명</th>
								<th>생년월일</th>
								<th>성별</th>
							</tr>
						</thead>
						<tbody id="schoolAssignmentTableBody"></tbody>
					</table>
				</div>
				<p id="schoolAssignmentTableBodyEmpty"
					class="small text-muted mt-2 d-none">이사 대상 가족 중 표시할 자녀 후보가
					없습니다.</p>
				<p id="schoolCandidateNotice" class="small text-muted mt-2 d-none">이사
					대상 중 초등학생 연령대 자녀 후보가 없어 이 서비스는 선택할 수 없습니다. 체크를 해제해 주세요.</p>
			</div>
		</div>


		<div class="gov24-service-item">
			<div class="gov24-service-heading">
				<label> <input type="checkbox" class="form-check-input"
					name="additionalService" value="UTILITY_ADDRESS"> <span>전기사용자
						명의변경 신청 (선택)</span>
				</label>
			</div>

			<div class="move-step4-service-detail d-none"
				data-service-section="UTILITY_ADDRESS">

				<div class="move-step4-service-note-box">
					<h4 class="move-step4-service-note-title">
						<span class="material-symbols-outlined" aria-hidden="true">info</span>
						고객번호 선택시 유의사항
					</h4>

					<ul class="move-step4-service-note-list">
						<li><strong>주택용 고객</strong>에 대해서만 고객번호가 조회됩니다. (상가, 공장 등 일반용,
							산업용 고객 등은 제외)</li>
						<li><strong>아파트(오피스텔) 개별세대</strong>의 경우 고객번호가 조회되지 않으며, 명의변경을
							신청하실 필요가 없습니다.<br> ※ 한전은 아파트(오피스텔)의 개별세대가 아닌 아파트(오피스텔) 전체와
							1개의 계약을 체결</li>
						<li>고객번호 선택시 <strong>고객명/공동주택명/상호</strong> 등에 공공기관명, 통신사명,
							CCTV, 신호등, 보안등 등이 기재된 경우, 반드시 <strong>정확한 주소(전기사용장소)</strong>가
							맞는지 확인하시고 신청하시기 바랍니다.
						</li>
						<li>만약 고객번호가 조회가 되지 않는 경우, <strong>한전 고객센터(국번없이 123)</strong>로
							연락주시기 바랍니다.
						</li>
						<li>전기사용자 명의변경은 <strong>전입신고가 완료된 이후</strong> 신청이 접수됩니다.
							(전입신고 완료 당일 오후 10시 접수)
						</li>
					</ul>
				</div>

				<label class="d-flex align-items-center gap-2 mt-3 mb-0"> <input
					type="checkbox" name="electricNoticeConsent"
					class="form-check-input"> 전기사용자 명의변경 신청에 대한 유의사항을 읽고 동의합니다.
				</label>
			</div>
		</div>


		<div class="gov24-service-item">
			<div class="gov24-service-heading">
				<label> <input type="checkbox" class="form-check-input"
					name="additionalService" value="WELFARE_BENEFIT"> <span>사회적
						배려 대상자를 위한 요금감면 일괄신청 (선택)</span>
				</label>
			</div>

			<div class="move-step4-service-detail d-none"
				data-service-section="WELFARE_BENEFIT">

				<div class="move-step4-service-note-box">
					<h4 class="move-step4-service-note-title">
						<span class="material-symbols-outlined" aria-hidden="true">info</span>
						요금감면서비스
					</h4>

					<ul class="move-step4-service-note-list">
						<li>사회적 배려 대상자에게 전기요금, TV수신료, 도시가스요금, 지역난방비의 부담완화를 위해 요금을
							감면해주는 서비스입니다.</li>
						<li>요금감면 신청 후 <strong>변동사실 통보의무 이행</strong> 및 <strong>부당한
								요금에 대한 추가납부</strong>에 동의하여야 합니다.
						</li>
						<li>요금감면 자격여부 확인과 서비스 신청을 위해 <strong>행정정보 공동이용 사전동의</strong>
							및 요금감면기관에 개인정보를 제공하는 것에 동의해야 합니다.
							<div class="mt-1">※ 제공 항목: 성명, 주민등록번호, 주소, 연락처, 자격정보, 고객번호
								등</div>
						</li>
						<li>감면신청과 관련한 결정 또는 서비스 제공에 대해서는 해당 기관에 직접 문의하시기 바랍니다.
							<div class="mt-1">※ 전기요금/TV수신료: 한국전력공사, 도시가스요금: 해당 지역
								도시가스회사, 지역난방비·구역전기: 한국지역난방공사</div>
						</li>
						<li>사회적 배려 대상자는 기초생활수급자, 차상위, 장애인, 국가유공자, 보훈대상자, 다자녀가구, 대가족,
							출산가족 등입니다.</li>
					</ul>
				</div>

				<label class="d-flex align-items-center gap-2 mt-3 mb-0"> <input
					type="checkbox" name="welfareNoticeConsent"
					class="form-check-input"> <span>요금감면 일괄신청에 대한 유의사항을
						읽고 동의합니다.</span>
				</label>

				<p class="small text-secondary mt-2 mb-0">※ 해봄에서는 실제 자격 조회, 개인정보
					제공 및 요금감면 신청이 이루어지지 않습니다.</p>
			</div>
		</div>


	</section>

	<div class="alert alert-info mt-4 mb-3" role="note">

		<p class="small mb-0">

			<spring:message code="simulation.notice" />

		</p>

	</div>

	<div class="border rounded-3 bg-light p-3">

		<h4 class="fw-semibold small mb-2">입력 정보 및 진행 기록 안내</h4>

		<p class="text-muted small mb-0">

			<spring:message code="simulation.history" />

		</p>

		<p class="text-muted small mb-0">

			<spring:message code="simulation.privacy" />

		</p>

	</div>

</div>
