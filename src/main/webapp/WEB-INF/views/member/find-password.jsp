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
    <link href="${pageContext.request.contextPath}/css/pages/login.css" rel="stylesheet">
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

        <section class="login-card account-find-card" aria-labelledby="findPasswordTitle">
            <header class="account-find-heading">
                <span class="login-symbol material-symbols-outlined" aria-hidden="true">lock_reset</span>
                <h1 id="findPasswordTitle">비밀번호 찾기</h1>
                <p>가입 정보 확인을 위해 아이디, 이름, 이메일을 입력해 주세요.</p>
            </header>

            <form class="account-find-form" method="post"
                  action="${pageContext.request.contextPath}/member/find-password">
                <div class="mb-3">
                    <label class="form-label" for="loginId">아이디</label>
                    <input class="form-control" id="loginId" name="loginId" type="text"
                           autocomplete="username" placeholder="아이디를 입력해 주세요" required>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="memberName">이름</label>
                    <input class="form-control" id="memberName" name="memberName" type="text"
                           autocomplete="name" placeholder="이름을 입력해 주세요" required>
                </div>
                <div class="mb-4">
                    <label class="form-label" for="email">이메일</label>
                    <input class="form-control" id="email" name="email" type="email"
                           autocomplete="email" placeholder="가입한 이메일을 입력해 주세요" required>
                </div>

                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}">
                <button class="btn btn-primary login-submit w-100" type="submit">비밀번호 찾기</button>
            </form>

            <div class="text-center mt-3">
                <a class="back-link d-inline-block mt-0" href="${pageContext.request.contextPath}/login">로그인으로 돌아가기</a>
            </div>
        </section>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script src="${pageContext.request.contextPath}/js/common.js"></script>
</body>
</html>
