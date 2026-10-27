<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<!-- 전입신고 3단계 | 이사 전 주소 + 이사 대상 가족 + (조건부) 새 세대주 -->
<!-- stepContent 내부에 삽입되는 JSP fragment. 상단 단계 제목/이전·다음 버튼은 simulation.jsp가 담당 -->
<div class="sim-step-content move-step3" data-step="3">
    <section class="gov24-form-panel move-step3-panel">
        <h3>이사 전 거주지 정보</h3>

        <!-- 1. 이사 전 주소 조회 -->
        <div class="move-step3-block">
            <h4 class="move-step3-heading">주소 확인</h4>
            <div class="gov24-address-controls move-step3-address-controls">
                <label for="sidoSelect" class="visually-hidden">시·도</label>
                <select id="sidoSelect" class="form-select" aria-label="시·도 선택">
                    <option value="">시·도 선택</option>
                </select>

                <label for="sigunguSelect" class="visually-hidden">시·군·구</label>
                <select id="sigunguSelect" class="form-select" aria-label="시·군·구 선택" disabled>
                    <option value="">시·군·구 선택</option>
                </select>

                <button id="searchFamilyBtn" type="button" class="btn btn-outline-primary" disabled>
                    주소조회
                </button>
            </div>
            <p id="addressStatus" class="text-muted small mt-2 mb-0" role="status" aria-live="polite">
                시·도와 시·군·구를 선택해 주세요.
            </p>

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
                <p class="text-muted small mt-2 mb-0">
                    ※ 상세 주소와 행정복지센터는 실제 정보가 아닌 시뮬레이션용 가상 정보입니다.
                </p>
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
                            <th scope="col">
                                <input id="selectAllMoving" type="checkbox" class="form-check-input"
                                       aria-label="이사 대상 가족 전체 선택">
                            </th>
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
            <p class="text-muted small mb-3">기존 주소에 남는 가족 중 새로운 세대주 한 명을 선택해 주세요.</p>
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
            <div class="move-step3-phone-group">
                <input id="newHeadPhoneFirst" class="form-control" type="text" inputmode="numeric"
                       maxlength="3" autocomplete="off" aria-label="세대주 휴대전화번호 앞자리" value="010">
                <span aria-hidden="true">-</span>
                <input id="newHeadPhoneMiddle" class="form-control" type="text" inputmode="numeric"
                       maxlength="4" autocomplete="off" placeholder="0000" aria-label="세대주 휴대전화번호 중간자리">
                <span aria-hidden="true">-</span>
                <input id="newHeadPhoneLast" class="form-control" type="text" inputmode="numeric"
                       maxlength="4" autocomplete="off" placeholder="0000" aria-label="세대주 휴대전화번호 뒷자리">
            </div>
        </div>
    </section>

    <!-- 공통 안내 문구: 기존 해봄 메시지 유지 -->
    <div class="alert alert-info mb-3" role="note">
        <p class="small mb-0"><spring:message code="simulation.notice" /></p>
    </div>
    <div class="border rounded-3 bg-light p-3">
        <h4 class="small fw-semibold mb-2">개인정보 입력 안내</h4>
        <p class="small text-muted mb-0"><spring:message code="simulation.privacy" /></p>
    </div>
</div>
