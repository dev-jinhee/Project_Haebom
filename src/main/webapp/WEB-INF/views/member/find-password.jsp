<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="해봄 비밀번호 찾기">
    <title>비밀번호 찾기 | 해봄</title>

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

        <section class="login-card account-find-card" aria-labelledby="findPasswordTitle"
                 data-context-path="${pageContext.request.contextPath}">
            <header class="login-heading">
                <h1 id="findPasswordTitle">비밀번호 찾기</h1>
            </header>

            <div class="account-find-form" id="passwordRecoveryForm">
                <div class="login-field mb-3">
                    <label for="loginId">아이디</label>
                    <div class="login-input-wrap">
                        <span class="material-symbols-outlined login-input-icon" aria-hidden="true">person</span>
                        <input class="form-control" id="loginId" name="loginId" type="text"
                               autocomplete="username" minlength="4" maxlength="16"
                               placeholder="아이디를 입력해 주세요" required>
                    </div>
                </div>
                <div class="login-field mb-3">
                    <label for="memberName">이름</label>
                    <div class="login-input-wrap">
                        <span class="material-symbols-outlined login-input-icon" aria-hidden="true">person</span>
                        <input class="form-control" id="memberName" name="memberName" type="text"
                               autocomplete="name" maxlength="20"
                               placeholder="이름을 입력해 주세요" required>
                    </div>
                </div>
                <div class="login-field mb-3">
                    <label for="email">이메일</label>
                    <div class="input-group account-find-input-group">
                        <div class="login-input-wrap">
                            <span class="material-symbols-outlined login-input-icon" aria-hidden="true">mail</span>
                            <input class="form-control" id="email" name="email" type="email"
                                   autocomplete="email" maxlength="50"
                                   placeholder="회원가입 시 등록한 이메일을 입력해 주세요" required>
                        </div>
                        <button class="btn btn-outline-primary" id="sendCodeButton" type="button">
                            인증번호 받기
                        </button>
                    </div>
                    <p class="account-find-status" id="sendCodeStatus" aria-live="polite"></p>
                </div>

                <div id="verificationSection" hidden>
                    <div class="login-field mb-3">
                        <label for="verificationCode">인증번호</label>
                        <div class="input-group account-find-input-group">
                            <div class="login-input-wrap">
                                <span class="material-symbols-outlined login-input-icon" aria-hidden="true">pin</span>
                                <input class="form-control" id="verificationCode" name="code" type="text"
                                       inputmode="numeric" autocomplete="one-time-code" maxlength="6"
                                       pattern="[0-9]{6}" placeholder="인증번호 6자리를 입력해 주세요"
                                       aria-label="이메일 인증번호">
                            </div>
                            <button class="btn btn-outline-primary" id="confirmCodeButton" type="button">
                                인증 확인
                            </button>
                        </div>
                        <p class="account-find-status" id="verifyCodeStatus" aria-live="polite"></p>
                    </div>
                </div>

                <input type="hidden" id="csrfToken" name="${_csrf.parameterName}"
                       value="${_csrf.token}" data-header="${_csrf.headerName}">
            </div>
        </section>

        <section class="login-card account-find-card account-reset-card" id="resetPasswordCard"
                 aria-labelledby="resetPasswordTitle" hidden>
            <header class="login-heading">
                <h1 id="resetPasswordTitle">새 비밀번호 설정</h1>
            </header>

            <section id="resetPasswordSection">
                <p class="account-find-help" id="verifiedAccountSummary"></p>
                <div class="login-field mb-3">
                    <label for="newPassword">새 비밀번호</label>
                    <div class="login-input-wrap">
                        <span class="material-symbols-outlined login-input-icon" aria-hidden="true">lock</span>
                        <input class="form-control" id="newPassword" name="newPassword" type="password"
                               autocomplete="new-password" minlength="8" maxlength="20"
                               placeholder="8~20자로 입력해 주세요" required>
                    </div>
                </div>
                <div class="login-field mb-3">
                    <label for="passwordConfirm">새 비밀번호 확인</label>
                    <div class="login-input-wrap">
                        <span class="material-symbols-outlined login-input-icon" aria-hidden="true">lock</span>
                        <input class="form-control" id="passwordConfirm" name="passwordConfirm" type="password"
                               autocomplete="new-password" minlength="8" maxlength="20"
                               placeholder="새 비밀번호를 다시 입력해 주세요" required>
                    </div>
                </div>
                <p class="account-find-help">&gt;, &lt;, _, -, ", ' 문자는 사용할 수 없습니다.</p>
                <p class="account-find-status" id="resetPasswordStatus" aria-live="polite"></p>
                <button class="btn btn-primary login-submit w-100" id="resetPasswordButton" type="button">
                    비밀번호 변경
                </button>
            </section>

            <section class="account-find-result" id="passwordRecoveryComplete" aria-live="polite" hidden>
                <span class="account-result-icon material-symbols-outlined" aria-hidden="true">check</span>
                <h2>비밀번호가 변경되었습니다.</h2>
                <p>새 비밀번호로 로그인해 주세요.</p>
                <div class="account-find-result-actions">
                    <a class="btn btn-primary login-submit" href="${pageContext.request.contextPath}/login">로그인하기</a>
                </div>
            </section>
        </section>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script src="${pageContext.request.contextPath}/js/common.js"></script>
    <script src="${pageContext.request.contextPath}/js/pages/find-password.js?v=reset-card-1"></script>
</body>
</html>
