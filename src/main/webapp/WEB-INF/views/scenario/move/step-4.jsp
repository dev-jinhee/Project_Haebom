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
				<p id="existingHouseholdNotice" class="small text-muted mt-2 mb-0 d-none">
					※ 이사 온 곳에 기존에 살고 있는 세대주와 별도 세대를 구성하려는 경우 온라인 전입신고가 불가하며, 관할 읍·면·동
					행정복지센터에 문의하신 후 방문하여 신고하시기 바랍니다.</p>
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
						<div
							class="move-step4-phone-fields move-step4-existing-head-phone"
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
		</div>
		<div class="gov24-service-item">
			<div class="gov24-service-heading">
				<label> <input type="checkbox" class="form-check-input"
					name="additionalService" value="MAIL_FORWARD"> <span>우편물
						주소 이전 서비스 신청 (선택)</span>
				</label>
			</div>
		</div>
		<div class="gov24-service-item">
			<div class="gov24-service-heading">
				<label> <input type="checkbox" class="form-check-input"
					name="additionalService" value="SCHOOL_ADDRESS"> <span>초등학교
						배정 정보 확인 (선택)</span>
				</label>
			</div>
		</div>
		<div class="gov24-service-item">
			<div class="gov24-service-heading">
				<label> <input type="checkbox" class="form-check-input"
					name="additionalService" value="UTILITY_ADDRESS"> <span>전기
						사용자 명의변경 안내 확인 (선택)</span>
				</label>
			</div>
		</div>
		<div class="gov24-service-item">
			<div class="gov24-service-heading">
				<label> <input type="checkbox" class="form-check-input"
					name="additionalService" value="WELFARE_BENEFIT"> <span>복지급여
						관련 안내 확인 (선택)</span>
				</label>
			</div>
		</div>
	</section>

	<div class="alert alert-info mt-4 mb-3" role="note">
		<p class="small mb-0">
			<spring:message code="simulation.notice" />
		</p>
	</div>
	<div class="border rounded-3 bg-light p-3">
		<h4 class="small fw-semibold mb-2">개인정보 입력 안내</h4>
		<p class="small text-muted mb-0">
			<spring:message code="simulation.privacy" />
		</p>
	</div>
</div>
