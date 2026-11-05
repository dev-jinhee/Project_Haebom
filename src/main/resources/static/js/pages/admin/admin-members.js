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
	// [실제 DB 연동] 관리자 회원 관리
	// ========================================================
	let adminMemberCache = [];
	let selectedAdminMemberId = null;
	// 페이징 및 검색 변수 추가!
	let memberCurrentPage = 1;
	const memberPageSize = 15;
	let memberSearchQuery = '';
	// 회원 모달 연습 이력 페이징 & 필터 변수
	let currentMemberDraftsCache = [];
	let draftCurrentPage = 1;
	const draftPageSize = 5; // 한 번에 최대 5개씩!
	let selectedDraftScenario = 'ALL';
	let selectedDraftStatus = 'ALL'; // 탭 상태 필터: ALL, IN_PROGRESS, COMPLETED

	async function loadAdminMembers() {
		const tbody = document.getElementById('adminMemberTableBody');
		if (!tbody) return;

		try {
			const response = await fetch('/api/admin/members');
			if (!response.ok) throw new Error('회원 목록 조회 실패');
			const list = await response.json();
			adminMemberCache = (list || []).filter(m => m.role !== 'ADMIN');

			renderAdminMemberRows();
		} catch (error) {
			console.error('회원 목록 불러오기 실패:', error);
			tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-danger">회원 목록을 불러오지 못했습니다.</td></tr>`;
		}
	}

	function renderAdminMemberRows() {
		const tbody = document.getElementById('adminMemberTableBody');
		if (!tbody) return;
		// 1) 검색어 필터링 적용
		const filteredList = (adminMemberCache || []).filter(m => {
			if (!memberSearchQuery) return true;
			const q = memberSearchQuery.toLowerCase();
			return (m.memberName && m.memberName.toLowerCase().includes(q)) ||
			       (m.loginId && m.loginId.toLowerCase().includes(q)) ||
			       (m.email && m.email.toLowerCase().includes(q));
		});
		const totalCount = filteredList.length;
		const totalPages = Math.ceil(totalCount / memberPageSize) || 1;
		// 현재 페이지 범위 안전 보정
		if (memberCurrentPage > totalPages) memberCurrentPage = totalPages;
		if (memberCurrentPage < 1) memberCurrentPage = 1;
		// 2) 15개씩 슬라이스 계산
		const startIndex = (memberCurrentPage - 1) * memberPageSize;
		const endIndex = Math.min(startIndex + memberPageSize, totalCount);
		const pagedList = filteredList.slice(startIndex, endIndex);
		// 3) 상단/하단 안내 문구 갱신 (전체 X명 중 A - B)
		const totalCountEl = document.getElementById('adminMemberTotalCount');
		const pageRangeEl = document.getElementById('adminMemberPageRange');
		if (totalCountEl) totalCountEl.textContent = totalCount;
		if (pageRangeEl) {
			pageRangeEl.textContent = totalCount === 0 ? '0 - 0' : `${startIndex + 1} - ${endIndex}`;
		}
		// 4) 데이터가 없을 때 표시
		if (totalCount === 0) {
			tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-secondary">등록된(또는 검색된) 회원이 없습니다.</td></tr>`;
			renderMemberPagination(0, 1);
			return;
		}
		const statusBadge = (status) => {
			if (status === 'ACTIVE') return '<span class="badge text-bg-success">정상</span>';
			if (status === 'SUSPENDED') return '<span class="badge text-bg-warning">이용 정지</span>';
			if (status === 'WITHDRAWN') return '<span class="badge text-bg-secondary">탈퇴</span>';
			return `<span class="badge text-bg-light">${escapeAdminHtml(status || '알 수 없음')}</span>`;
		};
		// 5) 현재 15개 목록만 테이블에 그리기
		tbody.innerHTML = pagedList.map(m => {
			const dateText = m.createdAt ? String(m.createdAt).substring(0, 10).replace(/-/g, '.') : '';
			return `
        <tr data-member-row data-member-id="${m.memberId}">
          <td class="ps-3"><strong>${escapeAdminHtml(m.memberName || '—')}</strong></td>
          <td>${escapeAdminHtml(m.loginId || '—')}</td>
          <td>${escapeAdminHtml(m.email || '—')}</td>
          <td>${dateText}</td>
          <td>${statusBadge(m.memberStatus)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" data-member-detail="${m.memberId}" data-bs-toggle="modal" data-bs-target="#memberDetailModal">상세보기</button>
          </td>
        </tr>
      `;
		}).join('');
		// 6) 하단 페이징 버튼 렌더링 호출
		renderMemberPagination(totalPages, memberCurrentPage);
	}
	// 📌 하단 [이전] [1] [2] [다음] 버튼 생성 함수
	function renderMemberPagination(totalPages, currentPage) {
		const paginationEl = document.getElementById('adminMemberPagination');
		if (!paginationEl) return;
		if (totalPages <= 1) {
			paginationEl.innerHTML = '';
			return;
		}
		let html = '';
		// [이전] 버튼
		const prevDisabled = currentPage === 1 ? 'disabled' : '';
		html += `<li class="page-item ${prevDisabled}">
			<a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="이전">&laquo;</a>
		</li>`;
		// 번호 버튼 (5개 단위 블록)
		const pageGroupSize = 5;
		const currentGroup = Math.ceil(currentPage / pageGroupSize);
		const startPage = (currentGroup - 1) * pageGroupSize + 1;
		const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);
		for (let p = startPage; p <= endPage; p++) {
			const activeClass = p === currentPage ? 'active' : '';
			html += `<li class="page-item ${activeClass}">
				<a class="page-link" href="#" data-page="${p}">${p}</a>
			</li>`;
		}
		// [다음] 버튼
		const nextDisabled = currentPage === totalPages ? 'disabled' : '';
		html += `<li class="page-item ${nextDisabled}">
			<a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="다음">&raquo;</a>
		</li>`;
		paginationEl.innerHTML = html;
		// 클릭 시 해당 페이지로 이동
		paginationEl.querySelectorAll('a.page-link').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				const targetPage = Number(btn.dataset.page);
				if (!targetPage || targetPage === memberCurrentPage || targetPage < 1 || targetPage > totalPages) return;
				memberCurrentPage = targetPage;
				renderAdminMemberRows();
			});
		});
	}

	// 회원 상세 모달 열릴 때 진짜 DB 데이터 바인딩!
	document.getElementById('memberDetailModal')?.addEventListener('show.bs.modal', async (event) => {
		selectedAdminMemberId = event.relatedTarget?.dataset.memberDetail || '';
		const member = adminMemberCache.find(item => String(item.memberId) === String(selectedAdminMemberId));
		if (!member) return;

		document.getElementById('memberDetailTitle').textContent = `${member.memberName || member.loginId} 회원 상세`;
		document.querySelector('[data-member-detail-id]').textContent = member.loginId || '—';
		document.querySelector('[data-member-detail-email]').textContent = member.email || '—';
		document.querySelector('[data-member-detail-joined]').textContent = member.createdAt ? String(member.createdAt).substring(0, 10).replace(/-/g, '.') : '—';
		document.getElementById('memberAccountStatus').value = member.memberStatus || 'ACTIVE';

		const draftBody = document.querySelector('[data-member-drafts]');
		const draftCount = document.querySelector('[data-member-draft-count]');

		if (draftBody) {
			draftBody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary py-3"><div class="spinner-border spinner-border-sm me-2" role="status"></div>연습 내역을 불러오는 중입니다...</td></tr>';
		}
		if (draftCount) draftCount.textContent = '...';

		try {
			const response = await fetch(`/api/admin/members/${selectedAdminMemberId}/drafts`);
			if (!response.ok) throw new Error('연습 내역 조회 실패');
			const drafts = await response.json();
			currentMemberDraftsCache = drafts || [];

			// 1) 드롭다운에 [전입신고, 주민등록증 재발급] 기본 상시 장착!
			const scenarioFilter = document.getElementById('memberDraftScenarioFilter');
			if (scenarioFilter) {
				const scenarioMap = new Map([
					['1', '전입신고'],
					['2', '주민등록증 재발급']
				]);
				// 혹시 다른 시나리오 이력이 있다면 맵에 추가
				currentMemberDraftsCache.forEach(d => {
					if (d.scenarioId && d.scenarioTitle && !scenarioMap.has(String(d.scenarioId))) {
						scenarioMap.set(String(d.scenarioId), d.scenarioTitle);
					}
				});

				let optionsHtml = '<option value="ALL">전체 시나리오</option>';
				scenarioMap.forEach((title, id) => {
					optionsHtml += `<option value="${id}">${escapeAdminHtml(title)}</option>`;
				});
				scenarioFilter.innerHTML = optionsHtml;
				scenarioFilter.value = 'ALL';
			}

			// 2) 탭 상태 및 드롭다운 초기화 ('전체' 활성화)
			selectedDraftStatus = 'ALL';
			selectedDraftScenario = 'ALL';
			draftCurrentPage = 1;

			document.querySelectorAll('#memberDraftStatusTabs [data-draft-status]').forEach(btn => {
				const isAll = btn.dataset.draftStatus === 'ALL';
				btn.classList.toggle('btn-primary', isAll);
				btn.classList.toggle('active', isAll);
				btn.classList.toggle('btn-outline-primary', !isAll);
			});

			renderMemberDraftRows();

		} catch (err) {
			console.error('회원 연습 내역 조회 에러:', err);
			if (draftBody) {
				draftBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">내역을 불러오지 못했습니다.</td></tr>';
			}
			if (draftCount) draftCount.textContent = '0건';
		}
	});

	// 📌 선택된 시나리오에 맞춰 탭 뱃지(전체/진행중/완료) 및 상단 건수 뱃지 숫자 동적 갱신
	function updateDraftTabBadges() {
		const scenarioDrafts = (selectedDraftScenario === 'ALL')
			? currentMemberDraftsCache
			: currentMemberDraftsCache.filter(d => String(d.scenarioId) === String(selectedDraftScenario));

		const totalCount = scenarioDrafts.length;
		const waitingCount = scenarioDrafts.filter(d => d.progressStatus === 'IN_PROGRESS').length;
		const completedCount = scenarioDrafts.filter(d => d.progressStatus === 'COMPLETED').length;

		const draftCount = document.querySelector('[data-member-draft-count]');
		const badgeTotal = document.getElementById('badgeDraftTotal');
		const badgeWaiting = document.getElementById('badgeDraftWaiting');
		const badgeCompleted = document.getElementById('badgeDraftCompleted');

		if (draftCount) draftCount.textContent = `${totalCount}건`;
		if (badgeTotal) badgeTotal.textContent = totalCount;
		if (badgeWaiting) badgeWaiting.textContent = waitingCount;
		if (badgeCompleted) badgeCompleted.textContent = completedCount;
	}

	// 회원 모달 내 연습 이력 렌더링 (최대 5개씩 페이징 + 시나리오 및 상태 필터링)
	function renderMemberDraftRows() {
		const draftBody = document.querySelector('[data-member-drafts]');
		const paginationEl = document.getElementById('memberDraftPagination');
		const totalCountEl = document.getElementById('memberDraftTotalListCount');
		const pageRangeEl = document.getElementById('memberDraftPageRange');
		if (!draftBody) return;

		// 0) 선택된 시나리오에 맞게 탭 뱃지(전체/진행중/완료) & 상단 뱃지 동적 업데이트!
		updateDraftTabBadges();

		// 1) 시나리오 및 진행 상태(진행중/완료) 필터 동시 적용!
		let filtered = [...currentMemberDraftsCache];
		if (selectedDraftScenario !== 'ALL') {
			filtered = filtered.filter(d => String(d.scenarioId) === String(selectedDraftScenario));
		}
		if (selectedDraftStatus !== 'ALL') {
			filtered = filtered.filter(d => d.progressStatus === selectedDraftStatus);
		}

		const totalCount = filtered.length;
		const totalPages = Math.ceil(totalCount / draftPageSize) || 1;

		if (draftCurrentPage > totalPages) draftCurrentPage = totalPages;
		if (draftCurrentPage < 1) draftCurrentPage = 1;

		// 2) 5개씩 슬라이스
		const startIndex = (draftCurrentPage - 1) * draftPageSize;
		const endIndex = Math.min(startIndex + draftPageSize, totalCount);
		const pagedList = filtered.slice(startIndex, endIndex);

		// 3) 건수 및 안내 문구 갱신
		if (totalCountEl) totalCountEl.textContent = totalCount;
		if (pageRangeEl) {
			pageRangeEl.textContent = totalCount === 0 ? '0 - 0' : `${startIndex + 1} - ${endIndex}`;
		}

		// 4) 데이터 없음 처리
		if (totalCount === 0) {
			draftBody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary py-4">해당 시나리오의 연습 이력이 없습니다.</td></tr>';
			if (paginationEl) paginationEl.innerHTML = '';
			return;
		}

		// 5) 최대 5개 행 렌더링
		draftBody.innerHTML = pagedList.map((d) => {
			const isCompleted = d.progressStatus === 'COMPLETED';
			const statusBadge = isCompleted
				? '<span class="badge text-bg-success">완료</span>'
				: '<span class="badge text-bg-warning">진행중</span>';

			const saveDate = (d.completedAt || d.lastSavedAt || d.startedAt)
				? String(d.completedAt || d.lastSavedAt || d.startedAt).substring(0, 16).replace('T', ' ').replace(/-/g, '.')
				: '—';

			const expireDate = isCompleted
				? '<span class="text-secondary">—</span>'
				: (d.expireDate ? `<span class="text-danger fw-semibold">${String(d.expireDate).substring(0, 10).replace(/-/g, '.')}</span>` : '—');

			const rate = d.progressRate != null ? d.progressRate : (isCompleted ? 100 : 0);

			return `
				<tr>
					<td class="fw-semibold">${escapeAdminHtml(d.scenarioTitle || '시나리오')}</td>
					<td>${statusBadge}</td>
					<td>${escapeAdminHtml(d.stepTitle || '—')}</td>
					<td>
						<div class="d-flex align-items-center gap-2">
							<div class="progress flex-grow-1" style="height: 6px; width: 60px;">
								<div class="progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}" role="progressbar" style="width: ${rate}%;"></div>
							</div>
							<small class="text-secondary fw-semibold">${rate}%</small>
						</div>
					</td>
					<td class="small text-secondary">${saveDate}</td>
					<td class="small">${expireDate}</td>
				</tr>
			`;
		}).join('');

		// 6) 5개 단위 페이징 버튼 렌더링
		renderDraftPagination(totalPages, draftCurrentPage);
	}

	// 회원 모달 연습 이력 페이징 [이전] [1] [2] [다음] 버튼 생성
	function renderDraftPagination(totalPages, currentPage) {
		const paginationEl = document.getElementById('memberDraftPagination');
		if (!paginationEl) return;

		if (totalPages <= 1) {
			paginationEl.innerHTML = '';
			return;
		}

		let html = '';

		// [이전] 버튼
		const prevDisabled = currentPage === 1 ? 'disabled' : '';
		html += `<li class="page-item ${prevDisabled}">
			<a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="이전">&laquo;</a>
		</li>`;

		// 번호 버튼 (5개 단위 블록)
		const pageGroupSize = 5;
		const currentGroup = Math.ceil(currentPage / pageGroupSize);
		const startPage = (currentGroup - 1) * pageGroupSize + 1;
		const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

		for (let p = startPage; p <= endPage; p++) {
			const activeClass = p === currentPage ? 'active' : '';
			html += `<li class="page-item ${activeClass}">
				<a class="page-link" href="#" data-page="${p}">${p}</a>
			</li>`;
		}

		// [다음] 버튼
		const nextDisabled = currentPage === totalPages ? 'disabled' : '';
		html += `<li class="page-item ${nextDisabled}">
			<a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="다음">&raquo;</a>
		</li>`;

		paginationEl.innerHTML = html;

		// 버튼 클릭 시 페이지 이동
		paginationEl.querySelectorAll('a.page-link').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				const targetPage = Number(btn.dataset.page);
				if (!targetPage || targetPage === draftCurrentPage || targetPage < 1 || targetPage > totalPages) return;
				draftCurrentPage = targetPage;
				renderMemberDraftRows();
			});
		});
	}

	// 시나리오 필터 드롭다운 변경 시 1페이지로 리셋하고 다시 출력
	document.getElementById('memberDraftScenarioFilter')?.addEventListener('change', (e) => {
		selectedDraftScenario = e.target.value;
		draftCurrentPage = 1;
		renderMemberDraftRows();
	});

	// 📌 상태 탭 버튼(전체/진행중/완료) 클릭 이벤트
	document.querySelectorAll('#memberDraftStatusTabs [data-draft-status]').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const target = e.currentTarget;
			selectedDraftStatus = target.dataset.draftStatus || 'ALL';

			// 버튼 파란색 활성화 토글
			document.querySelectorAll('#memberDraftStatusTabs [data-draft-status]').forEach(b => {
				b.classList.remove('btn-primary', 'active');
				b.classList.add('btn-outline-primary');
			});
			target.classList.remove('btn-outline-primary');
			target.classList.add('btn-primary', 'active');

			draftCurrentPage = 1; // 탭 변경 시 1페이지로!
			renderMemberDraftRows();
		});
	});
	
	// 관리자 회원 상태 변경 저장 버튼 클릭 이벤트
	document.querySelector('[data-save-member-status]')?.addEventListener('click', async () => {
		if (!selectedAdminMemberId) return;
		const status = document.getElementById('memberAccountStatus').value;

		try {
			const response = await fetch(`/api/admin/members/${selectedAdminMemberId}/status`, {
				method: 'PUT',
				body: new URLSearchParams({ memberStatus: status })
			});

			if (!response.ok) throw new Error('회원 상태 변경 실패');

			toast('회원 상태를 성공적으로 변경했습니다.');
			bootstrap.Modal.getInstance(document.getElementById('memberDetailModal'))?.hide();

			await loadAdminMembers();
			if (typeof window.loadAdminActivityLog === 'function') window.loadAdminActivityLog();
		} catch (error) {
			console.error('회원 상태 변경 실패:', error);
			toast('회원 상태 변경에 실패했습니다. 다시 시도해 주세요.');
		}
	});

	// 회원 검색 필터
	document.querySelector('[data-member-search]')?.addEventListener('input', (event) => {
		memberSearchQuery = event.currentTarget.value.trim();
		memberCurrentPage = 1;
		renderAdminMemberRows();
	});

	// 회원 목록 엑셀 다운로드 이벤트
	document.getElementById('btnExportMembersExcel')?.addEventListener('click', () => {
		window.location.href = '/api/admin/members/excel';
	});

	// 외부 노출
	window.loadAdminMembers = loadAdminMembers;
	window.adminMemberCache = adminMemberCache;
})();
