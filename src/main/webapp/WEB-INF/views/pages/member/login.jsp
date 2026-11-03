<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="해봄 로그인">
    <title>로그인 | 해봄</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/common.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/pages/login.css?v=login-layout-5" rel="stylesheet">
</head>
<body class="login-page">
    <div class="account-screen-tools dropdown">
        <button class="login-size-button dropdown-toggle" type="button" data-bs-toggle="dropdown"
                aria-expanded="false" aria-label="글씨 크기 설정">
            <span data-mode-label>보통</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end text-size-menu" aria-label="글씨 크기 선택">
            <li><button class="dropdown-item active" type="button" data-text-size="normal" aria-pressed="true">보통</button></li>
            <li><button class="dropdown-item" type="button" data-text-size="large" aria-pressed="false">크게</button></li>
            <li><button class="dropdown-item" type="button" data-text-size="larger" aria-pressed="false">더 크게</button></li>
            <li><button class="dropdown-item" type="button" data-text-size="largest" aria-pressed="false">가장 크게</button></li>
        </ul>
    </div>

    <main class="login-shell">
        <a class="login-brand" href="${pageContext.request.contextPath}/" aria-label="해봄 홈">
            <span class="login-brand-mark" aria-hidden="true">
                <span class="material-symbols-outlined">domain</span>
            </span>
            <span class="login-brand-copy">
                <strong>해봄</strong>
                <small>생활 행정절차 미리연습</small>
            </span>
        </a>

        <section class="login-card" aria-labelledby="loginTitle">
            <header class="login-heading">
                <h1 id="loginTitle">로그인</h1>
            </header>

            <c:if test="${param.error != null}">
                <p class="login-error" role="alert">아이디 또는 비밀번호를 확인해 주세요.</p>
            </c:if>

            <form id="loginForm" class="login-form" method="post"
                  action="${pageContext.request.contextPath}/login">
                <div class="login-field">
                    <label for="loginId">아이디</label>
                    <div class="login-input-wrap">
                        <span class="material-symbols-outlined login-input-icon" aria-hidden="true">person</span>
                        <input class="form-control" id="loginId" name="loginId" type="text"
                               autocomplete="username" placeholder="아이디를 입력해 주세요" required autofocus>
                    </div>
                </div>

                <div class="login-field">
                    <label for="loginPassword">비밀번호</label>
                    <div class="login-input-wrap">
                        <span class="material-symbols-outlined login-input-icon" aria-hidden="true">lock</span>
                        <input class="form-control login-password-input" id="loginPassword" name="password"
                               type="password" autocomplete="current-password"
                               placeholder="비밀번호를 입력해 주세요" required>
                        <button class="login-password-toggle" type="button" data-password-toggle
                                aria-label="비밀번호 표시" aria-controls="loginPassword">
                            <span class="material-symbols-outlined" id="loginPasswordToggleIcon" aria-hidden="true">visibility</span>
                        </button>
                    </div>
                </div>

                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}">
                <c:if test="${not empty param.redirect}">
                    <input type="hidden" name="redirect" value="<c:out value='${param.redirect}' />">
                </c:if>

                <div class="login-help-row">
                    <span class="login-help-spacer" aria-hidden="true"></span>
                    <nav class="account-find-links" aria-label="계정 찾기">
                        <a href="${pageContext.request.contextPath}/member/find-id">아이디 찾기</a>
                        <span aria-hidden="true">|</span>
                        <a href="${pageContext.request.contextPath}/member/find-password">비밀번호 찾기</a>
                    </nav>
                </div>

                <button class="btn btn-primary login-submit" type="submit">로그인</button>
            </form>

            <div class="login-divider" aria-hidden="true">또는</div>
            <a class="btn btn-outline-secondary login-signup-link"
               href="${pageContext.request.contextPath}/member/signup">회원가입</a>
        </section>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script src="${pageContext.request.contextPath}/js/common.js"></script>
    <script src="${pageContext.request.contextPath}/js/pages/login.js"></script>
</body>
</html>
