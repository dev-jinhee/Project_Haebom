<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!doctype html>
<html lang="ko" data-bs-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="_csrf" content="${_csrf.token}">
<meta name="_csrf_header" content="${_csrf.headerName}">
<title>관리자 | 해봄</title>
<link
	href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
	rel="stylesheet">
<link
	href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
	rel="stylesheet">
<link
	href="https://cdn.jsdelivr.net/npm/admin-lte@4.10.0/dist/css/adminlte.min.css"
	rel="stylesheet">
<link href="${pageContext.request.contextPath}/css/common.css"
	rel="stylesheet">
<link href="${pageContext.request.contextPath}/css/pages/admin.css"
	rel="stylesheet">
</head>
<body class="layout-fixed sidebar-expand-lg bg-body-tertiary admin-page">
	<div class="app-wrapper">
		<!-- 상단 네비게이션 헤더 -->
		<nav class="app-header navbar navbar-expand bg-body">
			<div class="container-fluid">
				<a class="nav-link" data-lte-toggle="sidebar" href="#"
					aria-label="관리 메뉴 열기"><i class="bi bi-list"></i></a>
				<div class="admin-header-title-wrap">
					<h1 class="admin-header-page-title" data-admin-page-title
						aria-live="polite">이용 현황</h1>
					<span class="admin-demo-badge d-none" data-admin-demo-badge>데모 데이터</span>
				</div>
				<ul class="navbar-nav ms-auto align-items-center">
					<li class="nav-item dropdown d-none d-md-block">
						<button class="nav-link dropdown-toggle" type="button"
							data-bs-toggle="dropdown" aria-expanded="false"
							aria-label="글씨 크기 설정">
							<i class="bi bi-fonts me-1" aria-hidden="true"></i><span
								data-mode-label>보통</span>
						</button>
						<ul class="dropdown-menu dropdown-menu-end text-size-menu"
							aria-label="글씨 크기 선택">
							<li><button class="dropdown-item active" type="button"
									data-text-size="normal" aria-pressed="true">보통</button></li>
							<li><button class="dropdown-item" type="button"
									data-text-size="large" aria-pressed="false">크게</button></li>
							<li><button class="dropdown-item" type="button"
									data-text-size="larger" aria-pressed="false">더 크게</button></li>
							<li><button class="dropdown-item" type="button"
									data-text-size="largest" aria-pressed="false">가장 크게</button></li>
						</ul>
					</li>
					<li class="nav-item"><span class="nav-link">관리자 계정</span></li>
				</ul>
			</div>
		</nav>

		<!-- 좌측 사이드바 (LNB) -->
		<aside class="app-sidebar bg-primary-subtle" data-bs-theme="dark">
			<div class="sidebar-brand">
				<a href="${pageContext.request.contextPath}/admin"
					class="brand-link"><span class="brand-image" aria-hidden="true"><img
						class="admin-sidebar-logo-icon"
						src="${pageContext.request.contextPath}/images/logo-icon.png"
						alt=""></span><span class="brand-text">해봄 관리</span></a>
			</div>
			<div class="sidebar-wrapper">
				<nav class="mt-2">
					<ul class="nav sidebar-menu flex-column">
						<li class="nav-header">OVERVIEW</li>
						<li class="nav-item"><a href="#dashboard"
							class="nav-link active" data-admin-nav="dashboard"
							aria-current="page"><i class="nav-icon bi bi-grid-1x2"></i>
							<p>이용 현황</p></a></li>
						<li class="nav-header admin-nav-header-secondary">MANAGEMENT</li>
						<li class="nav-item"><a href="#members" class="nav-link"
							data-admin-nav="members"><i class="nav-icon bi bi-people"></i>
							<p>회원</p></a></li>
						<li class="nav-item"><a href="#admins" class="nav-link"
							data-admin-nav="admins"><i
								class="nav-icon bi bi-shield-lock"></i>
							<p>관리자</p></a></li>
						<li class="nav-item"><a href="#scenarios" class="nav-link"
							data-admin-nav="scenarios"><i
								class="nav-icon bi bi-diagram-3"></i>
							<p>시나리오</p></a></li>
						<li class="nav-item"><a href="#inquiries-admin"
							class="nav-link" data-admin-nav="inquiries"><i
								class="nav-icon bi bi-chat-left-text"></i>
							<p>
									문의 게시판<span class="admin-nav-badge"
										id="adminSidebarInquiryBadge">0</span>
								</p></a></li>
						<li class="nav-item admin-home-item"><a
							href="${pageContext.request.contextPath}/" class="nav-link"><i
								class="nav-icon bi bi-house-door"></i>
							<p>서비스 홈</p></a></li>
					</ul>
				</nav>
			</div>
		</aside>

		<!-- 메인 컨텐츠 영역 -->
		<main class="app-main" id="dashboard">
			<div class="app-content pt-3 pb-4">
				<div class="container-fluid">
					<!-- 1. 이용 현황 (대시보드) -->
					<jsp:include page="sections/section-dashboard.jsp" />

					<!-- 2. 회원 목록 -->
					<jsp:include page="sections/section-members.jsp" />

					<!-- 3. 관리자 목록 -->
					<jsp:include page="sections/section-admins.jsp" />

					<!-- 4. 문의 게시판 -->
					<jsp:include page="sections/section-inquiries.jsp" />

					<!-- 5. 시나리오 목록 -->
					<jsp:include page="sections/section-scenarios.jsp" />
				</div>
			</div>
		</main>

		<footer class="app-footer">
			<strong>해봄 관리자</strong>
		</footer>
	</div>


	<!-- ======================================================== -->
	<!-- [모달 팝업] 기능별 상세 및 등록 모달 -->
	<!-- ======================================================== -->
	<jsp:include page="modals/modal-scenario-detail.jsp" />
	<jsp:include page="modals/modal-member-detail.jsp" />
	<jsp:include page="modals/modal-inquiry-detail.jsp" />
	<jsp:include page="modals/modal-admin-register.jsp" />

	<div class="toast-container position-fixed bottom-0 end-0 p-3">
		<div id="siteToast" class="toast" role="status">
			<div class="toast-body">
				<span id="toastMessage"></span>
			</div>
		</div>
	</div>

	<!-- 스크립트 라이브러리 -->
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
	<script
		src="https://cdn.jsdelivr.net/npm/admin-lte@4.10.0/dist/js/adminlte.min.js"></script>
	<!-- SheetJS (Excel 내보내기 전용 라이브러리) -->
	<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
	<script src="${pageContext.request.contextPath}/js/app.js"></script>
	<script src="${pageContext.request.contextPath}/js/common.js"></script>
	<!-- 관리자 기능별 모듈 스크립트 -->
	<script src="${pageContext.request.contextPath}/js/pages/admin/admin-dashboard.js?v=<%= System.currentTimeMillis() %>"></script>
	<script src="${pageContext.request.contextPath}/js/pages/admin/admin-scenarios.js?v=<%= System.currentTimeMillis() %>"></script>
	<script src="${pageContext.request.contextPath}/js/pages/admin/admin-members.js?v=<%= System.currentTimeMillis() %>"></script>
	<script src="${pageContext.request.contextPath}/js/pages/admin/admin-inquiries.js?v=<%= System.currentTimeMillis() %>"></script>
	<script src="${pageContext.request.contextPath}/js/pages/admin/admin-admins.js?v=<%= System.currentTimeMillis() %>"></script>
	<script src="${pageContext.request.contextPath}/js/pages/admin/admin.js?v=<%= System.currentTimeMillis() %>"></script>
	<script
		src="${pageContext.request.contextPath}/js/pages/demo-actions.js"></script>
</body>
</html>
