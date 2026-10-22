<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
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
    <link href="${pageContext.request.contextPath}/css/pages/home.css" rel="stylesheet">

    <style>
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: 400; font-style: normal; font-size: 1.15em; line-height: 1; letter-spacing: normal; text-transform: none; white-space: nowrap; word-wrap: normal; direction: ltr; font-feature-settings: 'liga'; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20; }
        .home-main { padding: 26px 0 30px; }
        .home-hero { padding: 34px 0 30px; }
        .home-hero .hero-grid { grid-template-columns: 1.2fr .8fr; gap: 34px; }
        .home-hero .hero-copy h1 { margin: 12px 0 12px; font-size: clamp(2rem, 3.4vw, 2.8rem); }
        .home-hero .hero-copy p { font-size: .92rem; }
        .home-hero .hero-visual { min-height: 205px; }
        .start-guide { width: min(100%, 390px); padding: 18px; border: 1px solid rgba(255,255,255,.24); border-radius: 18px; color: #fff; background: rgba(255,255,255,.12); backdrop-filter: blur(8px); }
        .start-guide h2 { margin: 0 0 12px; color: #d8eaf5; font-size: .78rem; font-weight: 500; }
        .start-step { display: flex; align-items: center; gap: 10px; padding: 7px 0; }
        .start-step-number { display: grid; flex: 0 0 27px; width: 27px; height: 27px; place-items: center; border: 1px solid rgba(255,255,255,.4); border-radius: 50%; font-size: .73rem; }
        .start-step b, .start-step small { display: block; }
        .start-step b { font-size: .78rem; }
        .start-step small { margin-top: 1px; color: #d6e4ef; font-size: .66rem; }
        .home-content { display: grid; gap: 22px; padding-top: 26px; }
        .home-service-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .home-service-card { min-height: 174px; padding: 16px; border-radius: 16px; }
        .home-service-card .service-icon { width: 38px; height: 38px; border-radius: 12px; font-size: 1.05rem; }
        .home-service-card .service-kicker { margin-top: 9px; }
        .home-service-card h2 { margin: 3px 0 5px; font-size: .98rem; font-weight: 800; }
        .home-service-card p { font-size: .72rem; }
        .home-service-card .service-action { padding-top: 9px; font-size: .72rem; }
        .policy-panel { padding: 18px; border: 1px solid var(--line); border-radius: 16px; background: #fff; box-shadow: 0 7px 20px rgba(31,58,84,.035); }
        .policy-panel h2 { margin: 0 0 5px; font-size: .98rem; font-weight: 800; }
        .policy-search-intro { font-size: .76rem; }
        .policy-search-form .form-control, .policy-search-form .btn { min-height: 40px; font-size: .78rem; }
        .policy-search-form .input-group { border-radius: 9px; }
        .policy-keywords { margin: 9px 0 0; font-size: .7rem; }
        .policy-keywords button { padding: 3px 9px; font-size: .68rem; }
        .policy-search-footnote { margin: 0; padding: 11px 15px; border: 1px solid #e8edf2; border-radius: 10px; background: #f7f9fb; font-size: .68rem; }
        @media (max-width: 767.98px) {
            .home-main { padding-top: 0; }
            .home-hero { padding: 38px 0 30px; }
            .home-hero .hero-grid { grid-template-columns: 1fr; gap: 18px; }
            .home-hero .hero-visual { min-height: 0; }
            .start-guide { width: 100%; }
            .home-content { padding-top: 18px; }
            .home-service-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
<jsp:include page="/WEB-INF/views/common/header-main.jsp" />

<main id="main-content" class="home-main">
    <section class="hero-section home-hero" aria-labelledby="home-title">
        <div class="container hero-grid">
            <div class="hero-copy">
                <span class="eyebrow">화요일 · 2026. 10. 13</span>
                <h1 id="home-title">민지님, 오늘도 차근차근<br><span>한 단계씩 준비해 봐요.</span></h1>
                <p>필요한 행정절차를 미리 알고, 실제 신청 전에 단계별로 미리 연습해 보세요.</p>
                <a class="btn btn-light rounded-pill px-4 mt-3" href="${pageContext.request.contextPath}/scenario">
                    진행 중인 연습 보기 <span class="material-symbols-outlined ms-1" aria-hidden="true">arrow_forward</span>
                </a>
            </div>

            <aside class="hero-visual" aria-label="해봄 이용 방법">
                <div class="start-guide">
                    <h2>쉽게 시작하는 방법</h2>
                    <div class="start-step">
                        <span class="start-step-number">1</span>
                        <span><b>절차 선택</b><small>연습할 행정서비스를 골라요.</small></span>
                    </div>
                    <div class="start-step">
                        <span class="start-step-number">2</span>
                        <span><b>단계별 연습</b><small>화면 안내를 따라 하나씩 진행해요.</small></span>
                    </div>
                    <div class="start-step">
                        <span class="start-step-number">3</span>
                        <span><b>결과 확인</b><small>상황에 맞는 안내를 살펴봐요.</small></span>
                    </div>
                </div>
            </aside>
        </div>
    </section>

    <div class="container home-content">
        <section class="home-service-grid" aria-label="주요 서비스">
            <a class="service-card service-primary home-service-card" href="${pageContext.request.contextPath}/scenario">
                <span class="service-icon"><span class="material-symbols-outlined" aria-hidden="true">fact_check</span></span>
                <span class="service-kicker">STEP BY STEP</span>
                <h2>행정절차 연습</h2>
                <p>연습할 시나리오를 고르고 실제 신청 흐름을 미리 살펴보세요.</p>
                <span class="service-action">시나리오 선택하기 <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></span>
            </a>
            <a class="service-card home-service-card" href="${pageContext.request.contextPath}/inquiries">
                <span class="service-icon peach"><span class="material-symbols-outlined" aria-hidden="true">chat</span></span>
                <span class="service-kicker">HELP CENTER</span>
                <h2>문의 게시판</h2>
                <p>이용 중 궁금한 점을 남기고 답변을 확인해요.</p>
                <span class="service-action">문의하러 가기 <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></span>
            </a>
        </section>

        <%-- 정책 검색은 확장 기능으로, 현재는 화면에서 제외합니다.
        <section class="policy-panel" aria-labelledby="policy-title">
            <h2 id="policy-title">정책 검색</h2>
            <p class="policy-search-intro">정책명이나 관심 분야를 입력해 관련 정보를 찾아보세요.</p>
            <form id="policySearchForm" class="policy-search-form" role="search">
                <label class="visually-hidden" for="policySearchInput">정책명 또는 관심 분야</label>
                <div class="input-group">
                    <input id="policySearchInput" class="form-control" type="search" placeholder="예: 청년, 주거, 장애인" autocomplete="off">
                    <button class="btn btn-primary" type="submit">검색</button>
                </div>
            </form>
            <div class="policy-keywords" aria-label="인기 검색어">
                <span>인기 검색어</span>
                <button type="button" data-policy-query="청년">청년</button>
                <button type="button" data-policy-query="주거">주거</button>
                <button type="button" data-policy-query="장애인">장애인</button>
            </div>

            <div id="policySearchResults" class="policy-search-results d-none" aria-live="polite">
                <article class="policy-search-result" data-policy-terms="청년 주거 월세">
                    <strong>청년 월세 지원 안내</strong>
                    <span>청년의 주거비 부담을 덜어 주는 지원 정보를 확인해 보세요.</span>
                    <a href="${pageContext.request.contextPath}/scenario">관련 연습 보기</a>
                </article>
                <article class="policy-search-result" data-policy-terms="주거 전입 이사 주소">
                    <strong>이사 후 전입신고 안내</strong>
                    <span>전입신고에 필요한 준비와 신청 절차를 살펴보세요.</span>
                    <a href="${pageContext.request.contextPath}/scenario">관련 연습 보기</a>
                </article>
                <article class="policy-search-result" data-policy-terms="장애인 복지 등록">
                    <strong>장애인 등록 신청 안내</strong>
                    <span>신청 전 필요한 서류와 진행 절차를 확인해 보세요.</span>
                    <a href="${pageContext.request.contextPath}/scenario">관련 연습 보기</a>
                </article>
                <p id="policySearchEmpty" class="d-none mb-0 py-3 text-secondary small">검색 결과가 없습니다. 다른 검색어를 입력해 주세요.</p>
            </div>
        </section>
        --%>

        <p class="policy-search-footnote">연습은 안전하게! 모든 시뮬레이션은 학습용이며 실제 민원 접수되지 않습니다.</p>
    </div>
</main>

<jsp:include page="/WEB-INF/views/common/footer.jsp" />
<script src="${pageContext.request.contextPath}/js/pages/home.js"></script>
</body>
</html>
