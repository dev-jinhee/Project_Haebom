<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%-- simulation.jsp가 삽입하는 STEP 1 fragment: 공통 이전/완료 버튼은 중복 생성하지 않습니다. --%>
<div class="sim-step-content certificate-step1" data-step="1">
  <header class="certificate-heading">
    <h2>주민등록표 등본(초본) 발급</h2>
    <p>신청할 서비스를 선택하세요.</p>
  </header>

  <section class="certificate-panel certificate-types" aria-label="발급 서비스 선택">
    <label class="certificate-type-option"><input type="radio" name="certificateType" value="DEUNGBON" checked><span>주민등록표 등본 발급</span></label>
    <label class="certificate-type-option"><input type="radio" name="certificateType" value="CHOBON"><span>주민등록표 초본 발급</span></label>
    <label class="certificate-type-option is-disabled"><input type="radio" name="certificateType" value="DEUNGBON_EN" disabled><span>주민등록표 등본(영문) 발급 <small>체험 미지원</small></span></label>
    <label class="certificate-type-option is-disabled"><input type="radio" name="certificateType" value="CHOBON_EN" disabled><span>주민등록표 초본(영문) 발급 <small>체험 미지원</small></span></label>
  </section>

  <%-- 정부24 화면 참고: 발급 안내. 실제 정부24 공지 변경 시 내용 점검 필요. --%>
  <section class="sim-guide-panel" aria-labelledby="certGuideTitle">
    <h3 class="sim-guide-title" id="certGuideTitle">
      <span class="material-symbols-outlined" aria-hidden="true">fact_check</span>
      시작하기 전에
    </h3>
    <ul class="sim-guide-list">
      <li>10월 29일부터 등·초본 발급 시 <strong>세대주와의 관계 표기방식이 변경</strong>(예: 자녀 X, 세대원 O)되는 점 유의해 주세요.<br>상세로 선택하시면 기존 표기방식으로 발급(예: 자녀) 가능합니다.</li>
      <li>2026년 10월 29일부터 등·초본 발급 전, 제출기관에 필요한 발급 형태(<strong>일반 또는 상세</strong>)를 꼭 확인하세요!</li>
      <li>“일반”으로 선택한 경우 세대주의 배우자 외 가족(부모, 조부모, 자녀, 배우자의 자녀 등)은 “세대원”, 그 외에는 “동거인”으로 표기됩니다.</li>
      <li>“상세”로 선택한 경우 기존 표기법(자녀, 배우자의 자녀, 삼촌 등)대로 구체적인 관계가 표기되며, “용도 및 목적” 작성이 필요합니다.</li>
    </ul>
    <ul class="sim-guide-list sim-guide-last">
      <li>이 민원은 <strong>인증서를 통한 전자서명</strong>이 필요합니다.</li>
      <li>이 민원은 <strong>전자증명서</strong>로 수령 가능합니다.</li>
    </ul>
  </section>

  <%-- 기존 해봄 공통 .sim-notice-panel 스타일 재사용. --%>
  <aside class="sim-notice-panel" aria-labelledby="certificateSimulationTitle">
    <h3 id="certificateSimulationTitle">
      <span class="material-symbols-outlined" aria-hidden="true">school</span>
      해봄 시뮬레이션 안내
    </h3>
    <ul>
      <li><spring:message code="simulation.notice" /></li>
      <li><spring:message code="simulation.residentRecord.notice" /></li>
      <li><spring:message code="simulation.privacy" /></li>
      <li><spring:message code="simulation.history" /></li>
      <li><spring:message code="simulation.history.inprogress" /></li>
      <li><strong><spring:message code="simulation.residentRecord.result" /></strong></li>
    </ul>
  </aside>

  <section class="certificate-panel certificate-form" aria-labelledby="certFormTitle">
    <h3 id="certFormTitle">신청 내용</h3>
    <div class="certificate-field">
      <label class="certificate-label" for="certificateSido">주민등록상 주소 확인 <em>(필수)</em></label>
      <div class="certificate-address-row">
        <select id="certificateSido" name="residentSidoCode"><option value="">시·도 선택</option></select>
        <select id="certificateSigungu" name="residentSigunguCode" disabled><option value="">시·군·구 선택</option></select>
      </div>
      <p id="certificateAddressStatus" class="certificate-hint" aria-live="polite">주민등록상 주소를 선택해 주세요.</p>
    </div>

    <div class="certificate-field certificate-issue-mode">
      <div class="certificate-label">발급형태 선택 <em>(필수)</em></div>
      <div class="certificate-inline-options certificate-issue-radios">
        <label><input type="radio" name="issueMode" value="ALL" checked> 전체 발급</label>
        <label><input type="radio" name="issueMode" value="SELECT"> 선택 발급</label>
      </div>
      <p id="certificateIssueHint" class="certificate-hint">과거주소 변동사항을 제외한 모든 정보가 표시됩니다.</p>
    </div>

    <%-- 전체 발급: 아래 전체 숨김. 선택 발급: 항목 체크박스만 먼저 노출. --%>
    <div id="certificateSelectiveOptions" hidden>
      <div id="certificateDeungbonFields">
        <div class="certificate-option-row">
          <label class="certificate-option-title"><input type="checkbox" name="deungbonPastAddressIncluded"> 과거의 주소 변동사항</label>
          <div class="certificate-option-content certificate-past-address" hidden>
            <label><input type="radio" name="deungbonPastAddressScope" value="ALL" checked> 과거 주소 전체</label>
            <label><input type="radio" name="deungbonPastAddressScope" value="RECENT"> 직접입력: 최근</label>
            <span class="certificate-years-wrap"><input type="number" name="deungbonPastAddressYears" min="1" max="99" step="1" value="1" class="certificate-year-input" aria-label="최근 연도"> 년</span>
          </div>
        </div>
        <div class="certificate-option-row">
          <label class="certificate-option-title"><input type="checkbox" name="deungbonHouseholdCompositionIncluded"> 세대 구성 정보</label>
          <div class="certificate-option-content certificate-check-grid" hidden>
            <label><input type="checkbox" name="deungbonHouseholdCompositionReasonIncluded" checked> 세대 구성 사유</label>
            <label><input type="checkbox" name="deungbonHouseholdCompositionDateIncluded" checked> 세대 구성 일자</label>
            <label><input type="checkbox" name="deungbonChangeReasonIncluded" checked> 변동 사유</label>
          </div>
        </div>
        <div class="certificate-option-row">
          <label class="certificate-option-title"><input type="checkbox" name="deungbonHouseholdMemberIncluded"> 세대 구성원 정보</label>
          <div class="certificate-option-content certificate-check-grid" hidden>
            <label><input type="checkbox" name="deungbonHouseholdMemberNameIncluded" checked> 동거인</label>
            <label><input type="checkbox" name="deungbonHouseholdMemberChangeReasonIncluded" checked> 변동 사유</label>
            <label><input type="checkbox" name="deungbonHouseholdMemberReportDateIncluded" checked> 발생일/신고일</label>
            <label class="certificate-long-checkbox"><input type="checkbox" name="deungbonHouseholdMemberOtherNamesIncluded" checked> 교부대상자 외 세대주·세대원·외국인 등의 이름</label>
          </div>
        </div>
        <div class="certificate-option-row certificate-member-row">
          <label class="certificate-option-title"><input type="checkbox" name="deungbonRrnBackIncluded"> 주민등록번호 뒷자리</label>
          <div class="certificate-option-content certificate-inline-options" hidden>
            <label><input type="radio" name="deungbonRrnBackScope" value="HOUSEHOLD_ALL" checked> 세대전부</label>
            <label><input type="radio" name="deungbonRrnBackScope" value="HOUSEHOLD_PART"> 세대일부</label>
            <button type="button" id="certificateLookupMembers" class="certificate-lookup-button" hidden>세대원 조회</button>
          </div>
          <div id="certificateMemberLookupArea" class="certificate-member-table-area" hidden>
            <p class="certificate-hint">신청인을 제외한 가족 정보는 교육용 가상 데이터입니다. 표시 대상을 선택해 주세요.</p>
            <table class="certificate-member-table">
              <thead><tr><th scope="col">선택</th><th scope="col">성명(관계)</th><th scope="col">생년월일</th></tr></thead>
              <tbody>
                <tr><td><input type="checkbox" name="certificateSelectedMember" value="SELF" aria-label="신청인 선택"></td><td><span id="certificateApplicantName">신청인</span> (본인)</td><td id="certificateApplicantBirth">-</td></tr>
                <tr><td><input type="checkbox" name="certificateSelectedMember" value="SPOUSE" aria-label="가상 배우자 선택"></td><td>이오티 (배우자)</td><td>1989년 04월 12일</td></tr>
                <tr><td><input type="checkbox" name="certificateSelectedMember" value="CHILD" aria-label="가상 자녀 선택"></td><td>이엑사 (자녀)</td><td>2016년 09월 08일</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="certificate-option-row certificate-relation-row">
          <label class="certificate-option-title"><input type="checkbox" name="deungbonRelationshipIncluded"> 세대원의 세대주와의 관계</label>
          <div class="certificate-option-content certificate-inline-options" hidden>
            <label><input type="radio" name="deungbonRelationshipType" value="GENERAL" checked> 일반</label>
            <label><input type="radio" name="deungbonRelationshipType" value="DETAIL"> 상세</label>
          </div>
          <div class="certificate-option-note" hidden>
            <p class="certificate-hint">일반: 세대원/동거인 표시 · 상세: 구체적인 가족관계 표시</p>
            <div id="certificatePurposeArea" class="certificate-purpose" hidden>
              <label class="certificate-label" for="certificatePurpose">용도 및 목적 <em>(필수)</em></label>
              <select id="certificatePurpose" name="deungbonPurpose">
                <option value="">선택해 주세요.</option>
                <option value="ADMIN">행정기관 제출용</option>
                <option value="FINANCE">금융기관(은행 등) 제출용</option>
                <option value="REAL_ESTATE">부동산 업무용</option>
                <option value="COURT">법원 제출용</option>
                <option value="PRIVATE">민간기관 제출용</option>
                <option value="OTHER">기타</option>
              </select>
              <div id="certificatePurposeOtherArea" hidden><label class="certificate-label" for="certificatePurposeOther">기타 용도 <em>(필수)</em></label><input id="certificatePurposeOther" name="deungbonPurposeDetail" maxlength="100" type="text" placeholder="용도를 입력해 주세요."></div>
            </div>
          </div>
        </div>
      </div>

      <%-- 초본 선택 발급: 정부24 화면 참고 (국문) --%>
      <div id="certificateChobonFields" hidden>
        <!-- 1. 과거의 주소 변동사항 -->
        <div class="certificate-option-row">
          <label class="certificate-option-title">
            <input type="checkbox" name="chobonPastAddressIncluded"> 과거의 주소 변동사항
          </label>
          <div class="certificate-option-content certificate-past-address" hidden>
            <label><input type="radio" name="chobonPastAddressScope" value="ALL" checked> 전체 포함</label>
            <div class="certificate-recent-group">
              <label><input type="radio" name="chobonPastAddressScope" value="RECENT"> 직접입력: 최근</label>
              <span class="certificate-years-wrap">
                <input type="number" name="chobonPastAddressYears" min="1" max="99" step="1" value="1"
                       class="certificate-year-input" aria-label="초본 과거 주소 조회 연수"> 년
              </span>
            </div>
          </div>
          <div class="certificate-option-note certificate-chobon-past-extras" hidden>
            <label><input type="checkbox" name="chobonPastAddressReportDateIncluded" checked> 발생일/신고일</label>
            <label><input type="checkbox" name="chobonPastAddressChangeReasonIncluded" checked> 변동사유</label>
          </div>
        </div>

        <!-- 2. 과거 주소 변동사항 중 세대주와의 관계 -->
        <div class="certificate-option-row">
          <label class="certificate-option-title">
            <input type="checkbox" name="chobonPastHouseholdRelationIncluded">
            과거의 주소 변동사항 중 세대주 성명과 세대주의 관계
          </label>
          <div class="certificate-option-content certificate-inline-options" hidden>
            <label><input type="radio" name="chobonPastHouseholdRelationType" value="GENERAL" checked> 일반</label>
            <label><input type="radio" name="chobonPastHouseholdRelationType" value="DETAIL"> 상세</label>
          </div>
          <div class="certificate-option-note" hidden>
            <p class="certificate-hint">일반: 세대원/동거인 중심 표기 · 상세: 구체적인 가족관계 표기</p>
          </div>
        </div>

        <!-- 3. 개인 인적사항 변경 내용 -->
        <div class="certificate-option-row">
          <label class="certificate-option-title">
            <input type="checkbox" name="chobonPersonalChangeIncluded"> 개인 인적사항 변경 내용
          </label>
          <div class="certificate-option-content certificate-inline-options" hidden>
            <label><input type="radio" name="chobonPersonalChangeScope" value="ALL" checked> 전체</label>
            <label><input type="radio" name="chobonPersonalChangeScope" value="NAME"> 성명</label>
            <label><input type="radio" name="chobonPersonalChangeScope" value="NUMBER"> 주민등록번호</label>
          </div>
        </div>

        <!-- 4. 식별번호 표기 -->
        <div class="certificate-option-row">
          <label class="certificate-option-title">
            <input type="checkbox" name="chobonIdNumbersIncluded">
            주민등록번호 뒷자리, 국내거소신고번호, 외국인등록번호
          </label>
          <div class="certificate-option-content certificate-check-grid" hidden>
            <label><input type="checkbox" name="chobonRrnBackIncluded" checked> 주민등록번호 뒷자리</label>
            <label><input type="checkbox" name="chobonForeignNumberIncluded" checked> 국내거소신고번호/외국인등록번호</label>
          </div>
        </div>

        <!-- 5. 병역사항 -->
        <div class="certificate-option-row">
          <label class="certificate-option-title">
            <input type="checkbox" name="chobonMilitaryServiceIncluded"> 병역사항
          </label>
          <div class="certificate-option-content certificate-inline-options" hidden>
            <label><input type="radio" name="chobonMilitaryServiceScope" value="DATES" checked> 입영/전역일자</label>
            <label><input type="radio" name="chobonMilitaryServiceScope" value="ALL"> 전체</label>
          </div>
        </div>

        <!-- 6. 현 세대주 성명과 관계 -->
        <div class="certificate-option-row">
          <label class="certificate-option-title">
            <input type="checkbox" name="chobonHouseholdRelationIncluded"> 세대주 성명과 세대주와의 관계
          </label>
          <div class="certificate-option-content certificate-inline-options" hidden>
            <label><input type="radio" name="chobonHouseholdRelationType" value="GENERAL" checked> 일반</label>
            <label><input type="radio" name="chobonHouseholdRelationType" value="DETAIL"> 상세</label>
          </div>
          <div class="certificate-option-note" hidden>
            <p class="certificate-hint">일반: 세대원/동거인 중심 표기 · 상세: 구체적인 가족관계 표기</p>
          </div>
        </div>

        <!-- 일반·상세 중 '상세'를 선택한 경우에만 표시 -->
        <div id="certificateChobonPurposeArea" class="certificate-purpose certificate-chobon-purpose" hidden>
          <label class="certificate-label" for="certificateChobonPurpose">용도 및 목적 <em>(필수)</em></label>
          <select id="certificateChobonPurpose" name="chobonPurpose">
            <option value="">선택해 주세요.</option>
            <option value="ADMIN">행정기관 제출용</option>
            <option value="FINANCE">금융기관(은행 등) 제출용</option>
            <option value="REAL_ESTATE">부동산 업무용</option>
            <option value="COURT">법원 제출용</option>
            <option value="PRIVATE">민간기관 제출용</option>
            <option value="OTHER">기타</option>
          </select>
          <div id="certificateChobonPurposeOtherArea" hidden>
            <label class="certificate-label" for="certificateChobonPurposeOther">기타 용도 <em>(필수)</em></label>
            <input id="certificateChobonPurposeOther" name="chobonPurposeDetail" type="text"
                   maxlength="100" placeholder="기타 용도를 입력해 주세요.">
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="certificate-panel certificate-receipt" aria-labelledby="certReceiptTitle">
    <h3 id="certReceiptTitle">수령 방법</h3>
    <div class="certificate-label">구분 <em>(필수)</em></div>
    <div class="certificate-receipt-grid">
      <label><input type="radio" name="receiveMethod" value="ONLINE_PRINT"> 온라인발급(본인출력)</label>
      <label><input type="radio" name="receiveMethod" value="ONLINE_E_DOC"> 온라인발급(전자문서지갑)</label>
      <label><input type="radio" name="receiveMethod" value="ONLINE_THIRD_PARTY" checked> 온라인발급(제3자제출) 수신인 등록</label>
      <label><input type="radio" name="receiveMethod" value="REGISTERED_MAIL"> 등기보통우편</label>
      <label><input type="radio" name="receiveMethod" value="NORMAL_MAIL"> 일반보통우편</label>
    </div>
    <p class="certificate-hint">모든 선택은 학습용이며 실제 수령·제출이 이루어지지 않습니다. 제3자 제출 및 우편 수령의 추가 신청 절차는 아직 재현하지 않았습니다.</p>
  </section>
</div>
