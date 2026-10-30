<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>

<!-- 전입신고 Step1 | 정부24 유의사항 + 해봄 이용 안내 -->
<section class="move-notice move-step1" aria-labelledby="moveStep1Title">

	<!-- 1. 시작하기 전에 -->
	<div class="move-step1-start" aria-labelledby="moveStep1Title">
		<h3 class="move-step1-heading" id="moveStep1Title">
			<span class="material-symbols-outlined" aria-hidden="true">edit_square</span>
			시작하기 전에
		</h3>
		<ul class="move-step1-bullets">
			<li><strong>전입신고</strong> 시 <strong>특정한 선거구에서 투표할 목적</strong>으로
				주민등록에 관한 허위 신고를 한 사람은 <strong>「공직선거법」 제247조</strong>에 따라 처벌받을 수
				있습니다.</li>
			<li>실제 정부24 전입신고 민원은 <strong>인증서를 통한 전자서명</strong>이 필요합니다.
			</li>
		</ul>
	</div>

	<!-- 2. 유의사항 확인 -->
	<div class="move-step1-notices" aria-labelledby="moveStep1NoticeTitle">
		<h3 class="move-step1-section-title" id="moveStep1NoticeTitle">유의사항
			확인</h3>

		<section class="move-step1-group"
			aria-labelledby="moveStep1ApplyTitle">
			<h4 id="moveStep1ApplyTitle">신청방법</h4>
			<ul class="move-step1-bullets">
				<li>전입신고는 새로운 거주지에 전입한 날부터 <strong>14일 이내</strong>에 해야 하며, 온라인
					또는 이사한 곳(새로운 거주지)의 읍·면·동 행정복지센터에 방문하여 신청할 수 있습니다.
					<ul>
						<li>정당한 사유 없이 14일 이내에 신고하지 않으면 <strong>5만 원 이하의 과태료</strong>,
							거짓으로 신고하면 <strong>3년 이하의 징역 또는 3천만 원 이하의 벌금</strong>에 처해질 수
							있습니다(「주민등록법」 제37조 및 제40조).
						</li>
					</ul>
				</li>
				<li>온라인 전입신고는 신청인, 세대주, 전입자 전원의 인증서를 통한 본인확인이 필요합니다.
					<ul>
						<li>정부24 이용이 어려운 경우 이사한 곳의 읍·면·동 행정복지센터를 방문해 신분증으로 본인확인을 해야
							합니다(신분증 진위 여부 확인).</li>
					</ul>
				</li>
			</ul>
		</section>

		<section class="move-step1-group"
			aria-labelledby="moveStep1IdentityTitle">
			<h4 id="moveStep1IdentityTitle">본인확인 방법</h4>
			<ul class="move-step1-bullets">
				<li><strong>신고자(전입자)</strong>: 전입신고 시 정부24에 접속하여 인증서를 통한 본인확인을
					해야 합니다.</li>
				<li><strong>신고자가 아닌 전입자 및 세대주</strong>: 신고서에 기재된 연락처의 문자메시지로 받은
					링크를 통해 정부24에 접속하여 인증서를 통한 본인확인을 해야 합니다.
					<ul>
						<li>정부24 이용이 어려우면 이사한 곳의 읍·면·동 행정복지센터를 방문하여 신분증으로 본인확인을 해야
							합니다(신분증 진위 여부 확인).</li>
					</ul></li>
			</ul>
			<div class="move-step1-emphasis">
				<strong>다음의 경우에는 세대주 확인이 반드시 필요합니다.</strong>
				<ol>
					<li>세대주가 아닌 세대원이 신청하는 경우</li>
					<li>세대주 변경이 있는 경우</li>
					<li>전입자가 기존 세대주가 있는 곳에 세대원으로 전입하는 경우</li>
				</ol>
			</div>
		</section>

		<section class="move-step1-group"
			aria-labelledby="moveStep1ResultTitle">
			<h4 id="moveStep1ResultTitle">결과확인</h4>
			<ul class="move-step1-bullets">
				<li>전입신고 신청 후 처리상태(반려, 취소, 시스템 장애 등)를 반드시 확인하시기 바랍니다. 온라인 확인이
					어려우면 관할 읍·면·동 행정복지센터에 문의해야 합니다.</li>
				<li>실제 정부24에서의 확인 방법: <strong>My Gov &gt; 나의 신청내역 &gt;
						서비스 신청내역</strong> (<a
					href="https://plus.gov.kr/mypage/mbrAplySrvcList?awpf=!2f"
					target="_blank" rel="noopener noreferrer">정부24 서비스 신청내역</a>)
				</li>
				<li>신청이 잘못되었거나 세대주 확인을 기한 내에 처리하지 않으면 신청이 취소될 수 있습니다.</li>
				<li>전입신고 후 이·통장이 15일 이내에 신고 내용의 사실 여부를 사후 확인할 수 있습니다.</li>
				<li>평일 근무시간(18:00) 이후나 토요일·공휴일에 신청하면 다음 근무일 (세대주·전입자 확인이 필요한
					경우에는 해당 확인 완료일)에 신청이 접수되며, 담당자 확인 후 신고가 수리 또는 반려됩니다.
					<ul>
						<li>주민등록 관련 신고는 행정청이 <strong>수리한 때부터</strong> 효력이 발생합니다.
						</li>
						<li>당일 처리가 필요한 경우 관할 행정복지센터에 유선 문의하고, 근무시간(18:00) 내 처리상태를
							확인해야 합니다.</li>
					</ul>
				</li>
				<li>전입신고 접수증은 온라인 발급이 불가하므로, 접수증이 필요하면 관할 읍·면·동 행정복지센터에 방문해야
					합니다.</li>
			</ul>
		</section>

		<section class="move-step1-group"
			aria-labelledby="moveStep1CautionTitle">
			<h4 id="moveStep1CautionTitle">유의사항</h4>
			<ul class="move-step1-bullets">
				<li><strong>미성년자</strong>
					<ul>
						<li>미성년자 본인(19세 미만)은 온라인 전입신고가 불가능합니다.</li>
						<li>미성년자 전입자가 포함된 경우 신고인(전입자)이 미성년자의 부모(법정대리인)인 경우에만 온라인
							전입신고가 가능합니다. 법정대리인에는 친권자(부모)와 후견인이 포함됩니다.</li>
						<li><strong>2026년 10월 29일부터</strong> 전입자인 미성년자의 법정대리인이 공동친권자인
							경우, 부모 모두의 확인을 위해 시행령 별지 제15호의4서식(법정대리인 확인서)을 작성해야 합니다. 신고 권한이 없는
							경우 전입신고 방법을 주민센터에 문의해야 합니다.</li>
					</ul></li>
				<li><strong>재외국민</strong>: 전입자 중 재외국민이 포함되어 있으면 재외국민 여부 확인을 위해
					읍·면·동 행정복지센터에 방문하여 신청해야 합니다.</li>
				<li><strong>해외체류자</strong>: 해외체류자가 귀국해 국내에 30일 이상 거주하려는 경우, 입국
					여부 확인을 위해 읍·면·동 행정복지센터에 방문하여 전입신고해야 합니다(방문 신고만 가능).</li>
				<li>이사 온 곳의 기존 세대주와 <strong>별도 세대</strong>를 구성하려는 경우에는 온라인
					전입신고가 불가능합니다. 관할 행정복지센터에 문의한 후 방문 신고해야 합니다.
				</li>
			</ul>
		</section>
	</div>

	<!-- 3. 해봄 시뮬레이션 안내 (실제 민원과 구분) -->
	<aside class="move-simulation-notice move-step1-simulation"
		aria-labelledby="moveStep1SimTitle">
		<h3 id="moveStep1SimTitle">
			<span class="material-symbols-outlined" aria-hidden="true">school</span>
			해봄 시뮬레이션 안내
		</h3>
		<ul class="move-step1-bullets">
			<li>해봄은 실제 전입신고 절차를 연습하는 <strong>교육용 시뮬레이션</strong>입니다.
			</li>
			<li>입력한 정보는 정부24 또는 행정기관에 제출되지 않으며 실제 신고가 접수되지 않습니다.</li>
			<li>실제 개인정보 대신 <strong>가상의 정보</strong>를 입력해 주세요.
			</li>
			<li>인증서 전자서명, 세대주·전입자 본인확인, 행정기관 심사는 실제로 수행되지 않습니다.</li>
			<li>시뮬레이션의 완료 표시는 <strong>실제 전입신고의 처리 완료를 의미하지 않습니다.</strong></li>
		</ul>
	</aside>

	<!-- 4. 기존 JS에서 참조하는 ID 유지 -->
	<div class="gov24-notice-check move-step1-agreement">
		<input class="form-check-input ms-0 mt-0" type="checkbox"
			id="agreeNotice"> <label class="form-check-label fw-semibold"
			for="agreeNotice"> 위 전입신고 유의사항 및 해봄 시뮬레이션 안내를 모두 확인했습니다. </label>
	</div>
</section>
