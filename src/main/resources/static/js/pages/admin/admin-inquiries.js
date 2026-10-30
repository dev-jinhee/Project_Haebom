(() => {
	'use strict';

	const toast = (msg) => (window.Haebom && typeof window.Haebom.toast === 'function') ? window.Haebom.toast(msg) : alert(msg);

	const escapeAdminHtml = window.escapeAdminHtml || ((str) => {
		if (!str) return '';
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	});
	window.escapeAdminHtml = escapeAdminHtml;

	// ========================================================
	// [실제 DB 연동] 관리자 문의 게시판 관리
	// ========================================================
	let adminInquiryCache = [];
	let inquirySortDirection = 0; // 0: 기본, 1: 답변대기우선, -1: 답변완료우선
	let selectedInquiryId = '';

	// 1. 진짜 DB 문의 목록 불러오기
	async function loadAdminInquiries() {
		const tbody = document.getElementById('adminInquiryTableBody');
		if (!tbody) return;

		try {
			const response = await fetch('/api/inquiries');
			if (!response.ok) throw new Error('목록 조회 실패');
			adminInquiryCache = await response.json();

			// 1) 요약 카드 숫자 갱신 (답변 대기 / 답변 완료 / 총 접수)
			const waitingCount = adminInquiryCache.filter(item => item.qnaStatus === 'WAITING').length;
			const doneCount = adminInquiryCache.filter(item => item.qnaStatus === 'ANSWERED').length;
			const totalCount = adminInquiryCache.length;

			// 사이드바 배지
			const sideBadge = document.getElementById('adminSidebarInquiryBadge');
			if (sideBadge) sideBadge.textContent = waitingCount;

			// 대시보드 메인 화면의 미답변 문의 카드 (두 자리 수 형식, 예: 01)
			const dashWaitEl = document.getElementById('adminDashboardWaitingInquiryCount');
			if (dashWaitEl) dashWaitEl.textContent = String(waitingCount).padStart(2, '0');

			// 문의 게시판 화면 요약 카드 3종
			const waitingEl = document.getElementById('adminInquiryWaitingCount');
			const doneEl = document.getElementById('adminInquiryDoneCount');
			const totalEl = document.getElementById('adminInquiryTotalCount');
			if (waitingEl) waitingEl.innerHTML = `${waitingCount}<small>건</small>`;
			if (doneEl) doneEl.innerHTML = `${doneCount}<small>건</small>`;
			if (totalEl) totalEl.innerHTML = `${totalCount}<small>건</small>`;

			// 2) 카테고리별 통계 갱신 및 도넛 차트 동적 렌더링
			const catCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
			adminInquiryCache.forEach(item => {
				const catId = Number(item.qnaCategoryId);
				if (catCount[catId] !== undefined) {
					catCount[catId]++;
				}
			});

			const donutEl = document.getElementById('adminCategoryDonut');
			const donutTotal = document.getElementById('adminCategoryDonutTotal');
			const headingTotal = document.getElementById('adminCategoryHeadingTotal');

			if (donutTotal) donutTotal.textContent = totalCount;
			if (headingTotal) headingTotal.textContent = `총 ${totalCount}건`;

			if (totalCount === 0) {
				if (donutEl) {
					donutEl.style.background = '#e2e8f0';
					donutEl.setAttribute('aria-label', '등록된 문의가 없습니다.');
				}
				[1, 2, 3, 4].forEach(id => {
					const countEl = document.getElementById(`adminCatCount${id}`);
					const pctEl = document.getElementById(`adminCatPercent${id}`);
					if (countEl) countEl.textContent = '0건';
					if (pctEl) pctEl.textContent = '0%';
				});
			} else {
				const p1 = Math.round((catCount[1] / totalCount) * 100);
				const p2 = Math.round((catCount[2] / totalCount) * 100);
				const p3 = Math.round((catCount[3] / totalCount) * 100);
				const p4 = Math.max(0, 100 - (p1 + p2 + p3));

				const el1 = document.getElementById('adminCatCount1');
				const pct1 = document.getElementById('adminCatPercent1');
				if (el1) el1.textContent = `${catCount[1]}건`;
				if (pct1) pct1.textContent = `${p1}%`;

				const el2 = document.getElementById('adminCatCount2');
				const pct2 = document.getElementById('adminCatPercent2');
				if (el2) el2.textContent = `${catCount[2]}건`;
				if (pct2) pct2.textContent = `${p2}%`;

				const el3 = document.getElementById('adminCatCount3');
				const pct3 = document.getElementById('adminCatPercent3');
				if (el3) el3.textContent = `${catCount[3]}건`;
				if (pct3) pct3.textContent = `${p3}%`;

				const el4 = document.getElementById('adminCatCount4');
				const pct4 = document.getElementById('adminCatPercent4');
				if (el4) el4.textContent = `${catCount[4]}건`;
				if (pct4) pct4.textContent = `${p4}%`;

				// conic-gradient 각도 계산: 1(회원): #3983b9, 2(시뮬레이션): #4a9b83, 3(오류): #e6a23c, 4(기타): #8ca4b8
				const deg1 = p1;
				const deg2 = deg1 + p2;
				const deg3 = deg2 + p3;
				if (donutEl) {
					donutEl.style.background = `conic-gradient(
            #3983b9 0% ${deg1}%,
            #4a9b83 ${deg1}% ${deg2}%,
            #e6a23c ${deg2}% ${deg3}%,
            #8ca4b8 ${deg3}% 100%
          )`;
					donutEl.setAttribute('aria-label', `문의 분류 비율: 회원·계정 ${p1}%, 시뮬레이션 ${p2}%, 오류·버그 ${p3}%, 기타 ${p4}%`);
				}
			}

			// 3) 테이블 렌더링
			renderAdminInquiryRows();

		} catch (error) {
			console.error('관리자 문의 목록 불러오기 실패:', error);
			tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-danger">문의 목록을 불러오지 못했습니다.</td></tr>`;
		}
	}

	// 2. 테이블 행 렌더링 (정렬 지원)
	function renderAdminInquiryRows() {
		const tbody = document.getElementById('adminInquiryTableBody');
		if (!tbody) return;

		if (!adminInquiryCache || adminInquiryCache.length === 0) {
			tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-secondary">등록된 문의가 없습니다.</td></tr>`;
			return;
		}

		let displayList = [...adminInquiryCache];
		if (inquirySortDirection === 1) {
			displayList.sort((a, b) => (a.qnaStatus === 'WAITING' ? -1 : 1));
		} else if (inquirySortDirection === -1) {
			displayList.sort((a, b) => (a.qnaStatus === 'ANSWERED' ? -1 : 1));
		}

		tbody.innerHTML = displayList.map(qna => {
			const isAnswered = qna.qnaStatus === 'ANSWERED';
			const statusBadge = isAnswered
				? '<span class="badge text-bg-success">답변 완료</span>'
				: '<span class="badge text-bg-warning">답변 대기</span>';
			const dateText = qna.qnaCreatedAt ? String(qna.qnaCreatedAt).substring(0, 10).replace(/-/g, '.') : '';
			const responder = qna.responderLoginId || (isAnswered ? 'admin' : '—');
			const isSecret = Boolean(qna.isSecret);
			const secretBadge = isSecret ? '<span class="badge text-bg-secondary ms-1"><i class="bi bi-lock-fill me-1"></i>비밀글</span>' : '';
			const author = qna.memberName || ('회원' + qna.memberId);

			return `
        <tr data-inquiry-row data-inquiry-id="${qna.qnaId}">
          <td class="ps-3"><strong>${qna.qnaTitle || ''}</strong> ${secretBadge}</td>
          <td>${escapeAdminHtml(author)}</td>
          <td>${escapeAdminHtml(qna.qnaCategoryName || '일반 문의')}</td>
          <td>${dateText}</td>
          <td>${statusBadge}</td>
          <td>${escapeAdminHtml(responder)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" data-inquiry-detail="${qna.qnaId}" data-bs-toggle="modal" data-bs-target="#inquiryDetailModal">상세보기</button>
          </td>
        </tr>
      `;
		}).join('');
	}

	// 3. 상태순 정렬 버튼 클릭 이벤트
	const inquiryStatusSortButton = document.querySelector('[data-inquiry-status-sort]');
	inquiryStatusSortButton?.addEventListener('click', () => {
		inquirySortDirection = inquirySortDirection === 1 ? -1 : 1;
		renderAdminInquiryRows();

		const icon = inquiryStatusSortButton.querySelector('i');
		if (icon) icon.className = `bi ${inquirySortDirection === 1 ? 'bi-sort-down' : 'bi-sort-up'}`;
		inquiryStatusSortButton.setAttribute('aria-pressed', 'true');
		inquiryStatusSortButton.title = inquirySortDirection === 1 ? '현재 정렬: 답변 대기 우선' : '현재 정렬: 답변 완료 우선';
	});

	// 4. 특정 문의글의 답변 목록 불러오기
	const loadInquiryAnswers = async (qnaId) => {
		const answersListEl = document.querySelector('[data-inquiry-answers]');
		if (!answersListEl) return;

		answersListEl.innerHTML = '<p class="inquiry-answer-empty mb-0 text-secondary">답변을 불러오는 중입니다...</p>';

		try {
			const response = await fetch(`/api/inquiries/${qnaId}/answers`);
			if (!response.ok) throw new Error('답변 목록 조회 실패');
			const answers = await response.json();

			answersListEl.replaceChildren();

			if (!answers || answers.length === 0) {
				answersListEl.innerHTML = '<p class="inquiry-answer-empty mb-0 text-secondary">아직 등록된 답변이 없습니다.</p>';
				return;
			}

			answers.forEach((ans, index) => {
				const dateStr = ans.qnaAnswerCreatedAt
					? String(ans.qnaAnswerCreatedAt).substring(0, 16).replace(/-/g, '.').replace('T', ' ')
					: '';
				const responder = ans.responderLoginId || ans.responderName || 'admin';

				const item = document.createElement('article');
				item.className = 'inquiry-answer-item';
				item.innerHTML = `
          <div class="inquiry-answer-meta">
            <span class="inquiry-answer-number">답변 ${index + 1}</span>
            <strong>${escapeAdminHtml(responder)}</strong>
            <time>${dateStr}</time>
          </div>
          <p class="mb-0" style="white-space: pre-line;">${ans.qnaAnswerContent || ''}</p>
        `;
				answersListEl.append(item);
			});

		} catch (error) {
			console.error('답변 불러오기 실패:', error);
			answersListEl.innerHTML = '<p class="inquiry-answer-empty mb-0 text-secondary">아직 등록된 답변이 없습니다.</p>';
		}
	};

	// 5. 문의 상세 모달 열릴 때 진짜 DB 데이터 바인딩!
	document.getElementById('inquiryDetailModal')?.addEventListener('show.bs.modal', (event) => {
		selectedInquiryId = event.relatedTarget?.dataset.inquiryDetail || '';
		const inquiry = adminInquiryCache.find(item => String(item.qnaId) === String(selectedInquiryId));
		if (!inquiry) return;

		document.getElementById('inquiryDetailTitle').textContent = typeof decodeHtml === 'function' ? decodeHtml(inquiry.qnaTitle) : inquiry.qnaTitle;
		document.querySelector('[data-inquiry-author]').textContent = inquiry.memberName || ('회원' + inquiry.memberId);
		document.getElementById('inquiryCategorySelect').value = inquiry.qnaCategoryName || '시뮬레이션 문의';
		document.querySelector('[data-inquiry-date]').textContent = inquiry.qnaCreatedAt ? String(inquiry.qnaCreatedAt).substring(0, 10).replace(/-/g, '.') : '';
		document.querySelector('[data-inquiry-content]').textContent = typeof decodeHtml === 'function' ? decodeHtml(inquiry.qnaContent) : inquiry.qnaContent;
		document.getElementById('inquiryStatusSelect').value = inquiry.qnaStatus === 'ANSWERED' ? '답변 완료' : '답변 대기';
		document.getElementById('inquiryReplyText').value = '';

		// 실제 DB에서 해당 문의글의 답변 목록 로드
		loadInquiryAnswers(selectedInquiryId);
	});

	// 새 답변 입력창에 글자를 치기 시작하면 답변 상태를 자동으로 '답변 대기'로 전환!
	document.getElementById('inquiryReplyText')?.addEventListener('input', (e) => {
		const statusSelect = document.getElementById('inquiryStatusSelect');
		if (statusSelect && e.target.value.trim().length > 0 && statusSelect.value === '답변 완료') {
			statusSelect.value = '답변 대기';
		}
	});

	// 6. 관리자 새 답변 등록 버튼 클릭 이벤트
	document.querySelector('[data-save-inquiry-reply]')?.addEventListener('click', async () => {
		if (!selectedInquiryId) return;

		const replyInput = document.getElementById('inquiryReplyText');
		const answerContent = replyInput?.value.trim();

		if (!answerContent) {
			toast('답변 내용을 입력해 주세요.');
			replyInput?.focus();
			return;
		}

		try {
			const params = new URLSearchParams({
				qnaAnswerContent: answerContent
			});

			const response = await fetch(`/api/inquiries/${selectedInquiryId}/answers`, {
				method: 'POST',
				body: params
			});

			if (!response.ok) throw new Error('답변 등록 실패');

			toast('답변을 등록했습니다.');
			replyInput.value = '';

			// 모달 내 답변 상태 select를 '답변 완료'로 자동 변경
			const statusSelect = document.getElementById('inquiryStatusSelect');
			if (statusSelect) statusSelect.value = '답변 완료';

			// 답변 목록 갱신
			await loadInquiryAnswers(selectedInquiryId);

			// 전체 문의 테이블 및 카운트 새로고침
			await loadAdminInquiries();

			if (typeof window.loadAdminActivityLog === 'function') window.loadAdminActivityLog();

		} catch (error) {
			console.error('답변 등록 중 에러 발생:', error);
			toast('답변 등록에 실패했습니다. 다시 시도해 주세요.');
		}
	});

	// 7. 관리자 문의 분류 및 상태 변경 저장 버튼 클릭 이벤트
	document.querySelector('[data-save-inquiry-status]')?.addEventListener('click', async () => {
		if (!selectedInquiryId) return;

		const statusVal = document.getElementById('inquiryStatusSelect')?.value;
		const categoryName = document.getElementById('inquiryCategorySelect')?.value;

		const categoryMap = {
			'회원·계정 문의': 1,
			'시뮬레이션 문의': 2,
			'오류·버그 신고': 3,
			'기타 문의': 4
		};
		const categoryId = categoryMap[categoryName] || 1;
		const qnaStatus = statusVal === '답변 완료' ? 'ANSWERED' : 'WAITING';

		try {
			const params = new URLSearchParams({
				qnaCategoryId: categoryId,
				qnaStatus: qnaStatus
			});

			const response = await fetch(`/api/inquiries/${selectedInquiryId}/status`, {
				method: 'PUT',
				body: params
			});

			if (!response.ok) throw new Error('상태 저장 실패');

			toast('문의 분류와 상태를 저장했습니다.');
			bootstrap.Modal.getOrCreateInstance(document.getElementById('inquiryDetailModal')).hide();

			// 전체 문의 목록 및 카운트 새로고침
			await loadAdminInquiries();

			if (typeof window.loadAdminActivityLog === 'function') window.loadAdminActivityLog();

		} catch (error) {
			console.error('문의 상태 변경 실패:', error);
			toast('변경사항 저장에 실패했습니다.');
		}
	});

	// 2) 문의 게시판 목록 엑셀 다운로드 이벤트
	document.getElementById('btnExportInquiriesExcel')?.addEventListener('click', () => {
		if (!adminInquiryCache || adminInquiryCache.length === 0) {
			toast('다운로드할 문의 데이터가 없습니다.');
			return;
		}

		const categoryNames = {
			1: '회원·계정 문의',
			2: '시뮬레이션 문의',
			3: '오류·버그 신고',
			4: '기타 문의'
		};

		const excelData = adminInquiryCache.map((qna, idx) => ({
			'순번': idx + 1,
			'문의 번호': qna.qnaId || '',
			'문의 제목': qna.qnaTitle || '',
			'비밀글 여부': qna.isSecret ? '비밀글' : '공개글',
			'문의 분류': qna.qnaCategoryName || categoryNames[qna.qnaCategoryId] || `카테고리 ${qna.qnaCategoryId}`,
			'작성자(ID)': qna.loginId || qna.memberName || '익명',
			'답변 상태': qna.qnaStatus === 'ANSWERED' ? '답변 완료' : '답변 대기',
			'담당자': qna.responderLoginId || qna.responderName || (qna.qnaStatus === 'ANSWERED' ? '관리자' : '미지정'),
			'등록일시': qna.qnaCreatedAt ? String(qna.qnaCreatedAt).replace('T', ' ').substring(0, 19) : '',
			'문의 내용': qna.qnaContent || ''
		}));

		const colWidths = [
			{ wch: 8 },  // 순번
			{ wch: 12 }, // 문의 번호
			{ wch: 30 }, // 문의 제목
			{ wch: 12 }, // 비밀글 여부
			{ wch: 18 }, // 문의 분류
			{ wch: 16 }, // 작성자
			{ wch: 12 }, // 답변 상태
			{ wch: 14 }, // 담당자
			{ wch: 22 }, // 등록일시
			{ wch: 45 }  // 문의 내용
		];

		if (typeof window.exportToExcelFile === 'function') {
			window.exportToExcelFile(excelData, '해봄_문의목록', '문의목록', colWidths);
		} else {
			toast('엑셀 변환 함수를 찾을 수 없습니다.');
		}
	});

	// 외부 노출
	window.loadAdminInquiries = loadAdminInquiries;
	window.adminInquiryCache = adminInquiryCache;
})();
