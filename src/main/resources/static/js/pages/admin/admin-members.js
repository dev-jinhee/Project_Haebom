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

		if (!adminMemberCache || adminMemberCache.length === 0) {
			tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-secondary">등록된 회원이 없습니다.</td></tr>`;
			return;
		}

		const statusBadge = (status) => {
			if (status === 'ACTIVE') return '<span class="badge text-bg-success">정상</span>';
			if (status === 'SUSPENDED') return '<span class="badge text-bg-warning">이용 정지</span>';
			if (status === 'WITHDRAWN') return '<span class="badge text-bg-secondary">탈퇴</span>';
			return `<span class="badge text-bg-light">${escapeAdminHtml(status || '알 수 없음')}</span>`;
		};

		tbody.innerHTML = adminMemberCache.map(m => {
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

			if (draftCount) {
				draftCount.textContent = `${drafts ? drafts.length : 0}건`;
			}

			if (!draftBody) return;

			if (!drafts || drafts.length === 0) {
				draftBody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary py-4">진행 중이거나 완료된 연습이 없습니다.</td></tr>';
				return;
			}

			draftBody.innerHTML = drafts.map((d) => {
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
		} catch (err) {
			console.error('회원 연습 내역 조회 에러:', err);
			if (draftBody) {
				draftBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">내역을 불러오지 못했습니다.</td></tr>';
			}
			if (draftCount) draftCount.textContent = '0건';
		}
	});

	// 관리자 회원 상태 변경 저장 버튼 클릭 이벤트
	document.querySelector('[data-save-member-status]')?.addEventListener('click', async () => {
		if (!selectedAdminMemberId) return;
		const status = document.getElementById('memberAccountStatus').value;

		try {
			const response = await fetch(`/api/admin/members/${selectedAdminMemberId}/status`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ memberStatus: status })
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
		const query = event.currentTarget.value.trim().toLowerCase();
		document.querySelectorAll('#adminMemberTableBody [data-member-row]').forEach((row) => {
			row.classList.toggle('d-none', !row.textContent.toLowerCase().includes(query));
		});
	});

	// 회원 목록 엑셀 다운로드 이벤트
	document.getElementById('btnExportMembersExcel')?.addEventListener('click', () => {
		if (!adminMemberCache || adminMemberCache.length === 0) {
			toast('다운로드할 회원 데이터가 없습니다.');
			return;
		}

		const statusMap = {
			'ACTIVE': '정상',
			'SUSPENDED': '이용 정지',
			'WITHDRAWN': '탈퇴'
		};

		const excelData = adminMemberCache.map((m, idx) => ({
			'순번': idx + 1,
			'회원 번호': m.memberId || '',
			'이름': m.memberName || '',
			'아이디': m.loginId || '',
			'이메일': m.email || '',
			'계정 상태': statusMap[m.memberStatus] || m.memberStatus || '알 수 없음',
			'가입일시': m.createdAt ? String(m.createdAt).replace('T', ' ').substring(0, 19) : ''
		}));

		const colWidths = [
			{ wch: 8 },  // 순번
			{ wch: 12 }, // 회원 번호
			{ wch: 15 }, // 이름
			{ wch: 18 }, // 아이디
			{ wch: 26 }, // 이메일
			{ wch: 12 }, // 계정 상태
			{ wch: 22 }  // 가입일시
		];

		if (typeof window.exportToExcelFile === 'function') {
			window.exportToExcelFile(excelData, '해봄_회원목록', '회원목록', colWidths);
		} else {
			toast('엑셀 변환 함수를 찾을 수 없습니다.');
		}
	});

	// 외부 노출
	window.loadAdminMembers = loadAdminMembers;
	window.adminMemberCache = adminMemberCache;
})();
