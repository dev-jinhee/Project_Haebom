<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<!-- ============================== -->
<!-- 전입신고 1단계 - 유의사항 -->
<!-- ============================== -->
<section class="move-notice">

	<!-- 전입신고 유의사항 -->
	<div class="border rounded-3 p-3 p-md-4 mb-4">

		<h4 class="h6 fw-bold mb-3">시작하기 전에</h4>

		<p class="small">전입신고는 새로운 거주지로 이사한 경우 주소 변경 사실을 신고하는 행정절차입니다.</p>

		<ul class="small">
			<li class="mb-2">새로운 주소지에 전입한 날부터 <strong>14일 이내</strong>에 신고해야
				합니다.
			</li>
			<li class="mb-2">전입신고는 온라인 또는 방문하여 신청할 수 있습니다. 온라인 신청은 본인만
				가능합니다.</li>
			<li>전입 유형에 따라 세대주 확인 등의 추가 절차가 필요할 수 있습니다.</li>
		</ul>

		<hr>

		<h4 class="h6 fw-bold mb-3">신청 시 유의사항</h4>

		<ul class="small">
			<li class="mb-2">신청인 정보와 이사할 주소를 정확히 확인해야 합니다.</li>
			<li class="mb-2">함께 이사하는 세대원의 정보를 확인해야 합니다.</li>
			<li>재외국민 및 해외체류자 등 일부 대상은 방문 신고가 필요합니다.</li>
		</ul>

		<hr>

		<h4 class="h6 fw-bold mb-3">신청 후 확인사항</h4>

		<ul class="small mb-0">
			<li class="mb-2">실제 신청 후에는 접수 및 처리 상태를 확인해야 합니다.</li>
			<li>추가 확인 절차가 필요한 경우 안내된 절차를 완료해야 합니다.</li>
		</ul>

	</div>

	<!-- 해봄 안내 -->
	<div class="move-simulation-notice mb-4">
		<strong>해봄 시뮬레이션 안내</strong>
		<p class="small mb-0 mt-2">본 서비스는 전입신고 절차를 연습하기 위한 학습용 시뮬레이션입니다.
			입력한 정보는 실제 정부24에 제출되지 않으며, 전입신고가 접수되는 것도 아닙니다.</p>
	</div>

	<!-- 유의사항 확인 -->
	<div class="form-check">
		<input class="form-check-input" type="checkbox" id="agreeNotice">

		<label class="form-check-label fw-semibold" for="agreeNotice">
			위 전입신고 유의사항을 모두 확인했습니다. </label>
	</div>

</section>
