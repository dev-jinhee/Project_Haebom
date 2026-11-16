<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

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

        <section class="login-card" aria-labelledby="mfaSetupTitle">
            <header class="login-heading">
                <h1 id="mfaSetupTitle">관리자 OTP 등록</h1>
            </header>

            <c:if test="${not empty param.error}">
                <p class="mfa-error" role="alert">인증번호가 맞지 않습니다. 앱에 표시된 최신 번호를 입력해 주세요.</p>
            </c:if>

            <p class="mfa-account">등록 계정: <strong><c:out value="${loginId}" /></strong></p>

            <div class="mfa-qr-panel">
                <img class="mfa-qr-image" src="${qrDataUri}" alt="관리자 OTP 등록 QR 코드">
            </div>

            <form class="login-form" method="post"
                  action="${pageContext.request.contextPath}/admin/mfa/setup">
                <div class="mfa-code-field">
                    <label for="code">인증번호</label>
                    <input class="form-control mfa-code-input" id="code" name="code"
                           type="text" inputmode="numeric" autocomplete="one-time-code"
                           pattern="[0-9]{6}" minlength="6" maxlength="6"
                           placeholder="••••••" aria-describedby="mfaCodeHelp" required autofocus>
                </div>

                <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}">
                <button class="btn btn-primary login-submit" type="submit">등록하고 로그인</button>
            </form>
        </section>
    </main>
