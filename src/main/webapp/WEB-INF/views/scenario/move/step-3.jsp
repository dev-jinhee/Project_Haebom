<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<!-- 전입신고 3단계 | 이사 전 주소 + 이사 대상 가족 + (조건부) 새 세대주 -->
<!-- stepContent 내부에 삽입되는 JSP fragment. 상단 단계 제목/이전·다음 버튼은 simulation.jsp가 담당 -->
<div class="sim-step-content move-step3" data-step="3">
	<section class="gov24-form-panel move-step3-panel">
		<h3>이사 전 거주지 정보</h3>

		<!-- 1. 이사 전 주소 조회 -->
		<div class="move-step3-block">
			<h4 class="move-step3-heading">주소 확인</h4>
			<div class="gov24-address-controls move-step3-address-controls">
				<label for="sidoSelect" class="visually-hidden">시·도</label> <select
					id="sidoSelect" class="form-select" aria-label="시·도 선택">
					<option value="">시·도 선택</option>
				</select> <label for="sigunguSelect" class="visually-hidden">시·군·구</label> <select
					id="sigunguSelect" class="form-select" aria-label="시·군·구 선택"
					disabled>
					<option value="">시·군·구 선택</option>
				</select>

				<button id="searchFamilyBtn" type="button"
					class="btn btn-outline-primary" disabled>주소조회</button>
			</div>
			<p id="addressStatus" class="text-muted small mt-2 mb-0"
				role="status" aria-live="polite">시·도와 시·군·구를 선택해 주세요.</p>

			<!-- 조회 버튼 클릭 후 표시. SGIS에서 시도/시군구만 가져오고 나머지는 가상 데이터 -->
			<div id="addressResultSection" class="mt-3 d-none">
				<table class="gov24-result-table move-step3-info-table">
					<tbody>
						<tr>
							<th scope="row">기본 주소</th>
							<td id="baseAddress">-</td>
						</tr>
						<tr>
							<th scope="row">관할 읍·면·동 행정복지센터</th>
							<td id="welfareCenter">해봄동 행정복지센터</td>
						</tr>
					</tbody>
				</table>
				<p class="text-muted small mt-2 mb-0">※ 상세 주소와 행정복지센터는 실제 정보가 아닌
					시뮬레이션용 가상 정보입니다.</p>
			</div>
		</div>

		<!-- 2. 이사할 가족 선택: 주소 조회 성공 이후 노출 -->
		<div id="familySection" class="move-step3-block d-none">
			<h4 class="move-step3-heading">
				이사 가는 사람 선택 <span class="move-step3-required">(필수)</span>
			</h4>
			<div class="table-responsive">
				<table class="gov24-people-table move-step3-people-table">
					<colgroup>
						<col class="move-step3-col-check">
						<col class="move-step3-col-relation">
						<col class="move-step3-col-name">
						<col class="move-step3-col-birth">
						<col class="move-step3-col-gender">
					</colgroup>
					<thead>
						<tr>
							<th scope="col"><input id="selectAllMoving" type="checkbox"
								class="form-check-input" aria-label="이사 대상 가족 전체 선택"></th>
							<th scope="col">세대주와의 관계</th>
							<th scope="col">성명</th>
							<th scope="col">생년월일</th>
							<th scope="col">성별</th>
						</tr>
					</thead>
					<tbody id="familyTableBody"></tbody>
				</table>
			</div>
			<p class="text-muted small mt-2 mb-0">신청인은 필수 이사 대상입니다.</p>
		</div>

		<!-- 3. 기존 세대주가 이사하고, 기존 주소에 가족이 남는 경우에만 노출 -->
		<div id="remainingHeadSection" class="move-step3-block d-none">
			<h4 class="move-step3-heading">
				세대주를 선택해 주세요. <span class="move-step3-required">(필수)</span>
			</h4>
			<p class="text-muted small mb-3">기존 주소에 남는 가족 중 새로운 세대주 한 명을 선택해
				주세요.</p>
			<div class="table-responsive">
				<table class="gov24-people-table move-step3-people-table">
					<colgroup>
						<col class="move-step3-col-check">
						<col class="move-step3-col-relation">
						<col class="move-step3-col-name">
						<col class="move-step3-col-birth">
						<col class="move-step3-col-gender">
					</colgroup>
					<thead>
						<tr>
							<th scope="col">선택</th>
							<th scope="col">세대주와의 관계</th>
							<th scope="col">성명</th>
							<th scope="col">생년월일</th>
							<th scope="col">성별</th>
						</tr>
					</thead>
					<tbody id="remainingHeadOptions"></tbody>
				</table>
			</div>

			<h4 class="move-step3-heading move-step3-phone-heading">
				새로운 세대주의 연락처를 정확히 입력해 주세요. <span class="move-step3-required">(필수)</span>
			</h4>
			<label for="newHeadPhoneFirst" class="form-label small">휴대전화번호</label>
			<div class="move-step3-phone-group sim-phone-group">
				<input id="newHeadPhoneFirst" class="form-control" type="text"
					inputmode="numeric" maxlength="3" autocomplete="off"
					aria-label="세대주 휴대전화번호 앞자리" value="010"> <span
					aria-hidden="true">-</span> <input id="newHeadPhoneMiddle"
					class="form-control" type="text" inputmode="numeric" maxlength="4"
					autocomplete="off" placeholder="0000" aria-label="세대주 휴대전화번호 중간자리">
				<span aria-hidden="true">-</span> <input id="newHeadPhoneLast"
					class="form-control" type="text" inputmode="numeric" maxlength="4"
					autocomplete="off" placeholder="0000" aria-label="세대주 휴대전화번호 뒷자리">
			</div>
		</div>
	</section>
	<!-- 전입신고 Step3: 이사 전 가족 조회/세대주 정보 영역 아래, 기존 교육용 공통 안내 위에 삽입 -->
	<div class="move-step3-consents" aria-label="행정정보 확인 동의">
		<section class="move-step3-consent-section"
			aria-labelledby="personalConsentTitle">
			<h3 id="personalConsentTitle">본인정보 제공요구서 및 공동이용 동의</h3>
			<details class="move-step3-consent-details" open>
				<summary>
					<span>정보 확인 동의 (필수)</span> <span class="material-symbols-outlined"
						aria-hidden="true">expand_more</span>
				</summary>
				<div class="move-step3-consent-body">
					<p>
						<strong class="move-step3-consent-label">[이용기관 명칭]</strong>읍·면·동사무소
						및 출장소
					</p>
					<p>
						<strong class="move-step3-consent-label">[이용사무 목적]</strong>「주민등록법
						시행령」 제23조제2항제2호 단서 및 같은 조 제3항에 따라 전입자가 신고인 본인의 배우자 또는 직계혈족인지 여부를
						확인
					</p>
					<p>
						<strong class="move-step3-consent-label">[공동이용 행정정보]</strong>가족관계증명서(상세)
					</p>
					<p>
						<strong class="move-step3-consent-label">[정보 주체(신고인 본인)
							동의사항]</strong> 「민원 처리에 관한 법률」 제10조의2, 같은 법 시행령 제7조의3 및 제7조의4에 따라 공동이용을 위한
						본인정보를 위와 같이 신청하며, 본인은 이 건 업무 처리와 관련하여 「민원 처리에 관한 법률」 제10조의2에 따른
						본인정보 제공 요구를 통해 민원처리기관의 담당자가 전자적으로 본인에 관한 행정정보를 확인하는 것에 동의합니다.
					</p>
					<p>• 신청인이 본인정보 제공 요구서 및 공동이용에 동의하지 않는 경우에는 신청인이 직접 해당 서류를 제출해야
						합니다.</p>
				</div>
				<div class="move-step3-consent-options" role="group"
					aria-label="본인정보 제공요구서 및 공동이용 동의 여부">
					<label><input type="radio" class="form-check-input"
						name="personalInfoConsent" value="DISAGREE"> 동의하지 않음</label> <label><input
						type="radio" class="form-check-input" name="personalInfoConsent"
						value="AGREE"> 동의함</label>
				</div>
			</details>
			<div id="personalInfoConsentDisagreeNotice"
				class="alert alert-warning small move-step3-consent-disagree-notice d-none"
				role="status">동의하지 않는 경우 실제 신청에서는 관련 서류를 직접 제출해야 할 수 있습니다.
				해봄에서는 서류 제출 없이 학습을 계속할 수 있습니다.</div>
		</section>

		<section class="move-step3-consent-section"
			aria-labelledby="administrativeConsentTitle">
			<h3 id="administrativeConsentTitle">행정정보 공동이용 동의</h3>
			<details class="move-step3-consent-details" open>

				<summary>
					<span>정보 확인 동의 (필수)</span> <span class="material-symbols-outlined"
						aria-hidden="true">expand_more</span>
				</summary>
				<div class="move-step3-consent-body">
					<p>
						<strong class="move-step3-consent-label">[이용기관 명칭]</strong>읍·면·동사무소
						및 출장소
					</p>
					<p>
						<strong class="move-step3-consent-label">[이용사무 목적]</strong>「주민등록법
						시행령」 제23조제2항제2호 단서 및 같은 조 제3항에 따라 전입자가 신고인 본인의 배우자 또는 직계혈족인지 여부를
						확인
					</p>
					<p>
						<strong class="move-step3-consent-label">[공동이용 행정정보]</strong>가족관계증명서(상세)
					</p>
					<p>
						<strong class="move-step3-consent-label">[정보 주체(신고인 본인)
							동의사항]</strong> 본인은 이 건 업무 처리와 관련하여 담당 공무원이 「전자정부법」 제36조제1항에 따른 행정정보의 공동이용을
						통해 위의 담당 공무원 확인사항을 확인하는 것에 동의합니다.
					</p>
					<p>• 신청인이 행정정보의 공동이용에 동의하지 않는 경우에는 신청인이 직접 해당 서류를 제출해야 합니다.</p>
				</div>
				<div class="move-step3-consent-options" role="group"
					aria-label="행정정보 공동이용 동의 여부">
					<label><input type="radio" class="form-check-input"
						name="administrativeInfoConsent" value="DISAGREE"> 동의하지 않음</label>
					<label><input type="radio" class="form-check-input"
						name="administrativeInfoConsent" value="AGREE"> 동의함</label>
				</div>
			</details>
			<div id="administrativeInfoConsentDisagreeNotice"
				class="alert alert-warning small move-step3-consent-disagree-notice d-none"
				role="status">동의하지 않는 경우 실제 신청에서는 관련 서류를 직접 제출해야 할 수 있습니다.
				해봄에서는 서류 제출 없이 학습을 계속할 수 있습니다.</div>
		</section>
	</div>

	<!-- 공통 안내 문구: 기존 해봄 메시지 유지 -->
	<div class="alert alert-info mb-3 mt-2" role="note">
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
