<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<spring:eval expression="@environment.getProperty('app.kakao.maps.javascript-key', '')"
             var="kakaoMapsJavascriptKey" />
<main id="main-content" class="home-main" data-api-url="${pageContext.request.contextPath}/api/main">
    <section id="practice-section" class="home-panel practice-panel" aria-label="행정절차 연습">
        <div class="container home-panel-inner">
            <section class="hero-section home-hero" aria-label="행정절차 연습 시작">
                <div class="hero-grid">
                    <div class="hero-copy">
                        <div id="loggedOutView" hidden>
                            <h1 id="home-title">필요한 행정절차를<br><span>미리 살펴보고 연습해 보세요.</span></h1>
                            <p>실제 신청 전에 단계별 절차를 안전하게 경험할 수 있어요.</p>
                        </div>
                        <div id="loggedInNoProgressView" hidden>
                            <h1><span id="memberNameNoProgress"></span>님, 오늘도 차근차근<br><span>한 단계씩 준비해 봐요.</span></h1>
                            <p>필요한 행정절차를 미리 알고, 실제 신청 전에 단계별로 연습해 보세요.</p>
                        </div>
                        <div id="loggedInProgressView" hidden>
                            <h1><span id="memberNameProgress"></span>님, 오늘도 차근차근<br><span>한 단계씩 준비해 봐요.</span></h1>
                            <p>필요한 행정절차를 미리 알고, 실제 신청 전에 단계별로 연습해 보세요.</p>
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

            <section class="home-service-grid" aria-label="주요 서비스 바로가기">
                <a class="service-card service-primary home-service-card" href="${pageContext.request.contextPath}/scenario">
                    <span class="service-icon"><span class="material-symbols-outlined" aria-hidden="true">fact_check</span></span>
                    <span class="home-service-copy"><span class="service-kicker">STEP BY STEP</span><h2 class="home-service-title">행정절차 연습하기</h2><span class="home-service-description">원하는 시나리오를 골라 신청 흐름을 미리 연습해 보세요.</span></span>
                </a>
                <a class="service-card home-service-card home-history-card" href="${pageContext.request.contextPath}/mypage">
                    <span class="service-icon"><span class="material-symbols-outlined" aria-hidden="true">history</span></span>
                    <span class="home-service-copy"><span class="service-kicker">MY PRACTICE</span><h2 class="home-service-title">내 연습 기록</h2><span class="home-service-description">진행 중이거나 완료한 시나리오를 확인하세요.</span></span>
                </a>
                <a class="service-card home-service-card home-inquiry-card" href="${pageContext.request.contextPath}/inquiries">
                    <span class="service-icon"><span class="material-symbols-outlined" aria-hidden="true">forum</span></span>
                    <span class="home-service-copy"><span class="service-kicker">HELP CENTER</span><h2 class="home-service-title">문의 게시판</h2><span class="home-service-description">궁금한 점을 남기고 답변을 확인하세요.</span></span>
                </a>
            </section>

            <section id="popular-scenarios" class="popular-scenarios-panel" aria-labelledby="popular-scenarios-title" aria-roledescription="캐러셀">
                <div class="popular-scenarios-heading">
                    <h2 id="popular-scenarios-title">이번 달 인기 시나리오</h2>
                </div>
                <div class="popular-carousel">
                    <div class="popular-carousel-slide" data-popular-slide aria-live="polite">
                        <p class="popular-scenarios-status">인기 시나리오를 불러오는 중입니다.</p>
                    </div>
                </div>
                <div class="popular-carousel-controls">
                    <button class="popular-carousel-arrow" type="button" data-popular-prev aria-label="이전 시나리오">
                        <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                    </button>
                    <span data-popular-position aria-live="polite">0 / 0</span>
                    <button class="popular-carousel-arrow" type="button" data-popular-next aria-label="다음 시나리오">
                        <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                    </button>
                    <button class="popular-carousel-play" type="button" data-popular-toggle aria-label="자동 넘김 일시정지">
                        <span class="material-symbols-outlined" aria-hidden="true">pause</span>
                    </button>
                    <div class="popular-carousel-dots" data-popular-dots aria-label="시나리오 선택"></div>
                </div>
                <p class="popular-scenarios-feedback" data-popular-feedback role="status" aria-live="polite"></p>
            </section>
        </div>
    </section>

    <section id="center-map-section" class="home-panel center-map-section center-map-panel"
                 aria-labelledby="center-map-title"
				 data-search-api-url="${pageContext.request.contextPath}/api/main/institutions/search"
				 data-kakao-map-key="${kakaoMapsJavascriptKey}"
                 data-sgis-region-api-url="${pageContext.request.contextPath}/api/address/sgis/regions">
        <div class="container home-panel-inner">
            <div class="center-map-heading">
                <div>
                    <h2 id="center-map-title">행정기관을 찾으시나요?</h2>
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
                <div class="center-map-search-group">
                    <button id="center-map-search" type="button" class="btn btn-primary center-map-search" disabled>
                        지역 조회
                    </button>
                    <div class="center-map-help">
                        <button type="button" class="center-map-help-trigger" aria-label="지도 검색 안내"
                                aria-controls="center-map-help-tooltip" aria-haspopup="dialog" aria-expanded="false">
                            <span class="material-symbols-outlined" aria-hidden="true">help_outline</span>
                        </button>
                        <div id="center-map-help-tooltip" class="center-map-help-tooltip" role="dialog" aria-label="지도 검색 안내">
                            <button type="button" class="center-map-help-close" aria-label="지도 검색 안내 닫기">
                                <span class="material-symbols-outlined" aria-hidden="true">close</span>
                            </button>
                            <strong>핀 색상</strong>
                            <p class="center-map-help-pin-row"><span class="center-map-help-blue">파란 핀</span><span>PO3 또는 사회·공공기관 &gt; 지방행정기관·행정기관·행정기관부속시설 분류</span></p>
                            <p class="center-map-help-pin-row"><span class="center-map-help-dark">검은 핀</span><span>검색어에는 맞지만 위 카카오 분류와 일치하지 않거나 분류 정보가 없는 장소</span></p>
                            <strong>조회 대상 기관명 (11종)</strong>
                            <p>행정복지센터 · 주민센터 · 주민자치센터 · 동사무소 · 면사무소 · 읍사무소 · 시청 · 군청 · 구청 · 출장소 · 분소</p>
                            <small>‘무인민원발급’ 또는 ‘무인발급’이 포함된 장소는 제외합니다.</small>
                        </div>
                    </div>
                </div>
            </div>

            <p id="center-map-message" class="center-map-message" role="status" aria-live="polite">
                지역을 선택해 행정기관을 찾아보세요.
            </p>
            <div class="center-map-content-layout">
                <div class="center-map-visual">
                    <div id="center-map" class="center-map-canvas" role="region" aria-label="행정복지센터 위치 지도"></div>
                </div>
                <div id="center-list" class="center-map-list" role="region" aria-label="선택 지역 행정복지센터 목록">
                    <div id="center-list-empty-state" class="center-list-empty-state">
                        <span class="material-symbols-outlined" aria-hidden="true">location_searching</span>
                        <strong id="center-list-empty-title">지역 센터를 찾아보세요</strong>
                        <p id="center-list-message" class="center-list-message" role="status" aria-live="polite">
                            시·도와 시·군·구를 선택한 뒤 지역 조회를 눌러주세요.
                        </p>
                    </div>
                    <div id="center-list-results" class="center-list-results"></div>
                    <nav class="center-list-pagination-wrap" aria-label="행정복지센터 목록 페이지">
                        <ul id="center-list-pagination" class="hb-pagination"></ul>
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
                    <ul id="policySearchPagination" class="hb-pagination"></ul>
                </nav>
            </section>
        </div>
</section>

    <nav class="home-section-dots" aria-label="메인 영역 이동">
        <a class="active" href="#practice-section" data-home-dot="practice-section" aria-label="행정절차 연습으로 이동" aria-current="location"></a>
        <a href="#center-map-section" data-home-dot="center-map-section" aria-label="우리동네 행정지도로 이동"></a>
        <a href="#policy-search-section" data-home-dot="policy-search-section" aria-label="공공서비스 정책 검색으로 이동"></a>
    </nav>
</main>
