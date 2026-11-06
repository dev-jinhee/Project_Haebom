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

	// ========================================================
	// [관리자 관리 (Admin Management)] 상태 및 페이징 변수
	// ========================================================
	let adminAccountCache = [];
	let accountCurrentPage = 1;
	const accountPageSize = 15;
	let accountSearchQuery = '';

	/**
	 * 관리자 계정 목록 API 호출 (GET /api/admin/admins)
	 */
	async function loadAdminAccounts() {
		const tbody = document.getElementById('adminAccountTableBody');
		if (!tbody) return;

		try {
			const response = await fetch('/api/admin/admins');
			if (!response.ok) throw new Error('관리자 목록 조회 실패');
			const list = await response.json();
			adminAccountCache = list || [];

			renderAdminAccountRows();
		} catch (error) {
			console.error('관리자 목록 불러오기 실패:', error);
			tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-danger">관리자 목록을 불러오지 못했습니다.</td></tr>`;
		}
	}

	/**
	 * 관리자 테이블 행 렌더링 및 페이징 처리
	 */
	function renderAdminAccountRows() {
		const tbody = document.getElementById('adminAccountTableBody');
		if (!tbody) return;

		// 1) 검색어 필터링 적용 (관리자명, 아이디, 이메일)
		const filteredList = (adminAccountCache || []).filter(admin => {
			if (!accountSearchQuery) return true;
			const q = accountSearchQuery.toLowerCase();
			return (admin.memberName && admin.memberName.toLowerCase().includes(q)) ||
			       (admin.loginId && admin.loginId.toLowerCase().includes(q)) ||
			       (admin.email && admin.email.toLowerCase().includes(q));
		});

		const totalCount = filteredList.length;
		const totalPages = Math.ceil(totalCount / accountPageSize) || 1;

		if (accountCurrentPage > totalPages) accountCurrentPage = totalPages;
		if (accountCurrentPage < 1) accountCurrentPage = 1;

		// 2) 15개씩 슬라이스
		const startIndex = (accountCurrentPage - 1) * accountPageSize;
		const endIndex = Math.min(startIndex + accountPageSize, totalCount);
		const pagedList = filteredList.slice(startIndex, endIndex);

		// 3) 상/하단 카운트 문구 갱신
		const totalCountEl = document.getElementById('adminAccountTotalCount');
		const pageRangeEl = document.getElementById('adminAccountPageRange');
		if (totalCountEl) totalCountEl.textContent = totalCount;
		if (pageRangeEl) {
			pageRangeEl.textContent = totalCount === 0 ? '0 - 0' : `${startIndex + 1} - ${endIndex}`;
		}

		// 4) 데이터 없을 때
		if (totalCount === 0) {
			tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-secondary">등록된(또는 검색된) 관리자 계정이 없습니다.</td></tr>`;
			renderAccountPagination(0, 1);
			return;
		}

		// 5) 테이블 렌더링
		tbody.innerHTML = pagedList.map(admin => {
			const isRootAdmin = Number(admin.memberId) === 1;
			const dateText = admin.createdAt
				? String(admin.createdAt).substring(0, 16).replace('T', ' ').replace(/-/g, '.')
				: '—';

			// 관리자명 (1번 최고관리자는 [총괄] 뱃지 부여)
			const nameBadge = isRootAdmin
				? `<span class="badge text-bg-primary me-1"><i class="bi bi-shield-fill-check me-1"></i>총괄</span>`
				: '';

			// 상태 컨트롤: 1번 관리자는 고정, 그 외는 셀렉트 박스
			let statusHtml = '';
			if (isRootAdmin) {
				statusHtml = `<span class="badge text-bg-success px-2 py-1"><i class="bi bi-lock-fill me-1"></i>정상 (고정)</span>`;
			} else {
				statusHtml = `
					<select class="form-select form-select-sm d-inline-block w-auto admin-status-select" 
							data-admin-id="${admin.memberId}" 
							data-prev-status="${escapeAdminHtml(admin.memberStatus)}">
						<option value="ACTIVE" ${admin.memberStatus === 'ACTIVE' ? 'selected' : ''}>정상</option>
						<option value="SUSPENDED" ${admin.memberStatus === 'SUSPENDED' ? 'selected' : ''}>이용 정지</option>
					</select>
				`;
			}

			return `
				<tr data-admin-row data-admin-id="${admin.memberId}">
					<td class="ps-3">${nameBadge}<strong>${escapeAdminHtml(admin.memberName || '—')}</strong></td>
					<td><code>${escapeAdminHtml(admin.loginId || '—')}</code></td>
					<td>${escapeAdminHtml(admin.email || '—')}</td>
					<td><small class="text-secondary">${dateText}</small></td>
					<td><span class="badge bg-secondary-subtle text-secondary-emphasis border">ADMIN</span></td>
					<td>${statusHtml}</td>
				</tr>
			`;
		}).join('');

		// 6) 페이징 네비게이션 렌더링
		renderAccountPagination(totalCount, totalPages);

		// 7) 상태 변경 드롭다운 이벤트 연결
		bindStatusChangeEvents();
	}

	/**
	 * 관리자 목록 페이징 버튼 렌더링
	 */
	function renderAccountPagination(totalCount, totalPages) {
		const paginationEl = document.getElementById('adminAccountPagination');
		if (!paginationEl) return;

		if (totalCount === 0 || totalPages <= 1) {
			paginationEl.innerHTML = `
				<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">이전</a></li>
				<li class="page-item active"><a class="page-link" href="#">1</a></li>
				<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">다음</a></li>
			`;
			return;
		}

		let html = '';
		// 이전 버튼
		const prevDisabled = accountCurrentPage === 1 ? 'disabled' : '';
		html += `<li class="page-item ${prevDisabled}"><a class="page-link" href="#" data-page="${accountCurrentPage - 1}">이전</a></li>`;

		// 번호 버튼 (최대 5개 표시)
		const maxDisplay = 5;
		let startPage = Math.max(1, accountCurrentPage - Math.floor(maxDisplay / 2));
		let endPage = Math.min(totalPages, startPage + maxDisplay - 1);
		if (endPage - startPage + 1 < maxDisplay) {
			startPage = Math.max(1, endPage - maxDisplay + 1);
		}

		for (let p = startPage; p <= endPage; p++) {
			const active = (p === accountCurrentPage) ? 'active' : '';
			html += `<li class="page-item ${active}"><a class="page-link" href="#" data-page="${p}">${p}</a></li>`;
		}

		// 다음 버튼
		const nextDisabled = accountCurrentPage === totalPages ? 'disabled' : '';
		html += `<li class="page-item ${nextDisabled}"><a class="page-link" href="#" data-page="${accountCurrentPage + 1}">다음</a></li>`;

		paginationEl.innerHTML = html;

		// 클릭 이벤트 바인딩
		paginationEl.querySelectorAll('a.page-link').forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const targetPage = Number(link.dataset.page);
				if (!targetPage || targetPage === accountCurrentPage || targetPage < 1 || targetPage > totalPages) return;
				accountCurrentPage = targetPage;
				renderAdminAccountRows();
			});
		});
	}

	/**
	 * 상태 변경 드롭다운 변경 이벤트
	 */
	function bindStatusChangeEvents() {
		document.querySelectorAll('.admin-status-select').forEach(select => {
			select.addEventListener('change', async (e) => {
				const adminId = select.dataset.adminId;
				const newStatus = select.value;
				const prevStatus = select.dataset.prevStatus;
				const statusText = newStatus === 'ACTIVE' ? '정상' : '이용 정지';

				if (!confirm(`해당 관리자 계정 상태를 '${statusText}'(으)로 변경하시겠습니까?`)) {
					select.value = prevStatus;
					return;
				}

				try {
					const response = await fetch(`/api/admin/admins/${adminId}/status`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
						body: new URLSearchParams({ memberStatus: newStatus })
					});

					if (!response.ok) {
						const errorMsg = await response.text();
						alert(errorMsg || '관리자 계정 상태 변경에 실패했습니다.');
						select.value = prevStatus;
						return;
					}

					toast('관리자 계정 상태가 성공적으로 변경되었습니다.');
					select.dataset.prevStatus = newStatus;

					await loadAdminAccounts();
					if (typeof window.loadAdminActivityLog === 'function') window.loadAdminActivityLog();
				} catch (error) {
					console.error('관리자 상태 변경 에러:', error);
					alert('서버 통신 중 오류가 발생했습니다.');
					select.value = prevStatus;
				}
			});
		});
	}

	// ========================================================
	// [이벤트 리스너 등록]
	// ========================================================

	// 1. 관리자 실시간 검색 필터
	document.querySelector('[data-admin-account-search]')?.addEventListener('input', (event) => {
		accountSearchQuery = event.currentTarget.value.trim();
		accountCurrentPage = 1;
		renderAdminAccountRows();
	});

	// 2. 새 관리자 등록 모달 폼 제출
	document.getElementById('adminRegisterForm')?.addEventListener('submit', async (e) => {
		e.preventDefault();

		const form = e.target;
		const loginId = document.getElementById('newAdminLoginId').value.trim();
		const password = document.getElementById('newAdminPassword').value;
		const memberName = document.getElementById('newAdminMemberName').value.trim();
		const email = document.getElementById('newAdminEmail').value.trim();

		if (!loginId || !password || !memberName || !email) {
			alert('모든 필수 항목을 입력해 주세요.');
			return;
		}

		const submitBtn = document.getElementById('btnSubmitAdminRegister');
		if (submitBtn) submitBtn.disabled = true;

		try {
			const response = await fetch('/api/admin/admins', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					loginId,
					password,
					memberName,
					email
				})
			});

			if (!response.ok) {
				const errorMsg = await response.text();
				alert(errorMsg || '관리자 등록에 실패했습니다.');
				return;
			}

			toast('새 관리자 계정이 성공적으로 등록되었습니다.');

			// 모달 닫기 및 폼 초기화
			const modalEl = document.getElementById('adminRegisterModal');
			if (modalEl) {
				const modalInstance = bootstrap.Modal.getInstance(modalEl);
				if (modalInstance) modalInstance.hide();
			}
			form.reset();

			// 목록 새로고침 및 활동 로그 갱신
			await loadAdminAccounts();
			if (typeof window.loadAdminActivityLog === 'function') window.loadAdminActivityLog();
		} catch (error) {
			console.error('관리자 등록 에러:', error);
			alert('서버와 통신 중 오류가 발생했습니다.');
		} finally {
			if (submitBtn) submitBtn.disabled = false;
		}
	});

	// 외부 노출
	window.loadAdminAccounts = loadAdminAccounts;
	window.adminAccountCache = adminAccountCache;
})();
