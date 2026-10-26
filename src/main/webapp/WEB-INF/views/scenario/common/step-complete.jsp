<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%--
    해봄 | 공통 시나리오 완료 화면 (JSP fragment)

    위치: /WEB-INF/views/simulation/common/complete.jsp
    사용: simulation.jsp의 #stepContent에 삽입

    주의
    - 시나리오별 n단계(step-05.jsp 등)가 아님
    - 상단 헤더, 시나리오 정보, 진행률, 상단 '연습 결과' 제목은
      이미 simulation.jsp에서 렌더링하므로 여기서 중복 생성하지 않음
    - #complete... 요소는 추후 공통 JS가 시나리오별 정보로 채움
    - 기존 공통 #prevStep/#nextStep 버튼은 완료 시 공통 JS에서 숨김 처리
--%>
<div id="simulationComplete" class="sim-step-content sim-complete" data-view="complete">

    <%-- 1. 공통 완료 메시지 --%>
    <section class="completion-panel text-center pt-3 pb-4"
             aria-labelledby="completeTitle">
        <div class="complete-mark" aria-hidden="true">
            <i class="bi bi-check-lg"></i>
        </div>
        <p id="completeStatusLabel" class="text-primary fw-semibold small mb-2">
            체험 완료
        </p>
        <h3 id="completeTitle" class="mb-2">행정절차 연습을 완료했어요</h3>
        <p id="completeDescription" class="text-secondary small mx-auto"
           style="max-width: 680px; line-height: 1.8;">
            모든 연습 단계를 마쳤습니다. 이 체험은 실제 민원 신청으로 접수되지 않습니다.
        </p>
    </section>

    <%-- 2. 시나리오별 준비사항 (공통 JS가 li 요소 생성) --%>
    <section id="completeChecklistSection" class="checklist-box mt-3"
             aria-labelledby="completeChecklistHeading">
        <h4 id="completeChecklistHeading" class="mb-2">내 준비사항</h4>
        <ul id="completeChecklistList" class="mb-0"></ul>
        <p id="completeChecklistEmpty" class="text-secondary small mb-0">
            시나리오별 준비사항을 불러오는 중입니다.
        </p>
    </section>

    <%-- 3. 시나리오별 연관 정책 안내 (데이터가 있는 경우 JS가 d-none 제거) --%>
    <section id="completePolicySection"
             class="border rounded-4 p-3 p-md-4 mt-3 d-none"
             aria-labelledby="completePolicyTitle">
        <div class="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
                <p id="completePolicyEyebrow" class="text-primary fw-semibold small mb-1">
                    함께 확인하면 좋은 정책
                </p>
                <h4 id="completePolicyTitle" class="fw-bold fs-6 mb-1">
                    관련 정책 및 서비스 안내
                </h4>
                <p id="completePolicyDescription" class="text-secondary small mb-0">
                    체험 내용과 관련된 참고 정보를 확인해 보세요.
                </p>
            </div>
            <a id="completePolicyMoreLink" class="small fw-semibold text-decoration-none d-none"
               href="#" target="_blank" rel="noopener noreferrer">
                참고 정보 <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>
            </a>
        </div>

        <%-- 정책 행/카드는 공통 JS에서 생성. 번호·제목·설명 모두 시나리오 데이터로 처리 --%>
        <div id="completePolicyList" class="mt-3 border-top"></div>

        <p id="completePolicyNote" class="text-secondary small mt-3 mb-0 d-none"></p>
    </section>

    <%-- 4. 공식 안내 링크: JS에서 시나리오별 공식 URL로 변경 가능 --%>
    <div class="mt-3" id="completeOfficialSection">
        <a id="completeOfficialLink" class="btn btn-outline-primary rounded-pill px-4"
           href="https://www.gov.kr/" target="_blank" rel="noopener noreferrer">
            정부24 공식 안내 확인
            <i class="bi bi-box-arrow-up-right ms-1" aria-hidden="true"></i>
        </a>
    </div>

    <%--
        5. 완료 화면 동작 버튼
        공통 simulation.jsp의 기존 .sim-card-footer(이전/다음 버튼)와
        동시에 표시되지 않도록 완료 진입 시 simulation.js에서 해당 footer를 숨겨야 함.
        '메인 화면으로' URL은 실제 라우팅에 맞게 공통 JS에서 변경 가능.
    --%>
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3
                border-top mt-4 pt-3 sim-complete-actions">
        <div>
            <button id="completePrintBtn" type="button"
                    class="btn btn-link text-secondary text-decoration-none p-0 small">
                <i class="bi bi-printer me-1" aria-hidden="true"></i>
                신청 화면 PDF 저장
            </button>
            <p class="text-secondary mb-0 mt-1" style="font-size: .72rem;">
                인쇄 창에서 ‘PDF로 저장’을 선택할 수 있습니다.
            </p>
        </div>
    </div>
</div>
