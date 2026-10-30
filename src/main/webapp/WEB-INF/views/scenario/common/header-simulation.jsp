<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<!-- [해봄 시뮬레이션 체험 전용 헤더 (header-simulation.jsp)] -->
<!-- 시뮬레이션 연습 진행 화면(simulation.jsp)에서 사용하는 상단 바 (글씨 크기 + 나가기) -->
<meta name="_csrf" content="${_csrf.token}">
<meta name="_csrf_header" content="${_csrf.headerName}">
<header class="sim-topbar sticky-top">
	<div
		class="container d-flex align-items-center justify-content-between py-3">
		<!-- 브랜드 로고 -->
		<a class="navbar-brand d-flex align-items-center gap-2"
			href="${pageContext.request.contextPath}/"> <span
			class="brand-mark"><span class="material-symbols-outlined"
				aria-hidden="true">domain_verification</span></span> <span> <strong>해봄</strong>
				<small class="d-block">생활 행정절차 미리연습</small>
		</span>
		</a>

		<!-- 우측 액션 메뉴 -->
		<div class="d-flex align-items-center gap-2">
			<!-- 글씨 크기 조절 드롭다운 (피그마 '보통') -->
			<div class="dropdown">
				<button
					class="btn btn-access dropdown-toggle d-inline-flex align-items-center"
					type="button" data-bs-toggle="dropdown" aria-expanded="false"
					aria-label="글씨 크기 설정" title="글씨 크기 설정">
					<span class="material-symbols-outlined me-1" aria-hidden="true">text_fields</span><span
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
			</div>

			<!-- 시뮬레이션 나가기 버튼 -->
			<a class="btn btn-outline-secondary rounded-pill d-inline-flex align-items-center"
				href="${pageContext.request.contextPath}/" aria-label="연습 종료하고 홈으로">
				<span class="material-symbols-outlined me-1" aria-hidden="true">logout</span>나가기
			</a>
		</div>
	</div>
</header>
