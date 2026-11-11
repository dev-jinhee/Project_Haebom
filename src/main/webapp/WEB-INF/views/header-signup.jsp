<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!-- 회원가입 화면 전용 헤더: 브랜드와 로그인 이동을 제공합니다. -->
<meta name="_csrf" content="${_csrf.token}">
<meta name="_csrf_header" content="${_csrf.headerName}">
<header class="site-header sticky-top">
    <nav class="navbar container py-3">
        <a class="navbar-brand d-flex align-items-center gap-2" href="${pageContext.request.contextPath}/" aria-label="해봄 홈">
            <span class="brand-mark" aria-hidden="true">
                <img class="brand-logo-icon" src="${pageContext.request.contextPath}/images/logo-icon.png" alt="">
            </span>
            <span class="brand-wordmark-wrap">
                <img class="brand-logo-wordmark" src="${pageContext.request.contextPath}/images/logo-text.png" alt="해봄">
                <small class="d-block">생활 행정절차 미리연습</small>
            </span>
        </a>

        <div class="d-flex align-items-center flex-wrap gap-2 ms-auto header-actions">
            <a class="btn btn-outline-primary rounded-pill d-inline-flex align-items-center" href="${pageContext.request.contextPath}/login">
                <span class="material-symbols-outlined me-1" aria-hidden="true">login</span><span>로그인</span>
            </a>
        </div>
    </nav>
</header>
