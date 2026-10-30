<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>해봄 | 시뮬레이션 화면 인쇄</title>
    <!-- 기존 시뮬레이션과 동일한 스타일을 먼저 불러옵니다. -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="/css/common.css" rel="stylesheet">
    <link href="/css/pages/scenario/simulation/simulation.css" rel="stylesheet">
    <link href="/css/pages/scenario/simulation/move.css" rel="stylesheet">
    <!-- 인쇄에 필요한 변경사항만 별도 적용 -->
    <link href="/css/pages/scenario/simulation/simulation-print.css" rel="stylesheet">
    <script type="module" src="/js/pages/scenario/simulation/simulation-print.js"></script>
</head>
<body class="simulation-page simulation-print-page">
    <main id="simulationPrint" class="container sim-container">
        <header class="print-header">
            <div class="print-brand">해봄 · 행정절차 체험 시뮬레이션</div>
            <h1 id="printScenarioTitle">연습 화면 인쇄</h1>
            <p>단계별 연습 화면을 순서대로 확인할 수 있는 자료입니다. 실제 민원 신청으로 접수되지 않습니다.</p>
        </header>

        <div id="printStatus" class="alert alert-info" role="status" aria-live="polite">연습 화면을 불러오는 중입니다.</div>
        <div id="printStepContainer" aria-label="시뮬레이션 단계별 화면"></div>
        <div id="printCompleteContainer"></div>

        <div class="print-actions">
            <button type="button" id="printBtn" class="btn btn-primary" disabled>
                <i class="bi bi-printer me-1" aria-hidden="true"></i> PDF 저장 / 인쇄
            </button>
            <button type="button" id="printCloseBtn" class="btn btn-outline-secondary" onclick="window.close()">창 닫기</button>
        </div>
    </main>
</body>
</html>
