<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>시뮬레이션 | 해봄</title>
<!-- Bootstrap -->
<link
	href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
	rel="stylesheet">
<link
	href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
	rel="stylesheet">
<!-- 공통 / 시뮬레이션 CSS -->
<link href="/css/app.css" rel="stylesheet">
<link href="/css/pages/scenario/simulation/simulation.css"
	rel="stylesheet">
	<link href="/css/pages/scenario/simulation/move.css"
	rel="stylesheet">
</head>
<body class="simulation-page">
	<!-- 공통 헤더 -->
	<jsp:include
		page="/WEB-INF/views/scenario/common/header-simulation.jsp" />

	<main class="container sim-container">

		<!-- 브레드크럼 -->
		<div class="sim-breadcrumb">
			<a href="${pageContext.request.contextPath}/scenario"> 시나리오 목록 </a> <i
				class="bi bi-chevron-right" aria-hidden="true"></i> <span
				id="breadcrumbScenarioTitle"></span>
		</div>

		<!-- 시나리오 정보 -->
		<div class="sim-title-row">
			<div>
				<span class="eyebrow" id="scenarioCategory"></span>
				<h1 id="scenarioTitle"></h1>
				<p id="scenarioDescription"></p>
			</div>

			<div class="sim-title-actions">
				<span class="learning-badge"> <i
					class="bi bi-info-circle-fill" aria-hidden="true"></i> 학습용 · 실제 신청
					아님
				</span>
			</div>
		</div>

		<!-- 공통 진행 단계 -->
		<div class="sim-progress-card">

			<div
				class="d-flex justify-content-between align-items-center gap-3 mb-2">
				<div class="sim-progress-heading" role="status" aria-live="polite">

					<strong id="stepTitle"></strong> <span> 현재 <b
						id="stepCurrent">0</b> / <span id="stepTotal">0</span>단계
					</span>
				</div>
			</div>
			<!-- 진행률, 단계 목록 -->
			<div class="progress" role="progressbar" aria-label="시뮬레이션 진행률"
				aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">

				<div class="progress-bar" id="stepProgress" style="width: 0%"></div>
			</div>
			<!-- 단계 목록 : JS에서 동적으로 생성 -->
			<div class="step-labels" id="stepLabels"></div>

		</div>

		<!-- 단계별 콘텐츠 영역 -->
		<div class="row g-4 sim-layout">
			<div class="col-12">

				<section class="sim-card gov24-sim-card"
					aria-labelledby="currentQuestion">

					<!-- 현재 단계 제목 -->
					<div class="sim-card-head">

						<span class="question-icon" id="questionIcon"> <i
							class="bi bi-info-circle" aria-hidden="true"></i>
						</span>

						<div>
							<!-- <span class="eyebrow"
                                  id="questionEyebrow"></span> -->

							<h2 id="currentQuestion"></h2>
						</div>
					</div>

					<!-- 단계별 안내 문구 -->
					<p class="question-help d-none" id="questionHelp"></p>

					<!-- 검증 메시지 -->
					<div class="sim-validation d-none" id="validationMessage"
						role="alert">

						<i class="bi bi-exclamation-circle-fill me-2" aria-hidden="true"></i>
						<span></span>
					</div>

					<!-- 단계별 JSP 콘텐츠가 들어올 영역 -->
					<div id="stepContent" class="sim-step-content"></div>

					<!-- 공통 이전 / 다음 버튼 -->
					<div id="simulationNavigation">
						<jsp:include
							page="/WEB-INF/views/scenario/common/navigation-simulation.jsp" />
					</div>

				</section>
			</div>
		</div>


	</main>
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
	<script src="/js/common.js"></script>
	<script src="/js/pages/scenario/simulation/simulation.js" defer></script>

</body>
</html>