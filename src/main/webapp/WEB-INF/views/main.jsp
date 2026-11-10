<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<spring:eval expression="@environment.getProperty('app.google.maps.browser-key', '')" var="googleMapsBrowserKey" />
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="해봄에서 생활 행정절차를 안전하게 미리 연습해 보세요.">
    <title>해봄 | 생활 행정절차 미리연습</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/common.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/pages/home.css?v=home-v20-v2-hero-motif" rel="stylesheet">

</head>
<body>
<jsp:include page="/WEB-INF/views/common/header-main.jsp" />

<main id="main-content" class="home-main" data-api-url="${pageContext.request.contextPath}/api/main">
    <section id="practice-section" class="home-panel practice-panel" aria-label="행정절차 연습">
        <div class="container home-panel-inner">
            <section class="hero-section home-hero" aria-label="행정절차 연습 시작">
                <div class="hero-grid">
                    <div class="hero-copy">
                        <div id="loggedOutView" hidden>
                            <h1 id="home-title">필요한 행정절차를<br><span>미리 살펴보고 연습해 보세요.</span></h1>
                            <p>실제 신청 전에 단계별 절차를 안전하게 경험할 수 있어요.</p>
                            <a class="btn btn-light rounded-pill px-4 mt-3" href="${pageContext.request.contextPath}/scenario">연습할 시나리오 선택하기</a>
                        </div>
                        <div id="loggedInNoProgressView" hidden>
                            <h1><span id="memberNameNoProgress"></span>님, 오늘도 차근차근<br><span>한 단계씩 준비해 봐요.</span></h1>
                            <p>필요한 행정절차를 미리 알고, 실제 신청 전에 단계별로 연습해 보세요.</p>
                            <a class="btn btn-light rounded-pill px-4 mt-3" href="${pageContext.request.contextPath}/scenario">연습할 시나리오 선택하기</a>
                        </div>
                        <div id="loggedInProgressView" hidden>
                            <h1><span id="memberNameProgress"></span>님, 오늘도 차근차근<br><span>한 단계씩 준비해 봐요.</span></h1>
                            <p>필요한 행정절차를 미리 알고, 실제 신청 전에 단계별로 연습해 보세요.</p>
                            <a class="btn btn-light rounded-pill px-4 mt-3" href="${pageContext.request.contextPath}/scenario">진행 중인 연습 보기 <span class="material-symbols-outlined ms-1" aria-hidden="true">arrow_forward</span></a>
                        </div>
                    </div>
                    <aside class="hero-visual" aria-label="해봄 이용 방법">
                        <div id="startGuideCard" class="start-guide" hidden>
                            <h2>쉽게 시작하는 방법</h2>
                            <div class="start-step"><span class="start-step-number">1</span><span><b>절차 선택</b><small>연습할 행정서비스를 골라요.</small></span></div>
                            <div class="start-step"><span class="start-step-number">2</span><span><b>단계별 연습</b><small>화면 안내를 따라 하나씩 진행해요.</small></span></div>
                            <div class="start-step"><span class="start-step-number">3</span><span><b>결과 확인</b><small>상황에 맞는 안내를 살펴봐요.</small></span></div>
                        </div>
                        <div id="recentProgressMount" hidden><!-- 진행 중인 시나리오를 home.js에서 표시합니다. --></div>
                    </aside>
                </div>
            </section>

            <section id="popular-scenarios" class="popular-scenarios-panel" aria-labelledby="popular-scenarios-title" aria-roledescription="캐러셀">
            <div class="popular-scenarios-heading">
                <div>
                    <h2 id="popular-scenarios-title">이번 달 인기 시나리오</h2>
                    <p>많이 연습한 행정절차를 확인하고 바로 시작해 보세요.</p>
                </div>
                <a class="btn btn-outline-primary rounded-pill" href="${pageContext.request.contextPath}/scenario">
                    전체 시나리오 보기
                </a>
            </div>
            <div class="popular-carousel">
                <button class="popular-carousel-arrow" type="button" data-popular-prev aria-label="이전 시나리오">
                    <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                </button>
                <div class="popular-carousel-slide" data-popular-slide aria-live="polite">
                    <p class="popular-scenarios-status">인기 시나리오를 불러오는 중입니다.</p>
                </div>
                <button class="popular-carousel-arrow" type="button" data-popular-next aria-label="다음 시나리오">
                    <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                </button>
            </div>
            <div class="popular-carousel-controls">
                <span data-popular-position aria-live="polite">0 / 0</span>
                <button class="popular-carousel-play" type="button" data-popular-toggle aria-label="자동 넘김 일시정지">
                    <span class="material-symbols-outlined" aria-hidden="true">pause</span>
                </button>
                <div class="popular-carousel-dots" data-popular-dots aria-label="시나리오 선택"></div>
            </div>
            <p class="popular-scenarios-feedback" data-popular-feedback role="status" aria-live="polite"></p>
            </section>

            <section class="home-service-grid" aria-label="주요 서비스 바로가기">
                <a class="service-card service-primary home-service-card" href="${pageContext.request.contextPath}/scenario">
                    <span class="service-icon"><span class="material-symbols-outlined" aria-hidden="true">fact_check</span></span><span class="service-kicker">STEP BY STEP</span><h2>행정절차 연습하기</h2><p>전체 시나리오를 살펴보고 원하는 절차의 연습을 시작합니다.</p><span class="service-action">시나리오 선택하기 <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></span>
                </a>
                <a class="service-card home-service-card home-inquiry-card" href="${pageContext.request.contextPath}/inquiries">
                    <span class="service-icon"><span class="material-symbols-outlined" aria-hidden="true">forum</span></span><span class="service-kicker">HELP CENTER</span><h2>문의 게시판</h2><p>이용 중 궁금한 점을 남기고 답변을 확인합니다.</p><span class="service-action">문의하러 가기 <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></span>
                </a>
            </section>
        </div>
    </section>

    <section id="center-map-section" class="home-panel center-map-section center-map-panel"
                 aria-labelledby="center-map-title"
                 data-api-url="${pageContext.request.contextPath}/api/main/institutions"
                 data-sido-api-url="${pageContext.request.contextPath}/api/main/institutions/regions/sido"
                 data-sigungu-api-url="${pageContext.request.contextPath}/api/main/institutions/regions/sigungu"
                 data-map-key="${googleMapsBrowserKey}">
        <div class="container home-panel-inner">
            <div class="center-map-heading">
                <div>
                    <h2 id="center-map-title">행정복지센터를 찾으시나요?</h2>
                </div>
            </div>

            <div class="center-map-filters">
                <div>
                    <select id="center-sido" class="form-select" aria-label="시·도 선택" aria-describedby="center-map-message">
                        <option value="">시·도를 선택하세요</option>
                    </select>
                </div>
                <div>
                    <select id="center-sigungu" class="form-select" aria-label="시·군·구 선택" disabled aria-describedby="center-map-message">
                        <option value="">먼저 시·도를 선택하세요</option>
                    </select>
                </div>
                <button id="center-map-search" type="button" class="btn btn-primary center-map-search" disabled>
                    지역 조회
                </button>
            </div>

            <p id="center-map-message" class="center-map-message" role="status" aria-live="polite">
                주소 자료는 행정안전부 읍면동 하부행정기관 현황(2025년 12월 31일 기준)이며, 이후 변경 사항은 반영되지 않았을 수 있습니다.
            </p>
            <div class="center-map-content-layout">
                <div id="center-map" class="center-map-canvas" role="region" aria-label="행정복지센터 위치 지도"></div>
                <div id="center-list" class="center-map-list" role="region" aria-label="선택 지역 행정복지센터 목록">
                    <div id="center-list-empty-state" class="center-list-empty-state">
                        <span class="material-symbols-outlined" aria-hidden="true">location_searching</span>
                        <strong>지역 센터를 찾아보세요</strong>
                        <p id="center-list-message" class="center-list-message" role="status" aria-live="polite">
                            시·도와 시·군·구를 선택한 뒤 지역 조회를 눌러주세요.
                        </p>
                    </div>
                    <div id="center-list-results" class="center-list-results"></div>
                    <nav class="center-list-pagination-wrap" aria-label="행정복지센터 목록 페이지">
                        <ul id="center-list-pagination" class="pagination justify-content-center"></ul>
                    </nav>
                </div>
            </div>
        </div>
    </section>

    <section id="policy-search-section" class="home-panel policy-home-panel" aria-labelledby="policy-search-title">
        <div class="container home-panel-inner">
        <section class="policy-panel">
            <h2 id="policy-search-title">공공서비스 정책 검색</h2>
            <p class="policy-search-intro">정책명이나 서비스명을 입력해 정부24 공공서비스를 검색해보세요.</p>

            <form id="policySearchForm"
                  class="policy-search-form"
                  action="${pageContext.request.contextPath}/api/main/policies"
                  method="get"
                  role="search">
                <label class="visually-hidden" for="policySearchInput">정책명 또는 검색어</label>
                <div class="input-group">
                    <input id="policySearchInput" name="keyword" class="form-control" type="search"
                           placeholder="예: 월세 지원" autocomplete="off">
                    <button class="btn btn-primary" type="submit">검색</button>
                </div>
            </form>

            <div id="policySearchCategories" class="policy-search-categories"
                 role="group" aria-label="정책 분야 선택">
                <button type="button" class="policy-category-button active"
                        data-policy-category="ALL" aria-pressed="true">전체</button>
            </div>

            <p id="policySearchMessage" class="small text-secondary mt-3 mb-2"
               role="status" aria-live="polite"></p>
            <div id="policySearchResults" class="policy-search-results d-none"
                 aria-live="polite"></div>
            <nav class="policy-search-pagination-wrap" aria-label="정책 검색 결과 페이지">
                <ul id="policySearchPagination" class="pagination justify-content-center"></ul>
            </nav>
        </section>
        <footer class="site-footer home-inline-footer">
            <div class="container d-flex justify-content-between flex-wrap gap-2">
                <div><b>해봄</b><span class="ms-2">정부24 생활행정 체험 플랫폼</span></div>
                <div><span>문의 이메일</span><span class="ms-2">haebom1592@gmail.com</span></div>
            </div>
        </footer>
        </div>
    </section>

    <nav class="home-section-dots" aria-label="메인 영역 이동">
        <a class="active" href="#practice-section" data-home-dot="practice-section" aria-label="행정절차 연습으로 이동" aria-current="location"></a>
        <a href="#center-map-section" data-home-dot="center-map-section" aria-label="우리동네 행정지도로 이동"></a>
        <a href="#policy-search-section" data-home-dot="policy-search-section" aria-label="공공서비스 정책 검색으로 이동"></a>
    </nav>
</main>

<jsp:include page="/WEB-INF/views/common/modal.jsp" />
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script src="${pageContext.request.contextPath}/js/app.js"></script>
<script src="${pageContext.request.contextPath}/js/common.js"></script>
<script src="${pageContext.request.contextPath}/js/pages/home.js?v=home-v14-map-filter-hints"></script>
</body>
</html>
