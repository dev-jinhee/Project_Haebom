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

</head>
<body>
<jsp:include page="/WEB-INF/views/common/header-main.jsp" />

<main id="main-content" class="home-main" data-api-url="${pageContext.request.contextPath}/api/main">
    <section class="hero-section home-hero" aria-labelledby="home-title">
        <div class="container hero-grid">
            <div class="hero-copy">
                <div id="loggedOutView" hidden>
                    <h1 id="home-title">
                        필요한 행정절차를<br>
                        <span>미리 살펴보고 연습해 보세요.</span>
                    </h1>
                    <p>실제 신청 전에 단계별 절차를 안전하게 경험할 수 있어요.</p>
                    <a class="btn btn-light rounded-pill px-4 mt-3"
                       href="${pageContext.request.contextPath}/scenario">
                        연습할 시나리오 선택하기
                    </a>
                </div>

                <div id="loggedInNoProgressView" hidden>
                    <h1>
                        <span id="memberNameNoProgress"></span>님, 오늘도 차근차근<br>
                        <span>한 단계씩 준비해 봐요.</span>
                    </h1>
                    <p>필요한 행정절차를 미리 알고, 실제 신청 전에 단계별로 연습해 보세요.</p>
                    <a class="btn btn-light rounded-pill px-4 mt-3"
                       href="${pageContext.request.contextPath}/scenario">
                        연습할 시나리오 선택하기
                    </a>
                </div>

                <div id="loggedInProgressView" hidden>
                    <h1>
                        <span id="memberNameProgress"></span>님, 오늘도 차근차근<br>
                        <span>한 단계씩 준비해 봐요.</span>
                    </h1>
                    <p>필요한 행정절차를 미리 알고, 실제 신청 전에 단계별로 연습해 보세요.</p>
                    <a class="btn btn-light rounded-pill px-4 mt-3"
                       href="${pageContext.request.contextPath}/scenario">
                        진행 중인 연습 보기
                        <span class="material-symbols-outlined ms-1" aria-hidden="true">arrow_forward</span>
                    </a>
                </div>
            </div>

            <aside class="hero-visual" aria-label="해봄 이용 방법">
                <div id="startGuideCard" class="start-guide" hidden>
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
                
				<div id="recentProgressMount" hidden>
					<!-- 로그인 회원의 진행 중인 시나리오 카드와 그래프를 home.js에서 표시합니다. -->
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
