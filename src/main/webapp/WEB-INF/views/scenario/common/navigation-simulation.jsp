<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>

	<%-- 시뮬레이션 공통 하단 네비게이션 --%>
	<div class="sim-card-footer">

		<%-- PDF 저장 기능 (추후 구현) --%>
		<div class="sim-save-area d-none">
			<button class="btn btn-link text-secondary text-decoration-none"
				type="button" id="printApplication" title="현재 신청 화면을 PDF로 저장">
				<i class="bi bi-file-earmark-pdf me-1" aria-hidden="true"></i> 신청 화면
				PDF 저장
			</button>
			<small class="text-secondary"> 인쇄 창에서 'PDF로 저장'을 선택할 수 있습니다.
			</small>
		</div>

		<%-- 공통 이전 / 다음 버튼 --%>
		<div class="d-flex gap-2 ms-auto">

			<button class="btn btn-outline-secondary rounded-pill px-4"
				type="button" id="prevStep" disabled>이전</button>

			<button class="btn btn-primary rounded-pill px-4" type="button"
				id="nextStep">
				다음 단계 <i class="bi bi-arrow-right ms-1" aria-hidden="true"></i>
			</button>

		</div>
	</div>

</body>
</html>