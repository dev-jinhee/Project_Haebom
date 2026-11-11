<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%-- 주민등록증 재발급 신청 | 단일 단계 JSP fragment --%>
<%-- simulation.jsp의 #stepContent에 삽입. 단계 이동/신청 버튼은 공통 화면에서 관리. --%>

<div class="sim-step-content identity-step1" data-step="1">

	<section class="sim-guide-panel" aria-labelledby="identityGuideTitle">
		<h3 class="sim-guide-title" id="identityGuideTitle">
			<span class="material-symbols-outlined" aria-hidden="true">edit_square</span>시작하기
			전에
		</h3>
		<ul class="sim-guide-list">
			<li>주민등록증 발급·재발급 통보를 신청한 경우, 주민등록증 신청이 접수되거나 읍·면사무소 또는 동 행정복지센터에
				주민등록증이 배송되었을 때 그 사실을 문자로 안내받을 수 있습니다.</li>
			<li>주민등록증 발급 신청 확인서(임시 신분증)는 사진 1장을 지참하여 행정복지센터를 방문해 신청하시기 바랍니다.
				사진을 제출하지 않는 예외가 있을 수 있습니다.</li>
			<li>기존 주민등록증은 새로운 주민등록증 수령 시 반납합니다.</li>
		</ul>

		<h4>모바일 주민등록증 발급 절차 안내</h4>
		<p>모바일 주민등록증은 IC 주민등록증 또는 행정복지센터에서 발급받는 QR을 이용해 발급할 수 있습니다.</p>
		<div class="identity-guide-block">
			<h5>① IC 주민등록증을 이용한 모바일 주민등록증 발급 절차</h5>
			<p>주민등록증 발급·재발급 신청 → IC칩 포함 주민등록증 수령 → 모바일 신분증 앱 설치 → IC칩 태그 및
				본인인증 → 모바일 주민등록증 발급</p>
			<p class="identity-note">IC칩 포함 주민등록증 신청 시 기존 주민등록증 수령 절차와 별도로
				안내되는 사항을 확인해 주세요.</p>
		</div>
		<div class="identity-guide-block">
			<h5>② 발급용 QR을 이용한 모바일 주민등록증 발급 절차</h5>
			<p>가까운 행정복지센터 방문 → 신청서 작성 및 신분 확인 → 모바일 신분증 앱 설치 → 발급용 QR 촬영 및
				본인인증 → 모바일 주민등록증 발급</p>
			<p class="identity-note">휴대전화 교체, 앱 재설치 등으로 재발급이 필요한 경우 별도 절차가
				적용될 수 있습니다.</p>
		</div>
		<p class="identity-guide-footer">※ 자세한 사항은 정부24 및 모바일 신분증 공식 안내를
			참고해 주세요.</p>
		<ul class="sim-guide-list identity-guide-last">
			<li>이 민원은 인증서를 통한 전자서명이 필요할 수 있습니다.</li>
			<li>구비서류 열람 사전동의를 선택하면 민원처리기관에서 행정정보 공동이용으로 확인할 수 있는 서류는 별도로
				제출하지 않아도 됩니다.</li>
		</ul>
	</section>

	<!-- 해봄 시뮬레이션 안내 -->
	<aside class="sim-notice-panel"
		aria-labelledby="identitySimulationTitle">

		<h3 id="identitySimulationTitle">
			<span class="material-symbols-outlined" aria-hidden="true">school</span>
			해봄 시뮬레이션 안내
		</h3>

		<ul>
			<li><spring:message code="simulation.notice" /></li>
			<li><spring:message code="simulation.identity.notice" /></li>
			<li><spring:message code="simulation.privacy" /></li>
			<li><spring:message code="simulation.history" /></li>
			<li><spring:message code="simulation.history.inprogress" /></li>
			<li><strong> <spring:message
						code="simulation.identity.result" />
			</strong></li>
		</ul>
	</aside>


	<%-- 해봄 학습 안내: 필요한 경우에만 펼치는 기초 설명 --%>
	<details class="sim-learning-quick-guide">
		<summary>
			<span class="material-symbols-outlined" aria-hidden="true">help_outline</span>
			주민등록증 재발급, 무엇부터 알아야 하나요? <span class="sim-learning-quick-guide-hint">눌러서
				알아보기</span>
		</summary>
		<div class="sim-learning-quick-guide-body">
			<dl class="sim-learning-quick-guide-list">
				<div>
					<dt>대상</dt>
					<dd>주민등록증을 분실하거나 훼손했거나, 성명 등 기재사항이 바뀌어 다시 발급받아야 할 때 신청해요.</dd>
				</div>
				<div>
					<dt>IC 포함</dt>
					<dd>IC칩이 들어 있는 실물 주민등록증이에요. 카드를 휴대전화에 태그하여 모바일 주민등록증을 발급받는 데
						사용할 수 있어요.</dd>
				</div>
				<div>
					<dt>IC 미포함</dt>
					<dd>일반 실물 주민등록증이에요. IC칩이 없어도 주민센터에서 QR 방식으로 모바일 주민등록증을 신청할 수
						있어요.</dd>
				</div>
				<div>
					<dt>수수료</dt>
					<dd>정부24 안내 기준 일반 5,000원, IC칩 포함 10,000원이에요. 재발급 사유와 면제 대상에 따라
						달라질 수 있어요.</dd>
				</div>
				<div>
					<dt>기간</dt>
					<dd>정부24 안내상 처리기간은 총 14일이에요. 수령기관과 실제 일정은 신청 시 확인해 주세요.</dd>
				</div>
			</dl>
			<p class="sim-learning-quick-guide-tip">해봄은 실제 민원을 접수하지 않는 학습용
				체험이에요. 선택 결과가 주민등록증 발급으로 이어지지 않아요.</p>
			<p class="sim-learning-source">
				출처: <a
					href="https://plus.gov.kr/search/searchdtl?srvcId=13100000018&amp;typeSn=01"
					target="_blank" rel="noopener noreferrer">정부24 주민등록증 재발급 민원안내</a>
			</p>
		</div>
	</details>
	<section class="gov24-form-panel identity-applicant-panel"
		aria-labelledby="identityApplicantTitle">
		<h3 id="identityApplicantTitle">신청인 정보</h3>
		<div class="identity-field">
			<label for="identityApplicantName">성명</label> <input type="text"
				id="identityApplicantName" name="applicantName" class="form-control"
				readonly autocomplete="off" />
		</div>
		<div class="identity-field">
			<label for="identityResidentNoFront">주민등록번호</label>
			<div class="identity-resident-row">
				<input type="text" id="identityResidentNoFront"
					name="residentNoFront" class="form-control" readonly maxlength="6"
					aria-label="주민등록번호 앞자리" autocomplete="off" /> <span
					aria-hidden="true">-</span> <input type="text"
					id="identityResidentNoBack" name="residentNoBack"
					class="form-control" readonly maxlength="7" aria-label="주민등록번호 뒷자리"
					autocomplete="off" />
			</div>
		</div>
		<div class="identity-field">
			<label for="identityPhoneFirst">휴대전화번호 <span
				class="identity-required">(필수)</span></label>
			<p class="sim-learning-field-note">신청 과정의 연락이나 수령 안내를 받을 수 있는 번호를
				입력하는 항목이에요. 해봄에서는 실제 문자를 발송하지 않아요.</p>
			<div class="identity-phone-row">
				<input type="tel" id="identityPhoneFirst" name="phoneFirst"
					class="form-control" maxlength="3" value="010" inputmode="numeric"
					aria-label="휴대전화번호 앞자리" /> <span aria-hidden="true">-</span> <input
					type="tel" id="identityPhoneMiddle" name="phoneMiddle"
					class="form-control" placeholder="0000" maxlength="4"
					inputmode="numeric" aria-label="휴대전화번호 가운데 자리" /> <span
					aria-hidden="true">-</span> <input type="tel"
					id="identityPhoneLast" name="phoneLast" class="form-control"
					placeholder="0000" maxlength="4" inputmode="numeric"
					aria-label="휴대전화번호 뒷자리" />
			</div>
		</div>
		<div class="identity-field">
			<span class="identity-field-label">주소 <span
				class="identity-required">(필수)</span></span>
			<div class="identity-address-row">
				<label class="visually-hidden" for="identitySido">시도 선택</label> <select
					id="identitySido" name="sido" class="form-select">
					<option value="">시도 선택</option>
				</select> <label class="visually-hidden" for="identitySigungu">시군구 선택</label>
				<select id="identitySigungu" name="sigungu" class="form-select"
					disabled>
					<option value="">시군구 선택</option>
				</select>
			</div>
			<p id="addressStatus" class="text-muted small mt-2 mb-0"
				role="status" aria-live="polite">주소를 선택해 주세요.</p>
			<p class="sim-learning-field-note">주민등록이 되어 있는 시·도와 시·군·구를 선택해
				보세요. 이 체험의 주소 선택은 실제 주민등록 주소를 변경하지 않아요.</p>
		</div>
	</section>

	<section class="gov24-form-panel identity-request-panel"
		aria-labelledby="identityRequestTitle">
		<h3 id="identityRequestTitle">신청 내용</h3>
		<fieldset class="identity-field">
			<legend>
				발급 형태 <span class="identity-required">(필수)</span>
			</legend>
			<div class="identity-radio-grid identity-radio-grid-two">
				<label><input type="radio" name="icChipIncluded" value="Y" />
					집적회로(IC) 칩 포함</label> <label><input type="radio"
					name="icChipIncluded" value="N" /> 집적회로(IC) 칩 미포함</label>
			</div>
			<div class="sim-learning-tip">
				<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span>
				<div class="sim-learning-tip-content">
					<strong>알아두면 좋아요</strong>
					<p>
						모바일 주민등록증을 IC카드 태그로 발급받고 싶다면 <strong>IC칩 포함</strong>을 선택해요. 실물
						주민등록증만 필요하다면 IC칩 미포함을 고를 수 있어요. QR 발급은 별도 주민센터 방문 절차예요.
					</p>
				</div>
			</div>
			<div class="identity-info-box">
				<h4>집적회로(IC) 칩 발급 확인사항</h4>
				<ul>
					<li>IC칩이 내장된 주민등록증을 발급받으면 모바일 신분증 앱을 통해 모바일 주민등록증 발급 또는 재발급을
						신청할 수 있습니다.</li>
					<li>IC칩 내장 주민등록증 발급 시 추가 수수료가 부과될 수 있습니다.</li>
					<li>지방자치단체가 정한 조건에 따라 추가 수수료가 면제될 수 있습니다.</li>
					<li>IC칩 결함 발생 시 안내된 절차에 따라 재발급을 신청할 수 있습니다.</li>
				</ul>
			</div>
		</fieldset>

		<fieldset class="identity-field">
			<legend>
				재발급 사유 <span class="identity-required">(필수)</span>
			</legend>
			<div class="identity-radio-grid identity-radio-grid-reasons">
				<label><input type="radio" name="reissueReason" value="LOST" />
					분실</label> <label><input type="radio" name="reissueReason"
					value="DAMAGE" /> 훼손</label> <label><input type="radio"
					name="reissueReason" value="NAME_CHANGE" /> 성명 변경</label> <label><input
					type="radio" name="reissueReason" value="RRN_CHANGE" /> 주민등록번호 변경</label>
				<label><input type="radio" name="reissueReason"
					value="ADDRESS_INSUFFICIENT" /> 주소 변경 칸 부족</label> <label><input
					type="radio" name="reissueReason" value="PHOTO_CHANGE" /> 용모(사진)변경</label>
				<label><input type="radio" name="reissueReason"
					value="FINGERPRINT" /> 지문 재등록</label> <label><input type="radio"
					name="reissueReason" value="NOT_COLLECTED" /> 미수령으로 회수·파기</label> <label><input
					type="radio" name="reissueReason" value="LOST_NATIONALITY" /> 주민등록
					말소자의 귀국</label> <label><input type="radio" name="reissueReason"
					value="REACQUIRED_NATIONALITY" /> 재외국민 주민등록</label> <label
					id="identityOtherReasonOption" hidden><input type="radio"
					name="reissueReason" value="OTHER" disabled /> 그 밖의 사유</label>
			</div>
			<details class="sim-learning-details">
				<summary>재발급 사유가 헷갈린다면? (예시 보기)</summary>
				<dl class="sim-learning-definition-list">
					<dt>분실 / 훼손</dt>
					<dd>주민등록증을 잃어버렸다면 분실, 가지고 있지만 손상되었다면 훼손을 선택해요. 분실 신고는 재발급 신청과
						구분되는 절차예요.</dd>
					<dt>성명·주민등록번호 변경</dt>
					<dd>법적 정보가 변경되어 주민등록증 기재사항을 새로 반영해야 하는 경우예요. 관련 정보 정정 절차가 먼저
						필요할 수 있어요.</dd>
					<dt>주소 변경 칸 부족</dt>
					<dd>주민등록증 뒷면에 주소 변경을 기록할 공간이 부족한 상황을 말해요. 단순히 이사했다는 이유만으로 선택하는
						항목은 아니에요.</dd>
					<dt>지문 재등록 / 용모 변경</dt>
					<dd>신원 확인을 위한 지문 정보를 다시 등록해야 하거나 사진과 현재 모습이 달라 본인 확인이 어려운 경우를
						뜻해요.</dd>
				</dl>
			</details>
			<div class="identity-info-box">
				<h4>재발급 시 확인사항</h4>
				<ul>
					<li>성명 변경 또는 주민등록번호 변경의 사유로 신청하는 경우 관련 회원정보를 먼저 수정해야 할 수 있습니다.</li>
					<li>일부 재발급 사유는 행정복지센터 방문 접수가 필요할 수 있습니다.</li>
					<li>수수료가 부과되지 않는 사유로 신청한 경우 기존 주민등록증 반납 등 조건을 확인해 주세요.</li>
					<li>지문 재등록 사유로 신청한 경우 지정한 수령기관에 방문하여 지문을 재등록해야 할 수 있습니다.</li>
				</ul>
			</div>
		</fieldset>

		<fieldset class="identity-field">
			<legend>
				수수료 면제 신청 <span class="identity-required">(필수)</span>
			</legend>
			<div class="identity-radio-grid identity-radio-grid-two">
				<label><input type="radio" name="feeExemption" value="Y" />
					신청</label> <label><input type="radio" name="feeExemption" value="N" />
					미신청</label>
			</div>
			<div class="sim-learning-tip">
				<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span>
				<div class="sim-learning-tip-content">
					<strong>수수료 면제 신청이란?</strong>
					<p>
						면제 대상에 해당한다고 생각하는 경우 신청하는 항목이에요. <strong>‘신청’을 선택했다고 자동
							면제되는 것은 아니며</strong>, 실제 면제 여부는 사유와 증빙자료 등을 기준으로 확인해요.
					</p>
				</div>
			</div>
			<div class="identity-info-box">
				<h4>수수료 면제 확인사항</h4>
				<ul>
					<li>수수료 면제 대상 여부는 관련 법령과 신청 사유에 따라 결정됩니다.</li>
					<li>기존 신청인과 다른 경우 등에는 추가 확인 절차가 필요할 수 있습니다.</li>
					<li>집적회로(IC) 칩 포함으로 신청한 경우 추가 수수료가 면제되지 않을 수 있습니다.</li>
				</ul>
			</div>
		</fieldset>

		<fieldset class="identity-field">
			<legend>
				주민등록증 수령 안내 서비스 <span class="identity-required">(필수)</span>
			</legend>
			<div class="identity-radio-grid identity-radio-grid-two">
				<label><input type="radio" name="pickupNotice" value="Y" />
					신청</label> <label><input type="radio" name="pickupNotice" value="N" />
					미신청</label>
			</div>
			<p class="sim-learning-field-note">신청 접수나 주민등록증 도착 여부 등을 문자로
				안내받을지 선택하는 서비스예요. 해봄에서는 문자가 실제로 발송되지 않아요.</p>
		</fieldset>

		<fieldset class="identity-field">
			<legend>
				점자 스티커 제공 서비스 <span class="identity-required">(필수)</span>
			</legend>
			<div class="identity-radio-grid identity-radio-grid-two">
				<label><input type="radio" name="brailleSticker" value="Y" />
					신청</label> <label><input type="radio" name="brailleSticker"
					value="N" /> 미신청</label>
			</div>
			<p class="identity-note">시각장애인 등 해당 대상자가 주민등록증을 구분할 수 있도록 도와주는
				스티커예요. 실제 제공 여부는 대상 요건에 따라 결정돼요.</p>
		</fieldset>

		<div class="identity-field">
			<h4>유의사항</h4>
			<ul class="identity-notice-list">
				<li>주민등록증 재발급 신청 철회(취소)는 정해진 시간 및 절차에 따라 가능할 수 있습니다.</li>
				<li>재발급된 주민등록증은 수령 장소에서 정해진 보관 기간 내에 찾아가야 합니다.</li>
				<li>관계 공무원이 제출된 사진과 기존 사진을 비교하여 확인할 수 있으며, 확인이 어려운 경우 추가 확인을
					요청할 수 있습니다.</li>
			</ul>
		</div>
		<div class="identity-field">
			<label class="identity-checkbox-label" for="identityNoticeConfirmed">
				<input type="checkbox" id="identityNoticeConfirmed"
				name="noticeConfirmed" value="Y" /> 유의사항을 모두 확인했습니다. <span
				class="identity-required">(필수)</span>
			</label>
		</div>
	</section>

	<section class="gov24-form-panel identity-pickup-panel"
		aria-labelledby="identityPickupTitle">
		<h3 id="identityPickupTitle">수령 방법</h3>
		<div class="identity-field">
			<span class="identity-field-label">구분</span> <label><input
				type="radio" name="pickupMethod" value="VISIT" checked /> 방문수령</label>
			<p class="sim-learning-field-note">해봄에서는 방문수령만 연습해요. 실제 신청에서는 신청
				조건에 따라 등기우편 수령을 선택할 수도 있어요.</p>
		</div>
		<div class="identity-field">
			<label for="identityPickupOffice">수령기관</label>
			<div class="identity-office-row">
				<input type="text" id="identityPickupOffice" name="pickupOfficeName"
					class="form-control" readonly />
				<button type="button" id="identitySearchOfficeBtn"
					class="btn btn-outline-primary" aria-haspopup="dialog"
					aria-controls="identityOfficeDialog">검색</button>
			</div>
			<p class="sim-learning-field-note">수령기관은 재발급된 실물 주민등록증을 찾으러 갈
				장소예요. ‘검색’을 눌러 체험용 기관을 선택해 보세요. 실제 수령 가능 기관은 신청 시 확인해야 해요.</p>
			<input type="hidden" id="identityPickupOfficeCode"
				name="pickupOfficeCode" />
		</div>
	</section>

	<section class="gov24-form-panel identity-documents-panel"
		aria-labelledby="identityDocumentsTitle">
		<h3 id="identityDocumentsTitle">구비서류</h3>
		<div class="identity-field">
			<label for="identityPhotoInput">증명사진 1장</label>
			<div class="identity-file-guide">
				<p>파일 첨부 안내</p>
				<ul>
					<li>JPG, JPEG, PNG 형식의 사진을 첨부해 주세요.</li>
					<li>최근 6개월 이내 촬영한 3.5 × 4.5cm 규격의 정면 사진을 사용해 주세요.</li>
					<li>첨부한 사진의 파일 형식, 용량 및 해상도를 확인합니다.</li>
					<li>검사 결과는 참고용이며, 실제 행정기관의 심사 결과와 다를 수 있습니다.</li>
				</ul>
			</div>
			<p class="sim-learning-field-note">사진을 고르면 미리보기와 형식 검사 결과를 확인할 수
				있어요. 이 검사는 학습용이며 실제 주민등록증 사진 심사를 대신하지 않아요.</p>
			<input type="file" id="identityPhotoInput" name="idPhoto"
				accept=".jpg,.jpeg,.png,image/jpeg,image/png" class="form-control"
				aria-describedby="identityPhotoHint" />
			<p id="identityPhotoHint" class="identity-note">사진은 1장만 선택할 수
				있습니다. 실제 업로드는 신청 단계의 공통 로직에서 처리합니다.</p>
			<div class="identity-photo-confirmations" aria-label="증명사진 촬영 조건 확인">
				<label for="identityPhotoRecentConfirmed"> <input
					type="checkbox" id="identityPhotoRecentConfirmed" /> 최근 6개월 이내 촬영한
					사진임을 확인했습니다.
				</label> <label for="identityPhotoAppearanceConfirmed"> <input
					type="checkbox" class="form-check" id="identityPhotoAppearanceConfirmed" /> 모자 등을 쓰지
					않은 정면 상반신 사진임을 확인했습니다.
				</label>
			</div>
			<div id="identityPhotoPreview" class="identity-photo-preview"
				aria-live="polite"></div>
		</div>
	</section>

	<section class="gov24-form-panel identity-consent-panel"
		aria-labelledby="identityConsentTitle">
		<h3 id="identityConsentTitle">구비서류 열람 사전동의</h3>
		<div class="identity-field">
			<span class="identity-field-label">사전동의 <span
				class="identity-required">(필수)</span></span>
			<p>민원처리기관에서 행정정보 공동이용을 통해 확인할 수 있으므로 별도로 제출하지 않아도 됩니다.</p>
			<div class="sim-learning-tip">
				<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span>
				<div class="sim-learning-tip-content">
					<strong>행정정보 공동이용이란?</strong>
					<p>담당 공무원이 신청인의 동의를 받아 필요한 증명 정보를 행정기관 사이에서 확인하는 방식이에요. 실제 신청에서
						동의하지 않으면 관련 서류를 직접 제출해야 할 수 있어요. 해봄에서는 실제 개인정보를 조회하지 않아요.</p>
				</div>
			</div>
			<label class="identity-checkbox-label" for="identityConsentAll">
				<input type="checkbox" id="identityConsentAll" name="consentAll" />
				전체선택
			</label>
			<div class="identity-consent-items">
				<label><input type="checkbox" name="documentConsent"
					value="BASIC_LIVELIHOOD" /> 국민기초생활수급자증명서</label> <label><input
					type="checkbox" name="documentConsent" value="PATRIOT_FAMILY" />
					국가유공자(유족)·5·18민주유공자(유족)확인서</label> <label><input type="checkbox"
					name="documentConsent" value="SINGLE_PARENT" /> 한부모가족증명서</label>
			</div>
			<p class="identity-consent-text">본인은 이 신청에 따른 업무처리와 관련하여 담당 공무원이
				행정정보 공동이용을 통해 위의 확인 사항을 확인하는 것에 동의합니다.</p>
			<p class="identity-note">※ 이 페이지는 행정절차 체험용 시뮬레이션 화면입니다.</p>
		</div>
	</section>
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

	<%-- 관할 수령기관 검색: 데이터는 SGIS 사용 --%>
	<dialog id="identityOfficeDialog" class="identity-office-dialog"
		aria-labelledby="identityOfficeDialogTitle">
	<div class="identity-dialog-header">
		<h3 id="identityOfficeDialogTitle">관할 처리기관 검색</h3>
		<button type="button" id="identityOfficeCloseBtn" class="btn-close"
			aria-label="닫기"></button>
	</div>
	<p class="identity-note">선택한 시·군·구의 SGIS 행정구역 정보를 기반으로 체험용 수령기관 목록을
		제공합니다. 실제 기관명 및 수령 가능 여부와 다를 수 있으므로 실제 신청 시 정부24에서 확인해 주세요.</p>
	<div class="identity-office-search-row">
		<label class="visually-hidden" for="identityOfficeKeyword">기관명
			또는 지역 검색</label> <input type="search" id="identityOfficeKeyword"
			class="form-control" placeholder="기관명 또는 지역 검색" />
		<button type="button" id="identityOfficeSearchBtn"
			class="btn btn-outline-primary">검색</button>
	</div>
	<input type="hidden" id="identityPickupOfficeCode" />
	<div class="identity-office-table-wrap">
		<table class="table identity-office-table">
			<thead>
				<tr>
					<th scope="col">전체 행정구역</th>
					<th scope="col">읍·면·동</th>
					<th scope="col">선택</th>
				</tr>
			</thead>
			<tbody id="identityOfficeResults"></tbody>
		</table>
	</div>
	<p id="identityOfficeResultStatus" class="identity-note" role="status"
		aria-live="polite"></p>
	</dialog>

</div>
