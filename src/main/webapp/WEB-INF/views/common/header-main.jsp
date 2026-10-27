<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<!-- [해봄 메인 홈 전용 헤더 (header-main.jsp)] -->
<!-- 메인 홈 화면(main.jsp)에서만 사용하는 풀 메뉴 헤더 -->
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

        <!-- 우측 액션 메뉴 (메인 풀 메뉴: 관리자 + 글씨 크기 + 마이페이지 + 로그인/로그아웃) -->
        <div class="d-flex align-items-center gap-2 ms-auto">
            <!-- 관리자(ADMIN) 권한이 있는 경우에만 관리자 페이지 버튼 노출 (개발 테스트용 ?role=admin 허용) -->
            <%
            	boolean isAdmin = request.isUserInRole("ROLE_ADMIN")
            					|| request.isUserInRole("ADMIN") 
            					|| "admin".equals(request.getParameter("role"));
            %>
            <c:if test="<%= isAdmin %>">
                <a class="btn btn-outline-secondary rounded-pill d-inline-flex align-items-center" href="${pageContext.request.contextPath}/admin">
                    <span class="material-symbols-outlined me-1" aria-hidden="true">space_dashboard</span><span>관리자 페이지</span>
                </a>
            </c:if>

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

            <!-- 로그인 여부에 따른 버튼 분기 -->
            <c:choose>
                <c:when test="${not empty pageContext.request.userPrincipal}">
                    <a class="btn btn-outline-primary rounded-pill d-inline-flex align-items-center" href="${pageContext.request.contextPath}/mypage">
                        <span class="material-symbols-outlined me-1" aria-hidden="true">account_circle</span><span>마이페이지</span>
                    </a>
                    <form class="d-inline" method="post" action="${pageContext.request.contextPath}/logout">
                        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}">
                        <button class="btn btn-light rounded-pill d-inline-flex align-items-center" type="submit">
                            <span class="material-symbols-outlined me-1" aria-hidden="true">logout</span><span>로그아웃</span>
                        </button>
                    </form>
                </c:when>
                <c:otherwise>
                    <a class="btn btn-outline-primary rounded-pill d-inline-flex align-items-center" href="${pageContext.request.contextPath}/mypage">
                        <span class="material-symbols-outlined me-1" aria-hidden="true">account_circle</span><span>마이페이지</span>
                    </a>
                    <a class="btn btn-light rounded-pill d-inline-flex align-items-center" href="${pageContext.request.contextPath}/login">
                        <span class="material-symbols-outlined me-1" aria-hidden="true">login</span><span>로그인</span>
                    </a>
                </c:otherwise>
            </c:choose>
        </div>
    </nav>
</header>
