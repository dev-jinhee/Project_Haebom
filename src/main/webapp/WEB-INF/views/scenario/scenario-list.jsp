<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>행정절차 연습 | 해봄</title>
<link
	href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
	rel="stylesheet">
<link href="/css/common.css" rel="stylesheet">
<link href="/css/pages/scenario/scenario-list.css" rel="stylesheet">
</head>
<body>
	<jsp:include page="/WEB-INF/views/common/header.jsp" />

	<main class="container subpage-container scenarios-page">
		<div class="subpage-heading">
			<div class="breadcrumb-line">
				<a href="/">홈</a><span class="material-symbols-outlined">
					chevron_right </span><span>행정절차 연습</span>
			</div>

			<h1>어떤 절차를 연습할까요?</h1>
			<p>원하는 행정서비스를 골라 신청 흐름을 단계별로 미리 연습해 보세요.</p>
		</div>

		<section class="content-panel mt-4"
			aria-labelledby="scenarioListTitle">
			<div class="scenario-list-heading">
				<div>
					<h2 id="scenarioListTitle">연습할 시나리오</h2>
				</div>
				<label class="scenario-search"> <span
					class="material-symbols-outlined"> search </span> <span
					class="visually-hidden">시나리오 검색</span> <input id="scenarioSearch"
					type="search" class="form-control" placeholder="시나리오 이름으로 찾기"
					autocomplete="off">
				</label>
			</div>

			<div class="scenario-catalog" id="scenarioCatalog"
				data-api-url="${pageContext.request.contextPath}/api/scenario">

				<p class="scenario-empty d-none" id="scenarioSearchEmpty"
					role="status">검색 결과가 없어요. 다른 이름으로 찾아보세요.</p>
			</div>

			<div class="scenario-coming-soon">
				<span><span class="material-symbols-outlined">
						add_circle </span></span>
				<div>
					<strong>새로운 시나리오를 준비하고 있어요</strong>
					<p>절차가 추가되면 이 목록에서 골라 연습할 수 있어요.</p>
				</div>
			</div>
		</section>

		<div class="home-bottom-note mt-4">
			<span class="material-symbols-outlined"> info </span><span><strong>안전한
					연습</strong>해봄의 시뮬레이션은 학습용이며 실제 민원은 접수되지 않습니다.</span>
		</div>

		<!-- 시나리오 카드 템플릿 -->
		<template id="scenarioCardTemplate">

			<article class="scenario-card scenario-item">

				<!-- 왼쪽 콘텐츠 -->
				<div class="scenario-card-content">

					<!-- 아이콘 + 카테고리 + 제목 -->
					<div class="scenario-card-header">

						<div class="scenario-card-icon">
							<span class="material-symbols-outlined" aria-hidden="true">home</span>
						</div>

						<div class="scenario-card-heading">

							<div class="scenario-card-labels">
								<span
									class="badge rounded-pill text-bg-primary-subtle text-primary"
									data-scenario-category> 카테고리 </span> <span
									class="scenario-state d-none" data-scenario-state></span>
							</div>

							<h3 data-scenario-title>시나리오 이름</h3>

						</div>
					</div>

					<!-- 설명 -->
					<p data-scenario-description>시나리오 설명입니다.</p>

					<!-- 메타 정보 -->
					<div class="scenario-meta">

						<span data-scenario-step-count> <span
							class="material-symbols-outlined" aria-hidden="true">format_list_numbered</span>
							5단계
						</span> <span data-scenario-estimated-minutes> <span
							class="material-symbols-outlined" aria-hidden="true">schedule</span>
							예상 4분
						</span> <span> <span class="material-symbols-outlined"
							aria-hidden="true">verified_user</span> 연습용 · 실제 접수되지 않아요
						</span>

					</div>

					<!-- 진행률 -->
					<div class="scenario-progress d-none" data-scenario-progress>

						<div class="d-flex justify-content-between small">
							<span data-scenario-progress-caption> 진행 중인 연습 </span> <strong
								data-scenario-progress-percent>0%</strong>
						</div>

						<div class="progress mt-2" role="progressbar"
							aria-label="전입신고 연습 진행률">

							<div class="progress-bar" data-scenario-progress-bar
								style="width: 0%"></div>

						</div>
					</div>

				</div>

				<!-- 오른쪽 버튼: 기존 위치 유지 -->
				<div class="scenario-actions">

					<button class="btn btn-primary rounded-pill scenario-start"
						data-scenario-action>연습 시작하기</button>

					<button class="btn btn-outline-primary rounded-pill d-none"
						type="button" data-scenario-restart>처음부터 하기</button>

					<button class="btn btn-outline-danger rounded-pill d-none"
						type="button" data-scenario-delete>진행 내용 삭제</button>

				</div>

			</article>


		</template>
	</main>

	<jsp:include page="/WEB-INF/views/common/footer.jsp" />
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
	<script src="/js/common.js"></script>
	<script src="/js/pages/demo-actions.js"></script>
	<script src="/js/pages/scenario/scenario-progress.js"></script>

	<!-- defer 추가 시 html 구성 완료 후 js 실행 -->
	<script src="/js/pages/scenario/scenario-list.js" defer>
		
	</script>
</body>
</html>
