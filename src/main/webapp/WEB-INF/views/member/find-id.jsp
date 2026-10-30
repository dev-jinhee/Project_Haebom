<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="해봄 아이디 찾기">
    <title>아이디 찾기 | 해봄</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/common.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/pages/login.css?v=login-layout-6" rel="stylesheet">
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

        <section class="login-card account-find-card" aria-labelledby="findIdTitle"
                 data-context-path="${pageContext.request.contextPath}">
            <header class="login-heading">
                <h1 id="findIdTitle">아이디 찾기</h1>
            </header>

            <div class="account-find-form" id="findIdForm">
                <div class="login-field mb-3">
                    <label for="memberName">이름</label>
                    <div class="login-input-wrap">
                        <span class="material-symbols-outlined login-input-icon" aria-hidden="true">person</span>
                        <input class="form-control" id="memberName" name="memberName" type="text"
                               autocomplete="name" placeholder="이름을 입력해 주세요" required>
                    </div>
                </div>
                <div class="login-field mb-4">
                    <label for="email">이메일</label>
                    <div class="input-group account-find-input-group">
                        <div class="login-input-wrap">
                            <span class="material-symbols-outlined login-input-icon" aria-hidden="true">mail</span>
                            <input class="form-control" id="email" name="email" type="email"
                                   autocomplete="email" placeholder="가입한 이메일을 입력해 주세요" required>
                        </div>
                        <button class="btn btn-outline-primary" id="sendCodeButton" type="button"
                                data-find-id-send-code>인증번호 받기</button>
                    </div>
                    <p class="account-find-status" id="sendCodeStatus" aria-live="polite"></p>
                </div>

                <div class="login-field mb-3" id="verificationSection" hidden>
                    <label for="verificationCode">인증번호</label>
                    <div class="input-group account-find-input-group">
                        <div class="login-input-wrap">
                            <span class="material-symbols-outlined login-input-icon" aria-hidden="true">pin</span>
                            <input class="form-control" id="verificationCode" name="code" type="text"
                                   inputmode="numeric" autocomplete="one-time-code" maxlength="6"
                                   pattern="[0-9]{6}" required
                                   placeholder="인증번호 6자리를 입력해 주세요" aria-label="이메일 인증번호">
                        </div>
                        <button class="btn btn-outline-primary" id="confirmCodeButton" type="button"
                                data-find-id-confirm-code>인증 확인</button>
                    </div>
                    <p class="account-find-status" id="verifyCodeStatus" aria-live="polite"></p>
                </div>
                <input type="hidden" id="csrfToken" name="${_csrf.parameterName}"
                       value="${_csrf.token}" data-header="${_csrf.headerName}">
            </div>

            <section class="account-find-result" id="findIdResult" aria-live="polite" hidden>
                <span class="account-result-icon material-symbols-outlined" aria-hidden="true">check</span>
                <h2>이메일 인증이 완료되었습니다.</h2>
                <div class="account-found-value">
                    <span>가입된 아이디</span>
                    <strong id="foundLoginId"></strong>
                </div>
            </section>

            <div class="account-find-result-actions" id="findIdResultActions" hidden>
                <a class="btn btn-primary login-submit" href="${pageContext.request.contextPath}/login">로그인하기</a>
                <a class="btn btn-outline-primary" href="${pageContext.request.contextPath}/member/find-password">비밀번호 찾기</a>
            </div>
        </section>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script src="${pageContext.request.contextPath}/js/common.js"></script>
    <script src="${pageContext.request.contextPath}/js/pages/find-id.js"></script>
</body>
</html>
