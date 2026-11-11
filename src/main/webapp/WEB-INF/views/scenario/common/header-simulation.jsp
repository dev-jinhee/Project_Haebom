<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<!-- [해봄 시뮬레이션 체험 전용 헤더 (header-simulation.jsp)] -->
<!-- 시뮬레이션 연습 진행 화면(simulation.jsp)에서 사용하는 상단 바 (나가기) -->
<meta name="_csrf" content="${_csrf.token}">
<meta name="_csrf_header" content="${_csrf.headerName}">
<header class="sim-topbar sticky-top">
	<div
		class="container d-flex align-items-center justify-content-between py-3">
		<!-- 브랜드 로고 -->
		<a class="navbar-brand d-flex align-items-center gap-2"
			href="${pageContext.request.contextPath}/">
			<span class="brand-mark" aria-hidden="true">
				<img class="brand-logo-icon" src="${pageContext.request.contextPath}/images/logo-icon.png" alt="">
			</span>
			<span class="brand-wordmark-wrap">
				<img class="brand-logo-wordmark" src="${pageContext.request.contextPath}/images/logo-text.png" alt="해봄">
				<small class="d-block">생활 행정절차 미리연습</small>
			</span>
		</a>

		<!-- 우측 액션 메뉴 -->
		<div class="d-flex align-items-center flex-wrap gap-2 header-actions">
			<!-- 시뮬레이션 나가기 버튼 -->
			<a class="btn btn-outline-secondary rounded-pill d-inline-flex align-items-center"
				href="${pageContext.request.contextPath}/" aria-label="연습 종료하고 홈으로">
				<span class="material-symbols-outlined me-1" aria-hidden="true">logout</span>나가기
			</a>
		</div>
	</div>
</header>
