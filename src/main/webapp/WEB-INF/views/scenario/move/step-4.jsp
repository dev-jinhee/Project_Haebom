<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<!-- 전입신고 4단계: simulation.jsp #stepContent에 삽입할 JSP fragment -->
<!-- 상단 진행 표시와 이전/다음 버튼은 공통 simulation.jsp가 담당 -->
<div class="sim-step-content move-step4" data-step="4">
    <section class="gov24-form-panel gov24-address-panel">
        <h3>현재 거주지 정보</h3>
        <p class="text-muted small mb-4">이사한 후 거주할 주소와 세대 구성 방법을 확인해 주세요.</p>

        <!-- 주소 검색 -->
        <div class="gov24-form-field mb-4">
            <label class="form-label fw-semibold" for="newRoadAddress">
                주소 확인 <span class="text-primary small fw-normal">(필수)</span>
            </label>
            <div class="gov24-address-controls move-step4-address-controls">
                <input id="newRoadAddress" class="form-control" type="text"
                       placeholder="검색 버튼을 눌러 주소를 선택해 주세요" readonly required>
                <button id="searchNewAddressBtn" class="btn btn-outline-primary" type="button">검색</button>
            </div>
           <!--  <p id="newAddressStatus" class="text-muted small mt-2 mb-0" role="status" aria-live="polite">
                검색 버튼을 누르면 도로명주소 검색 팝업이 열립니다.
            </p>
            <div class="mt-2 d-flex align-items-center gap-2">
                <label class="form-label small mb-0" for="newZipNo">우편번호</label>
                <input id="newZipNo" class="form-control form-control-sm" style="width: 130px;" type="text" readonly
                       placeholder="자동 입력">
            </div> -->

            <!-- 3단계와 같은 조회 결과 형식. 행정복지센터는 실제 조회값이 아닌 체험용 가상 정보 -->
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
                <p class="text-muted small mt-2 mb-0">
                    ※ 행정복지센터는 실제 관할 기관 조회 결과가 아닌 시뮬레이션용 가상 정보입니다.
                </p>
            </div>
        </div>

        <!-- 도로명주소 팝업에서 반환하는 검색 결과값: 추후 공통 답변 JSON 저장용 -->
        <input id="newJibunAddress" type="hidden">
        <input id="newAdmCd" type="hidden">
        <input id="newRnMgtSn" type="hidden">
        <input id="newBdMgtSn" type="hidden">
        <input id="newSiNm" type="hidden">
        <input id="newSggNm" type="hidden">
        <input id="newEmdNm" type="hidden">

        <!-- 건축물 정보: 주소 검색 결과로 자동 입력 -->
        <div class="gov24-building-fields move-step4-building-fields">
            <label for="newBuildingPosition">
                건축물 구분
                <select id="newBuildingPosition" class="form-select" disabled>
                    <option value="">주소 검색 후 표시</option>
                    <option value="0">지상</option>
                    <option value="1">지하</option>
                </select>
            </label>
            <label for="newBuildingMainNo">
                본번
                <input id="newBuildingMainNo" class="form-control" type="text" readonly>
            </label>
            <label for="newBuildingSubNo">
                부번
                <input id="newBuildingSubNo" class="form-control" type="text" readonly>
            </label>
        </div>

        <!-- 상세주소는 공식 팝업에서 받지 않고 해봄 화면에서 직접 입력 -->
        <div class="gov24-detail-address">
            <label class="form-label fw-semibold" for="newDetailAddress">그 외 주소</label>
            <input id="newDetailAddress" class="form-control" type="text" maxlength="150"
                   placeholder="예) 101동 501호 (상세주소가 있는 경우 입력)" autocomplete="off">
            <p class="small text-muted">※ 상세주소가 있다면 입력해 주세요. 연습할 때는 실제 집 주소 대신 가상의 주소를 사용하는 것을 권장합니다.</p>
        </div>

        <!-- 이사 온 곳의 세대주: 3단계의 이전 주소 세대주와 별개 -->
        <div class="gov24-household-head-summary">
            <span>이사 온 곳의 세대주</span>
            <strong id="newHouseholdHeadSummary">선택된 세대주가 없습니다.</strong>
        </div>

        <fieldset class="gov24-household-field">
            <legend class="fs-6 fw-semibold mb-3">
                세대 구성 방법 <span class="text-primary small fw-normal">(필수)</span>
            </legend>
            <label>
                <input id="householdNew" type="radio" name="newHouseholdType" value="NEW_HOUSEHOLD">
                <span>이사 온 사람끼리 세대 구성 (빈집으로 이사)</span>
            </label>
            <label>
                <input id="householdExisting" type="radio" name="newHouseholdType" value="JOIN_EXISTING">
                <span>이사 온 곳에 기존에 살고 있는 세대주가 있는 경우</span>
            </label>
        </fieldset>

        <!-- ① 신규 세대 구성: 참고 화면과 같이 신청인을 새 주소의 세대주로 지정 -->
        <div id="newHeadSelectionSection" class="move-step4-household-detail mt-4 d-none">
            <h4 class="fs-6 fw-semibold mb-3">신청인을 세대주로 지정합니다.</h4>
            <p class="small text-muted mb-3">
                3단계에서 이사 대상으로 선택한 가족만 표시됩니다.
                신청인은 '본인'이며, 함께 이사하는 다른 가족은 신청인과의 관계를 선택해 주세요.
            </p>
            <div class="table-responsive">
                <table class="gov24-people-table move-step4-family-table" aria-label="신규 세대 구성 대상 가족">
                    <thead><tr>
                        <th scope="col">선택</th>
                        <th scope="col">세대주와의 관계</th>
                        <th scope="col">성명</th>
                        <th scope="col">생년월일</th>
                        <th scope="col">성별</th>
                        <th scope="col">연락처(휴대폰번호)</th>
                    </tr></thead>
                    <tbody id="newAddressHeadTableBody"></tbody>
                </table>
            </div>
            <p class="small text-muted mt-3 mb-0">
                ※ 미성년자가 포함된 경우 실제 전입신고의 신청 요건을 확인해야 합니다.
            </p>
            <p class="small text-muted mt-1 mb-0">
                ※ 연락처는 이전 단계에 등록된 정보를 참고용으로 표시합니다.
            </p>
        </div>

        <!-- ② 기존 세대에 편입: 참고 화면의 기존 세대주 정보 + 가족별 관계/연락처 -->
        <div id="existingHeadSection" class="move-step4-household-detail mt-4 d-none">
            <p class="move-step4-warning mb-4">
                ※ 실제 정부24에서는 기존 세대주와 별도 세대를 구성하려는 경우 온라인 신청이 제한될 수 있습니다.
                이 화면은 학습용이며 실제 신고 요건은 관할 행정복지센터에 확인해야 합니다.
            </p>

            <h4 class="fs-6 fw-semibold mb-3">
                이사 온 곳에 기존에 살고 있는 세대주 확인이 필요합니다.
                <span class="text-primary small fw-normal">(필수)</span>
            </h4>
            <div class="move-step4-existing-fields">
                <div class="move-step4-existing-name">
                    <label for="existingHeadName" class="form-label">기존 세대주 명 <span class="text-primary">*</span></label>
                    <input id="existingHeadName" class="form-control" type="text" maxlength="50"
                           placeholder="가상 세대주 이름을 입력해 주세요" autocomplete="off">
                </div>

                <div>
                    <span class="form-label d-block">주민등록번호</span>
                    <div class="move-step4-identity-row">
                        <input class="form-control move-step4-id-box" type="text" value="******" disabled
                               aria-label="주민등록번호 앞자리 표시 예시">
                        <span aria-hidden="true">–</span>
                        <input class="form-control move-step4-id-box" type="text" value="*******" disabled
                               aria-label="주민등록번호 뒷자리 표시 예시">
                        <button id="mockExistingHeadConfirmBtn" type="button" class="btn btn-outline-primary">
                            세대주 확인 체험
                        </button>
                    </div>
                    <p class="text-muted small mt-2 mb-1">
                        실제 주민등록번호는 입력받지 않습니다. 확인 버튼도 정부24 실명인증이 아닌 모의 체험입니다.
                    </p>
                    <p id="existingHeadConfirmStatus" class="small mt-1 mb-0" role="status" aria-live="polite">
                        세대주 이름을 입력한 후 학습용 확인 버튼을 눌러 주세요.
                    </p>
                </div>

                <div>
                    <label class="form-label" for="existingHeadPhoneFirst">기존 세대주 휴대전화번호 (선택)</label>
                    <div class="move-step4-phone-fields" data-phone-group="existingHeadPhone">
                        <input id="existingHeadPhoneFirst" class="form-control" type="tel" inputmode="numeric"
                               maxlength="3" placeholder="010" autocomplete="off" aria-label="기존 세대주 휴대전화번호 앞자리">
                        <span aria-hidden="true">–</span>
                        <input id="existingHeadPhoneMiddle" class="form-control" type="tel" inputmode="numeric"
                               maxlength="4" placeholder="1234" autocomplete="off" aria-label="기존 세대주 휴대전화번호 가운데자리">
                        <span aria-hidden="true">–</span>
                        <input id="existingHeadPhoneLast" class="form-control" type="tel" inputmode="numeric"
                               maxlength="4" placeholder="5678" autocomplete="off" aria-label="기존 세대주 휴대전화번호 뒷자리">
                    </div>
                </div>
            </div>
            <p class="small text-muted mt-3 mb-4">
                ※ 이사 온 곳 기존 세대주의 확인이 필요한 상황을 연습하는 화면입니다.
                실제 세대주에게 문자메시지를 발송하거나 실명인증을 수행하지 않습니다.
            </p>

            <h4 class="fs-6 fw-semibold mb-3">
                이사 온 곳의 기존 세대주와의 관계를 입력하세요.
                <span class="text-primary small fw-normal">(필수)</span>
            </h4>
            <div class="table-responsive">
                <table class="gov24-people-table move-step4-family-table move-step4-join-table" aria-label="이사하는 가족별 기존 세대주와의 관계">
                    <thead><tr>
                        <th scope="col">세대주와의 관계</th>
                        <th scope="col">성명</th>
                        <th scope="col">생년월일</th>
                        <th scope="col">성별</th>
                        <th scope="col">연락처(휴대폰번호)</th>
                    </tr></thead>
                    <tbody id="existingHeadRelationsBody"></tbody>
                </table>
            </div>
            <p class="small text-muted mt-3 mb-0">
                ※ 미성년자가 포함된 경우 실제 정부24의 전입신고 가능 요건을 확인해 주세요.
            </p>
            <p id="existingRelationStatus" class="small text-muted mt-2 mb-0" role="status" aria-live="polite">
                이사하는 모든 가족의 관계를 선택해 주세요.
            </p>
        </div>
    </section>

    <!-- 참고 화면의 선택 서비스 영역: 실제 외부 신청 없이 학습용 항목만 수집 -->
    <section class="gov24-extra-services mt-4">
        <h3>전입 신고와 함께 신청할 수 있는 서비스</h3>
        <div class="gov24-service-item"><div class="gov24-service-heading"><label>
            <input type="checkbox" name="additionalService" value="LEASE_REPORT">
            <span>임대차계약 신고 관련 안내 확인 (선택)</span>
        </label></div></div>
        <div class="gov24-service-item"><div class="gov24-service-heading"><label>
            <input type="checkbox" name="additionalService" value="MAIL_FORWARD">
            <span>우편물 주소 이전 서비스 신청 (선택)</span>
        </label></div></div>
        <div class="gov24-service-item"><div class="gov24-service-heading"><label>
            <input type="checkbox" name="additionalService" value="SCHOOL_ADDRESS">
            <span>초등학교 배정 정보 확인 (선택)</span>
        </label></div></div>
        <div class="gov24-service-item"><div class="gov24-service-heading"><label>
            <input type="checkbox" name="additionalService" value="UTILITY_ADDRESS">
            <span>전기 사용자 명의변경 안내 확인 (선택)</span>
        </label></div></div>
        <div class="gov24-service-item"><div class="gov24-service-heading"><label>
            <input type="checkbox" name="additionalService" value="WELFARE_BENEFIT">
            <span>복지급여 관련 안내 확인 (선택)</span>
        </label></div></div>
    </section>

    <div class="alert alert-info mt-4 mb-3" role="note">
        <p class="small mb-0"><spring:message code="simulation.notice" /></p>
    </div>
    <div class="border rounded-3 bg-light p-3">
        <h4 class="small fw-semibold mb-2">개인정보 입력 안내</h4>
        <p class="small text-muted mb-0"><spring:message code="simulation.privacy" /></p>
    </div>
</div>
