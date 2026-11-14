<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%-- simulation.jsp가 삽입하는 STEP 1 fragment: 공통 이전/완료 버튼은 중복 생성하지 않습니다. --%>
<div class="sim-step-content certificate-step1" data-step="1">
	<header class="certificate-heading">
		<h2>주민등록표 등본(초본) 발급</h2>
		<p>신청할 서비스를 선택하세요.</p>
	</header>


	<%-- 해봄 학습 도움말: 기본은 접어 두고, 필요할 때 열어 비교합니다. --%>
	<details class="sim-learning-quick-guide">
		<summary>
			<span class="material-symbols-outlined" aria-hidden="true">help_outline</span>
			<span>등본과 초본, 어떤 차이가 있나요?</span> <span
				class="sim-learning-quick-guide-hint">눌러서 알아보기</span>
		</summary>
		<div class="sim-learning-quick-guide-body">
			<dl class="sim-learning-quick-guide-list">
				<div>
					<dt>등본</dt>
					<dd>
						세대를 기준으로 구성원들의 주민등록 사항을 확인해요. <span>예: 현재 함께 등록된 세대원 확인</span>
					</dd>
				</div>
				<div>
					<dt>초본</dt>
					<dd>
						개인을 기준으로 주민등록 사항과 주소·인적사항의 변동 기록 등을 확인해요. <span>예: 본인의 과거
							주소 이력 확인</span>
					</dd>
				</div>
			</dl>
			<p class="sim-learning-quick-guide-tip">제출기관에서 요청한 서류 종류와 주민등록번호
				뒷자리·주소 이력의 표시 여부를 먼저 확인하세요.</p>
			<p class="sim-learning-source">
				출처: <a
					href="https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000015&amp;HighCtgCD=A01010001&amp;tp_seq=01&amp;Mcode=10200"
					target="_blank" rel="noopener noreferrer">정부24 주민등록표 등본(초본) 발급
					안내</a>
			</p>
		</div>
	</details>

	<%-- 기존의 라디오 4개를 세로로 한 줄씩 배치합니다. value/name 유지. --%>
	<section class="certificate-panel certificate-types"
		aria-label="발급 서비스 선택">
		<label class="certificate-type-option"> <input type="radio" class="form-check-input"
			name="certificateType" value="DEUNGBON" checked> <span>주민등록표
				등본 발급</span>
		</label> <label class="certificate-type-option"> <input type="radio" class="form-check-input"
			name="certificateType" value="CHOBON"> <span>주민등록표 초본
				발급</span>
		</label> <label class="certificate-type-option is-disabled"> <input
			type="radio" class="form-check-input" name="certificateType" value="DEUNGBON_EN" disabled>
			<span>주민등록표 등본(영문) 발급 <small>체험 미지원</small></span>
		</label> <label class="certificate-type-option is-disabled"> <input
			type="radio" class="form-check-input" name="certificateType" value="CHOBON_EN" disabled>
			<span>주민등록표 초본(영문) 발급 <small>체험 미지원</small></span>
		</label>
	</section>

	<%-- 정부24 화면 참고: 발급 안내. 실제 정부24 공지 변경 시 내용 점검 필요. --%>
	<section class="sim-guide-panel" aria-labelledby="certGuideTitle">
		<h3 class="sim-guide-title" id="certGuideTitle">
			<span class="material-symbols-outlined" aria-hidden="true">edit_square</span>
			시작하기 전에
		</h3>
		<ul class="sim-guide-list">
			<li>10월 29일부터 등·초본 발급 시 <strong>세대주와의 관계 표기방식이 변경</strong>(예: 자녀
				X, 세대원 O)되는 점 유의해 주세요.<br>상세로 선택하시면 기존 표기방식으로 발급(예: 자녀) 가능합니다.
			</li>
			<li>2026년 10월 29일부터 등·초본 발급 전, 제출기관에 필요한 발급 형태(<strong>일반
					또는 상세</strong>)를 꼭 확인하세요!
			</li>
			<li>“일반”으로 선택한 경우 세대주의 배우자 외 가족(부모, 조부모, 자녀, 배우자의 자녀 등)은 “세대원”,
				그 외에는 “동거인”으로 표기됩니다.</li>
			<li>“상세”로 선택한 경우 기존 표기법(자녀, 배우자의 자녀, 삼촌 등)대로 구체적인 관계가 표기되며, “용도
				및 목적” 작성이 필요합니다.</li>
		</ul>
		<ul class="sim-guide-list sim-guide-last">
			<li>이 민원은 <strong>인증서를 통한 전자서명</strong>이 필요합니다.
			</li>
			<li>이 민원은 <strong>전자증명서</strong>로 수령 가능합니다.
			</li>
		</ul>
	</section>
	<section class="certificate-panel certificate-form"
		aria-labelledby="certFormTitle">
		<h3 id="certFormTitle">신청 내용</h3>
		<div class="certificate-field">
			<label class="certificate-label" for="certificateSido">주민등록상
				주소 확인 <em>(필수)</em>
			</label>
			<div class="certificate-address-row">

				<select id="certificateSido" name="residentSidoCode"
					class="form-select" aria-label="시·도 선택">
					<option value="">시·도 선택</option>
				</select> <select id="certificateSigungu" name="residentSigunguCode"
					class="form-select" aria-label="시·군·구 선택" disabled>
					<option value="">시·군·구 선택</option>
				</select>

			</div>
			<div class="sim-learning-tip">
				<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span>
				<div class="sim-learning-tip-content">
					<strong>무엇을 선택하나요?</strong>
					<p>주민등록이 되어 있는 지역의 시·도와 시·군·구를 고르세요. 이 체험에서는 상세주소를 입력하지 않아요.</p>
				</div>
			</div>
			<p id="certificateAddressStatus" class="certificate-hint"
				aria-live="polite">주민등록상 주소를 선택해 주세요.</p>
		</div>

		<div class="certificate-field certificate-issue-mode">
			<div class="certificate-label">
				발급형태 선택 <em>(필수)</em>
			</div>
			<div class="certificate-inline-options certificate-issue-radios">
				<label><input type="radio" class="form-check-input" name="issueMode" value="ALL"
					checked> 전체 발급</label> <label><input type="radio" class="form-check-input"
					name="issueMode" value="SELECT"> 선택 발급</label>
			</div>
			<div class="sim-learning-tip">
				<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span>
				<div class="sim-learning-tip-content">
					<strong>전체 발급과 선택 발급의 차이</strong>
					<p>
						<strong>전체 발급</strong>은 기본 표시 범위를 한 번에 선택하는 방식이고, <strong>선택
							발급</strong>은 필요한 정보만 골라 표시하는 방식이에요. 어떤 정보를 넣어야 하는지는 제출기관에 먼저 확인하세요.
					</p>
				</div>
			</div>
			<p id="certificateIssueHint" class="certificate-hint">과거주소 변동사항을
				제외한 모든 정보가 표시됩니다.</p>
		</div>

		<%-- 전체 발급: 아래 전체 숨김. 선택 발급: 항목 체크박스만 먼저 노출. --%>
		<div id="certificateSelectiveOptions" hidden>
			<div id="certificateDeungbonFields">
				<%-- 화면이 복잡해지지 않도록 선택 항목의 학습 설명은 접어서 제공합니다. --%>
				<details
					class="sim-learning-quick-guide certificate-selective-guide">
					<summary>
						<span class="material-symbols-outlined" aria-hidden="true">help_outline</span>
						<span>등본 선택 항목, 어떤 정보인가요?</span> <span
							class="sim-learning-quick-guide-hint">눌러서 알아보기</span>
					</summary>
					<div class="sim-learning-quick-guide-body">
						<dl class="sim-learning-quick-guide-list">
							<div>
								<dt>과거의 주소 변동사항</dt>
								<dd>과거에 주민등록한 주소의 변동 기록을 표시해요. 전체 또는 최근 몇 년을 선택할 수 있어요.</dd>
							</div>
							<div>
								<dt>세대 구성 정보</dt>
								<dd>세대가 구성된 사유와 날짜, 변동 사유를 표시할지 선택해요.</dd>
							</div>
							<div>
								<dt>세대 구성원 정보</dt>
								<dd>세대 구성원의 변동 사유, 발생일·신고일 및 이름 표시 범위를 선택해요.</dd>
							</div>
							<div>
								<dt>주민등록번호 뒷자리</dt>
								<dd>번호 뒷자리를 세대원 전체에 표시할지, 일부만 표시할지 정해요.</dd>
							</div>
							<div>
								<dt>세대원의 세대주와의 관계</dt>
								<dd>일반은 세대원·동거인 중심, 상세는 부모·자녀 등 구체적인 관계를 표시해요. 상세를 선택하면 용도도
									입력해요.</dd>
							</div>
						</dl>
						<p class="sim-learning-quick-guide-tip">필요한 항목은 서류를 제출할 기관에서
							요구하는 기준에 맞춰 선택해 주세요.</p>
					</div>
				</details>
				<div class="certificate-option-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"><input
							type="checkbox" class="form-check-input" name="deungbonPastAddressIncluded"
							aria-describedby="certHelpDeungbonPast"> 과거의 주소 변동사항</label>
						<p class="visually-hidden" id="certHelpDeungbonPast">예전에
							주민등록했던 주소의 변동 이력이에요. 전체 이력 또는 최근 몇 년의 이력만 표시하도록 선택할 수 있어요.</p>
					</div>
					<div class="certificate-option-content certificate-past-address"
						hidden>
						<label><input type="radio" class="form-check-input" name="deungbonPastAddressScope"
							value="ALL" checked> 과거 주소 전체</label> <label><input
							type="radio" class="form-check-input" name="deungbonPastAddressScope" value="RECENT">
							직접입력: 최근</label> <span class="certificate-years-wrap"><input
							type="number" name="deungbonPastAddressYears" min="1" max="99"
							step="1" value="1" class="certificate-year-input"
							aria-label="최근 연도"> 년</span>
					</div>
				</div>
				<div class="certificate-option-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"><input
							type="checkbox" class="form-check-input" name="deungbonHouseholdCompositionIncluded"
							aria-describedby="certHelpDeungbonComposition"> 세대 구성 정보</label>
						<p class="visually-hidden" id="certHelpDeungbonComposition">세대가
							만들어진 사유와 날짜 등 세대 구성 자체에 관한 정보예요.</p>
					</div>
					<div class="certificate-option-content certificate-check-grid"
						hidden>
						<label><input type="checkbox" class="form-check-input"
							name="deungbonHouseholdCompositionReasonIncluded" checked>
							세대 구성 사유</label> <label><input type="checkbox" class="form-check-input"
							name="deungbonHouseholdCompositionDateIncluded" checked>
							세대 구성 일자</label> <label><input type="checkbox" class="form-check-input"
							name="deungbonChangeReasonIncluded" checked> 변동 사유</label>
					</div>
				</div>
				<div class="certificate-option-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"><input
							type="checkbox" class="form-check-input" name="deungbonHouseholdMemberIncluded"
							aria-describedby="certHelpDeungbonMembers"> 세대 구성원 정보</label>
						<p class="visually-hidden" id="certHelpDeungbonMembers">세대
							구성원의 변동사유·발생일/신고일이나 표시할 이름 범위 등을 정하는 항목이에요.</p>
					</div>
					<div class="certificate-option-content certificate-check-grid"
						hidden>
						<label><input type="checkbox" class="form-check-input"
							name="deungbonHouseholdMemberNameIncluded" checked> 동거인</label> <label><input
							type="checkbox" class="form-check-input"
							name="deungbonHouseholdMemberChangeReasonIncluded" checked>
							변동 사유</label> <label><input type="checkbox" class="form-check-input"
							name="deungbonHouseholdMemberReportDateIncluded" checked>
							발생일/신고일</label> <label class="certificate-long-checkbox"><input
							type="checkbox" class="form-check-input" name="deungbonHouseholdMemberOtherNamesIncluded"
							checked> 교부대상자 외 세대주·세대원·외국인 등의 이름</label>
					</div>
				</div>
				<div class="certificate-option-row certificate-member-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"><input
							type="checkbox" class="form-check-input" name="deungbonRrnBackIncluded"
							aria-describedby="certHelpDeungbonRrn"> 주민등록번호 뒷자리</label>
						<p class="visually-hidden" id="certHelpDeungbonRrn">주민등록번호 뒷자리
							표시 범위를 결정해요. 세대전부 또는 필요한 세대원 일부만 선택할 수 있어요.</p>
					</div>
					<div class="certificate-option-content certificate-inline-options"
						hidden>
						<label><input type="radio" class="form-check-input" name="deungbonRrnBackScope"
							value="HOUSEHOLD_ALL" checked> 세대전부</label> <label><input
							type="radio" class="form-check-input" name="deungbonRrnBackScope" value="HOUSEHOLD_PART">
							세대일부</label>
						<button type="button" id="certificateLookupMembers"
							class="certificate-lookup-button" hidden>세대원 조회</button>
					</div>
					<div id="certificateMemberLookupArea"
						class="certificate-member-table-area" hidden>
						<p class="certificate-hint">신청인을 제외한 가족 정보는 교육용 가상 데이터입니다. 표시
							대상을 선택해 주세요.</p>
						<table class="certificate-member-table">
							<thead>
								<tr>
									<th scope="col">선택</th>
									<th scope="col">성명(관계)</th>
									<th scope="col">생년월일</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td><input type="checkbox" class="form-check-input"
										name="certificateSelectedMember" value="SELF"
										aria-label="신청인 선택"></td>
									<td><span id="certificateApplicantName">신청인</span> (본인)</td>
									<td id="certificateApplicantBirth">-</td>
								</tr>
								<tr>
									<td><input type="checkbox" class="form-check-input"
										name="certificateSelectedMember" value="SPOUSE"
										aria-label="가상 배우자 선택"></td>
									<td>이오티 (배우자)</td>
									<td>1989년 04월 12일</td>
								</tr>
								<tr>
									<td><input type="checkbox" class="form-check-input"
										name="certificateSelectedMember" value="CHILD"
										aria-label="가상 자녀 선택"></td>
									<td>이엑사 (자녀)</td>
									<td>2016년 09월 08일</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div class="certificate-option-row certificate-relation-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"><input
							type="checkbox" class="form-check-input" name="deungbonRelationshipIncluded"
							aria-describedby="certHelpDeungbonRelation"> 세대원의 세대주와의
							관계</label>
						<p class="visually-hidden" id="certHelpDeungbonRelation">세대주와의
							관계를 간단히 표시할지, 부모·자녀 같은 구체적 관계로 표시할지 정해요. 상세 선택 시 용도를 입력해요.</p>
					</div>
					<div class="certificate-option-content certificate-inline-options"
						hidden>
						<label><input type="radio" class="form-check-input" name="deungbonRelationshipType"
							value="GENERAL" checked> 일반</label> <label><input
							type="radio" class="form-check-input" name="deungbonRelationshipType" value="DETAIL">
							상세</label>
					</div>
					<div class="certificate-option-note" hidden>
						<p class="certificate-hint">일반: 세대원/동거인 표시 · 상세: 구체적인 가족관계 표시</p>
					</div>
				</div>
				<%-- 등본 상세 선택 용도: 초본과 동일하게 선택 행 바깥 배치 --%>
				<div id="certificatePurposeArea" class="certificate-purpose" hidden>
					<label class="certificate-label" for="certificatePurpose">용도
						및 목적 <em>(필수)</em>
					</label> <select class="form-select" id="certificatePurpose"
						name="deungbonPurpose">
						<option value="">선택해 주세요.</option>
						<option value="ADMIN">행정기관 제출용</option>
						<option value="FINANCE">금융기관(은행 등) 제출용</option>
						<option value="REAL_ESTATE">부동산 업무용</option>
						<option value="COURT">법원 제출용</option>
						<option value="PRIVATE">민간기관 제출용</option>
						<option value="OTHER">기타</option>
					</select>
					<p class="visually-hidden">왜 필요한가요? 가족관계를 ‘상세’로 표시할 때 어떤 목적으로
						사용하는지 선택하는 항목이에요. ‘기타’를 고르면 아래에 직접 적어 주세요.</p>
					<div id="certificatePurposeOtherArea" hidden>
						<label class="certificate-label" for="certificatePurposeOther">기타
							용도 <em>(필수)</em>
						</label><input id="certificatePurposeOther" name="deungbonPurposeDetail"
							maxlength="100" type="text" placeholder="용도를 입력해 주세요.">
					</div>
				</div>
			</div>

			<%-- 초본 선택 발급: 정부24 화면 참고 (국문) --%>
			<div id="certificateChobonFields" hidden>
				<%-- 화면이 복잡해지지 않도록 선택 항목의 학습 설명은 접어서 제공합니다. --%>
				<details
					class="sim-learning-quick-guide certificate-selective-guide">
					<summary>
						<span class="material-symbols-outlined" aria-hidden="true">help_outline</span>
						<span>초본 선택 항목, 어떤 정보인가요?</span> <span
							class="sim-learning-quick-guide-hint">눌러서 알아보기</span>
					</summary>
					<div class="sim-learning-quick-guide-body">
						<dl class="sim-learning-quick-guide-list">
							<div>
								<dt>과거의 주소 변동사항</dt>
								<dd>이전에 주민등록한 주소 기록이에요. 전체 또는 최근 N년을 고르고 발생일·신고일과 변동 사유의 표시
									여부를 정해요.</dd>
							</div>
							<div>
								<dt>과거 주소의 세대주 관계</dt>
								<dd>예전 주소에서 등록되어 있던 세대주의 성명 및 그 당시의 관계 정보예요.</dd>
							</div>
							<div>
								<dt>개인 인적사항 변경 내용</dt>
								<dd>성명이나 주민등록번호가 변경된 기록에서 표시할 범위를 정해요.</dd>
							</div>
							<div>
								<dt>주민등록번호 등 식별번호</dt>
								<dd>주민등록번호 뒷자리, 국내거소신고번호, 외국인등록번호의 표시 여부를 선택해요. 민감한 번호는 필요할
									때만 표시하세요.</dd>
							</div>
							<div>
								<dt>병역사항</dt>
								<dd>입영·전역일자만 표시할지, 전체 병역사항을 표시할지 정해요.</dd>
							</div>
							<div>
								<dt>세대주 성명과 세대주와의 관계</dt>
								<dd>현재 세대주의 성명 및 본인과의 관계를 일반 또는 상세로 표시해요. 상세는 용도 입력이 필요해요.</dd>
							</div>
						</dl>
						<p class="sim-learning-quick-guide-tip">필요한 항목은 서류를 제출할 기관에서
							요구하는 기준에 맞춰 선택해 주세요.</p>
					</div>
				</details>
				<!-- 1. 과거의 주소 변동사항 -->
				<div class="certificate-option-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"> <input
							type="checkbox" class="form-check-input" name="chobonPastAddressIncluded"
							aria-describedby="certHelpChobonPast"> 과거의 주소 변동사항
						</label>
						<p class="visually-hidden" id="certHelpChobonPast">본인이 이전에
							주민등록했던 주소의 변동 기록이에요. 전체 또는 최근 N년을 고르고, 날짜·변동사유의 표시 여부도 정할 수 있어요.</p>
					</div>
					<div class="certificate-option-content certificate-past-address"
						hidden>
						<label><input type="radio" class="form-check-input" name="chobonPastAddressScope"
							value="ALL" checked> 전체 포함</label>
						<div class="certificate-recent-group">
							<label><input type="radio" class="form-check-input" name="chobonPastAddressScope"
								value="RECENT"> 직접입력: 최근</label> <span
								class="certificate-years-wrap"> <input type="number"
								name="chobonPastAddressYears" min="1" max="99" step="1"
								value="1" class="certificate-year-input"
								aria-label="초본 과거 주소 조회 연수"> 년
							</span>
						</div>
					</div>
					<div class="certificate-option-note certificate-chobon-past-extras"
						hidden>
						<label><input type="checkbox" class="form-check-input"
							name="chobonPastAddressReportDateIncluded" checked>
							발생일/신고일</label> <label><input type="checkbox" class="form-check-input"
							name="chobonPastAddressChangeReasonIncluded" checked>
							변동사유</label>
					</div>
				</div>

				<!-- 2. 과거 주소 변동사항 중 세대주와의 관계 -->
				<div class="certificate-option-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"> <input
							type="checkbox" class="form-check-input" name="chobonPastHouseholdRelationIncluded"
							aria-describedby="certHelpChobonPastRelation"> 과거의 주소
							변동사항 중 세대주 성명과 세대주의 관계
						</label>
						<p class="visually-hidden" id="certHelpChobonPastRelation">예전
							주소에서 함께 등록됐던 세대주의 성명과 그 당시의 관계에 관한 정보예요.</p>
					</div>
					<div class="certificate-option-content certificate-inline-options"
						hidden>
						<label><input type="radio" class="form-check-input"
							name="chobonPastHouseholdRelationType" value="GENERAL" checked>
							일반</label> <label><input type="radio" class="form-check-input"
							name="chobonPastHouseholdRelationType" value="DETAIL"> 상세</label>
					</div>
					<div class="certificate-option-note" hidden>
						<p class="certificate-hint">일반: 세대원/동거인 중심 표기 · 상세: 구체적인 가족관계
							표기</p>
					</div>
				</div>

				<!-- 3. 개인 인적사항 변경 내용 -->
				<div class="certificate-option-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"> <input
							type="checkbox" class="form-check-input" name="chobonPersonalChangeIncluded"
							aria-describedby="certHelpChobonPersonal"> 개인 인적사항 변경 내용
						</label>
						<p class="visually-hidden" id="certHelpChobonPersonal">본인의
							성명이나 주민등록번호가 변경된 기록 중 표시할 범위를 선택하는 항목이에요.</p>
					</div>
					<div class="certificate-option-content certificate-inline-options"
						hidden>
						<label><input type="radio" class="form-check-input"
							name="chobonPersonalChangeScope" value="ALL" checked> 전체</label>
						<label><input type="radio" class="form-check-input"
							name="chobonPersonalChangeScope" value="NAME"> 성명</label> <label><input
							type="radio" class="form-check-input" name="chobonPersonalChangeScope" value="NUMBER">
							주민등록번호</label>
					</div>
				</div>

				<!-- 4. 식별번호 표기 -->
				<div class="certificate-option-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"> <input
							type="checkbox" class="form-check-input" name="chobonIdNumbersIncluded"
							aria-describedby="certHelpChobonIds"> 주민등록번호 뒷자리,
							국내거소신고번호, 외국인등록번호
						</label>
						<p class="visually-hidden" id="certHelpChobonIds">주민등록번호 뒷자리 및
							해당하는 국내거소신고번호·외국인등록번호의 표시 여부를 선택해요. 민감한 번호는 필요한 경우에만 표시하세요.</p>
					</div>
					<div class="certificate-option-content certificate-check-grid"
						hidden>
						<label><input type="checkbox" class="form-check-input" name="chobonRrnBackIncluded"
							checked> 주민등록번호 뒷자리</label> <label><input type="checkbox" class="form-check-input"
							name="chobonForeignNumberIncluded" checked>
							국내거소신고번호/외국인등록번호</label>
					</div>
				</div>

				<!-- 5. 병역사항 -->
				<div class="certificate-option-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"> <input
							type="checkbox" class="form-check-input" name="chobonMilitaryServiceIncluded"
							aria-describedby="certHelpChobonMilitary"> 병역사항
						</label>
						<p class="visually-hidden" id="certHelpChobonMilitary">병역 기록을
							표시할 때 입영·전역일자만 선택할지, 전체 병역사항을 표시할지 정해요.</p>
					</div>
					<div class="certificate-option-content certificate-inline-options"
						hidden>
						<label><input type="radio" class="form-check-input"
							name="chobonMilitaryServiceScope" value="DATES" checked>
							입영/전역일자</label> <label><input type="radio" class="form-check-input"
							name="chobonMilitaryServiceScope" value="ALL"> 전체</label>
					</div>
				</div>

				<!-- 6. 현 세대주 성명과 관계 -->
				<div class="certificate-option-row">
					<div class="certificate-learning-field-heading">
						<label class="certificate-option-title"> <input
							type="checkbox" class="form-check-input" name="chobonHouseholdRelationIncluded"
							aria-describedby="certHelpChobonRelation"> 세대주 성명과 세대주와의
							관계
						</label>
						<p class="visually-hidden" id="certHelpChobonRelation">현재 세대주의
							성명과 본인이 세대주와 어떤 관계인지 보여주는 항목이에요. 상세 선택 시 용도를 입력해요.</p>
					</div>
					<div class="certificate-option-content certificate-inline-options"
						hidden>
						<label><input type="radio" class="form-check-input"
							name="chobonHouseholdRelationType" value="GENERAL" checked>
							일반</label> <label><input type="radio" class="form-check-input"
							name="chobonHouseholdRelationType" value="DETAIL"> 상세</label>
					</div>
					<div class="certificate-option-note" hidden>
						<p class="certificate-hint">일반: 세대원/동거인 중심 표기 · 상세: 구체적인 가족관계
							표기</p>
					</div>
				</div>

				<!-- 일반·상세 중 '상세'를 선택한 경우에만 표시 -->
				<div id="certificateChobonPurposeArea"
					class="certificate-purpose certificate-chobon-purpose" hidden>
					<label class="certificate-label" for="certificateChobonPurpose">용도
						및 목적 <em>(필수)</em>
					</label> <select class="form-select" id="certificateChobonPurpose"
						name="chobonPurpose">
						<option value="">선택해 주세요.</option>
						<option value="ADMIN">행정기관 제출용</option>
						<option value="FINANCE">금융기관(은행 등) 제출용</option>
						<option value="REAL_ESTATE">부동산 업무용</option>
						<option value="COURT">법원 제출용</option>
						<option value="PRIVATE">민간기관 제출용</option>
						<option value="OTHER">기타</option>
					</select>
					<p class="visually-hidden">‘상세’ 관계 표기 시 사용하는 목적을 고르는 항목이에요.
						선택지에 없다면 ‘기타’를 선택하고 목적을 입력하세요.</p>
					<div id="certificateChobonPurposeOtherArea" hidden>
						<label class="certificate-label"
							for="certificateChobonPurposeOther">기타 용도 <em>(필수)</em></label> <input
							id="certificateChobonPurposeOther" name="chobonPurposeDetail"
							type="text" maxlength="100" placeholder="기타 용도를 입력해 주세요.">
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="certificate-panel certificate-receipt"
		aria-labelledby="certReceiptTitle">
		<h3 id="certReceiptTitle">수령 방법</h3>
		<div class="certificate-label">
			구분 <em>(필수)</em>
		</div>
		<div class="sim-learning-tip">
			<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span>
			<div class="sim-learning-tip-content">
				<strong>어떤 방법이 좋을까요?</strong>
				<p>종이 서류가 필요하면 본인출력, 모바일로 보관·제출하려면 전자문서지갑을 먼저 살펴보세요. 실제 사용 가능
					여부는 제출기관에 확인하세요.</p>
			</div>
		</div>
		<div class="certificate-receipt-grid">
			<label><input type="radio" class="form-check-input" name="receiveMethod"
				value="ONLINE_PRINT" checked> 온라인발급(본인출력)</label> <label><input
				type="radio" class="form-check-input" name="receiveMethod" value="ONLINE_E_DOC">
				온라인발급(전자문서지갑)</label> <label><input type="radio" class="form-check-input"
				name="receiveMethod" value="ONLINE_THIRD_PARTY">
				온라인발급(제3자제출) 수신인 등록</label> <label><input type="radio" class="form-check-input"
				name="receiveMethod" value="REGISTERED_MAIL"> 등기보통우편</label> <label><input
				type="radio" class="form-check-input" name="receiveMethod" value="NORMAL_MAIL">
				일반보통우편</label>
		</div>
		<details class="sim-learning-details">
			<summary>수령 방법별 차이 자세히 알아보기</summary>
			<dl class="sim-learning-definition-list">
				<dt>온라인발급(본인출력)</dt>
				<dd>발급된 증명서를 본인이 확인하고 프린터로 출력하는 방식이에요.</dd>
				<dt>온라인발급(전자문서지갑)</dt>
				<dd>전자증명서를 디지털 지갑에서 보관하고 지원 기관에 전자적으로 제출하는 방식이에요.</dd>
				<dt>온라인발급(제3자제출)</dt>
				<dd>서류를 받을 대상을 지정해 제출하는 방식이에요. 실제 서비스에서는 수신인 확인 과정이 필요할 수 있어요.</dd>
				<dt>등기보통우편 / 일반보통우편</dt>
				<dd>우편으로 받는 방법을 뜻해요. 실제 신청에서는 가능 여부·수수료·배송 조건을 별도로 확인해야 해요.</dd>
			</dl>
		</details>
	</section>
</div>
