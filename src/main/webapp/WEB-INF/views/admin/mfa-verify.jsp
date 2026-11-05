<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="해봄 관리자 2단계 인증">
    <title>관리자 2단계 인증 | 해봄</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/common.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/pages/login.css" rel="stylesheet">
</head>
<body class="login-page">
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

        <section class="login-card" aria-labelledby="mfaVerifyTitle">
            <header class="login-heading">
                <h1 id="mfaVerifyTitle">관리자 2단계 인증</h1>
            </header>

            <c:if test="${not empty param.error}">
                <p class="mfa-error" role="alert">인증번호가 맞지 않습니다. 다시 확인해 주세요.</p>
            </c:if>

            <form class="login-form" method="post"
                  action="${pageContext.request.contextPath}/admin/mfa/verify">
                <div class="mfa-code-field">
                    <label for="code">인증번호</label>
                    <input class="form-control mfa-code-input" id="code" name="code"
                           type="text" inputmode="numeric" autocomplete="one-time-code"
                           pattern="[0-9]{6}" minlength="6" maxlength="6"
                           placeholder="••••••" aria-describedby="mfaCodeHelp" required autofocus>
                </div>

                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}">
                <button class="btn btn-primary login-submit" type="submit">인증하고 관리자 화면으로 이동</button>
            </form>
        </section>
    </main>
</body>
</html>
