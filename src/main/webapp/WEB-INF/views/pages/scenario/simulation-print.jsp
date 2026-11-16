<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<main id="simulationPrint" class="container sim-container">
		<header class="print-header">
			<div class="print-brand">해봄 · 행정절차 체험 시뮬레이션</div>
			<h1 id="printScenarioTitle">연습 화면 인쇄</h1>
			<p>단계별 연습 화면을 순서대로 확인할 수 있는 자료입니다. 실제 민원 신청으로 접수되지 않습니다.</p>
		</header>

		<div id="printStatus" class="alert alert-info" role="status"
			aria-live="polite">연습 화면을 불러오는 중입니다.</div>
		<div id="printStepContainer" aria-label="시뮬레이션 단계별 화면"></div>
		<div id="printCompleteContainer"></div>

		<div class="print-actions">
			<button type="button" id="printBtn" class="btn btn-primary" disabled>
				<i class="bi bi-printer me-1" aria-hidden="true"></i> PDF 저장 / 인쇄
			</button>
			<button type="button" id="printCloseBtn"
				class="btn btn-outline-secondary" onclick="window.close()">창
				닫기</button>
		</div>
	</main>
