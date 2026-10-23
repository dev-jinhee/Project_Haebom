<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<!-- ============================================================
     전입신고 0단계 | 가상 세대 정보 입력
     - simulation.jsp의 #stepContent에 삽입되는 JSP 조각
     - 행 추가/삭제, 단일 세대주 선택, 저장 및 시작은 move.js 담당
     ============================================================ -->
<div class="sim-step-content" data-step="0">
    <section class="gov24-form-panel gov24-household-head-panel">
        <h3>가상 세대 정보 입력</h3>

        <div class="table-responsive">
            <table class="gov24-people-table" id="householdPeopleTable">
                <!-- 열 비율은 move.css의 household-col-*에서 관리 -->
                <colgroup>
                    <col class="household-col-head">
                    <col class="household-col-relation">
                    <col class="household-col-name">
                    <col class="household-col-birth">
                    <col class="household-col-gender">
                </colgroup>

                <thead>
                    <tr>
                        <th scope="col">세대주</th>
                        <th scope="col">세대주와의 관계</th>
                        <th scope="col">성명</th>
                        <th scope="col">생년월일</th>
                        <th scope="col">성별</th>
                    </tr>
                </thead>

                <tbody id="householdPeopleBody">
                    <!-- 신청인 기본 행 -->
                    <tr data-person-id="applicant" data-person-row>
                        <td>
                            <input type="checkbox" class="form-check-input"
                                   id="householdHeadApplicant" name="householdHead"
                                   value="applicant" checked
                                   aria-label="입력한 사람을 세대주로 지정">
                        </td>

                        <td>
                            <select class="form-select" name="householdRelation"
                                    aria-label="세대주와의 관계 선택">
                                <option value="">선택</option>
                                <option value="SELF" selected>본인</option>
                                <option value="SPOUSE">배우자</option>
                                <option value="FATHER">부</option>
                                <option value="MOTHER">모</option>
                                <option value="CHILD">자녀</option>
                                <option value="OTHER">기타</option>
                            </select>
                        </td>

                        <td>
                            <!-- 신청인 표시는 관계 선택란 아래가 아닌 성명 입력칸 옆 -->
                            <div class="move-applicant-name">
                                <span class="move-applicant-badge">신청인</span>
                                <input type="text" class="form-control"
                                       id="householdName" name="personName" data-person-name
                                       aria-label="성명 입력" placeholder="성명 입력"
                                       autocomplete="off" value="김해봄" required>
                            </div>
                        </td>

                        <td>
                            <input type="date" class="form-control"
                                   id="householdBirthdate" name="personBirthdate"
                                   aria-label="생년월일 선택" value="2001-01-01" required>
                        </td>

                        <td>
                            <select class="form-select" id="householdGender"
                                    name="personGender" aria-label="성별 선택" required>
                                <option value="" selected>선택</option>
                                <option value="M">남</option>
                                <option value="F">여</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 가족 구성원 행 추가/삭제 -->
        <div class="d-flex justify-content-end gap-2 mt-3">
            <button type="button" class="btn btn-outline-primary btn-sm px-3"
                    id="addHouseholdPerson" aria-label="행 추가">
                <i class="bi bi-plus-lg me-1" aria-hidden="true"></i> 행 추가
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm px-3"
                    id="removeHouseholdPerson" aria-label="마지막 추가 행 삭제"
                    title="마지막으로 추가한 행을 삭제합니다" disabled>
                <i class="bi bi-dash-lg me-1" aria-hidden="true"></i> 마지막 행 삭제
            </button>
        </div>

        <!-- 추가 가족 구성원용 행 템플릿 -->
        <template id="householdPersonRowTemplate">
            <tr data-person-row>
                <td>
                    <input type="checkbox" class="form-check-input"
                           name="householdHead" aria-label="이 사람을 세대주로 지정">
                </td>
                <td>
                    <select class="form-select" name="householdRelation"
                            aria-label="세대주와의 관계 선택">
                        <option value="">선택</option>
                        <option value="SELF">본인</option>
                        <option value="SPOUSE">배우자</option>
                        <option value="FATHER">부</option>
                        <option value="MOTHER">모</option>
                        <option value="CHILD">자녀</option>
                        <option value="OTHER">기타</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="form-control"
                           name="personName" data-person-name
                           aria-label="성명 입력" placeholder="성명 입력"
                           autocomplete="off" required>
                </td>
                <td>
                    <input type="date" class="form-control"
                           name="personBirthdate" aria-label="생년월일 선택" required>
                </td>
                <td>
                    <select class="form-select" name="personGender"
                            aria-label="성별 선택" required>
                        <option value="" selected>선택</option>
                        <option value="M">남</option>
                        <option value="F">여</option>
                    </select>
                </td>
            </tr>
        </template>
    </section>

    <!-- 0단계 전용 시작 버튼: 공통 네비게이션과 동일한 푸터 레이아웃 -->
    <div class="sim-card-footer move-step0-actions">
        <button type="button" id="startMoveSimulation"
                class="btn btn-primary rounded-pill px-4">
            시뮬레이션 시작하기
            <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
        </button>
    </div>
</div>
