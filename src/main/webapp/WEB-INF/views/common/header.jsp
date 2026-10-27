<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<!-- [해봄 공통 서브 헤더 (header.jsp)] -->
<!-- 문의게시판, 시나리오, 마이페이지 등 모든 일반 서브 페이지용 표준 헤더 -->
<header class="site-header sticky-top">
    <nav class="navbar container py-3">
        <!-- 브랜드 로고 -->
        <a class="navbar-brand d-flex align-items-center gap-2" href="${pageContext.request.contextPath}/">
            <span class="brand-mark"><span class="material-symbols-outlined" aria-hidden="true">domain_verification</span></span>
            <span>
                <strong>해봄</strong>
                <small class="d-block">생활 행정절차 미리연습</small>
            </span>
        </a>

        <!-- 우측 액션 메뉴 (피그마 서브 공통 규격: 글씨 크기 + 홈으로) -->
        <div class="d-flex align-items-center gap-2 ms-auto">
            <!-- 글씨 크기 조절 드롭다운 (피그마 '보통') -->
            <div class="dropdown">
                <button class="btn btn-access dropdown-toggle d-inline-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="글씨 크기 설정" title="글씨 크기 설정">
                <span class="material-symbols-outlined me-1" aria-hidden="true">text_fields</span><span data-mode-label>보통</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end text-size-menu" aria-label="글씨 크기 선택">
                    <li><button class="dropdown-item active" type="button" data-text-size="normal" aria-pressed="true">보통</button></li>
                    <li><button class="dropdown-item" type="button" data-text-size="large" aria-pressed="false">크게</button></li>
                    <li><button class="dropdown-item" type="button" data-text-size="largest" aria-pressed="false">가장 크게</button></li>
                </ul>
            </div>

            <!-- 홈으로 이동 버튼 (집 모양 아이콘) -->
            <a href="${pageContext.request.contextPath}/" class="btn btn-outline-secondary rounded-pill d-inline-flex align-items-center">
                <span class="material-symbols-outlined me-1" aria-hidden="true">home</span>홈으로
            </a>
        </div>
    </nav>
</header>
