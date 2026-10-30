(() => {
	'use strict';

	const toast = (msg) => (window.Haebom && typeof window.Haebom.toast === 'function') ? window.Haebom.toast(msg) : alert(msg);

	// ========================================================
	// [엑셀 다운로드 기능] SheetJS 기반 Excel(.xlsx) 내보내기 공통 헬퍼
	// ========================================================
	/**
	 * 공통 엑셀 파일 내보내기 헬퍼 함수
	 * @param {Array<Object>} rows - 엑셀에 들어갈 데이터 행 배열
	 * @param {string} fileName - 저장될 파일명 (확장자 제외)
	 * @param {string} sheetName - 엑셀 시트명
	 * @param {Array<Object>} colWidths - 컬럼별 너비 설정 (예: [{ wch: 10 }, { wch: 20 }])
	 */
	const exportToExcelFile = (rows, fileName, sheetName = 'Sheet1', colWidths = []) => {
		if (!window.XLSX) {
			console.error('XLSX 라이브러리가 로드되지 않았습니다.');
			toast('엑셀 라이브러리를 불러오지 못했습니다.');
			return;
		}

		if (!rows || rows.length === 0) {
			toast('다운로드할 데이터가 없습니다.');
			return;
		}

		// 1. JSON 데이터를 워크시트로 변환
		const worksheet = XLSX.utils.json_to_sheet(rows);

		// 2. 컬럼 너비(auto-width) 적용
		if (colWidths && colWidths.length > 0) {
			worksheet['!cols'] = colWidths;
		}

		// 3. 워크북 생성 및 시트 추가
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

		// 4. 날짜 문자열 생성 (YYYYMMDD_HHmm)
		const now = new Date();
		const pad = (n) => String(n).padStart(2, '0');
		const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
		const fullFileName = `${fileName}_${dateStr}.xlsx`;

		// 5. 파일 다운로드 트리거
		XLSX.writeFile(workbook, fullFileName);
		toast(`${fileName} 엑셀 파일이 다운로드되었습니다.`);
	};
	window.exportToExcelFile = exportToExcelFile;

	// ========================================================
	// [페이지 라우팅 및 탭 전환]
	// ========================================================
	const adminPageTitles = {
		dashboard: '이용 현황',
		members: '회원',
		scenarios: '시나리오',
		inquiries: '문의 게시판'
	};

	const renderAdminPage = () => {
		if (!['/admin.html', '/admin', '/admin/'].includes(window.location.pathname) && !window.location.pathname.startsWith('/admin')) return;
		const hash = window.location.hash.slice(1);
		const page = ['dashboard', 'members', 'scenarios'].includes(hash) ? hash
			: ['inquiries', 'inquiries-admin'].includes(hash) ? 'inquiries' : 'dashboard';

		document.querySelectorAll('[data-admin-page]').forEach((section) => {
			section.classList.toggle('d-none', section.dataset.adminPage !== page);
		});

		document.querySelectorAll('[data-admin-nav]').forEach((link) => {
			const active = link.dataset.adminNav === page;
			link.classList.toggle('active', active);
			if (active) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');
		});

		const title = document.querySelector('[data-admin-page-title]');
		if (title) title.textContent = adminPageTitles[page];

		if (page === 'dashboard') {
			if (typeof window.loadAdminDashboardStats === 'function') window.loadAdminDashboardStats();
			if (typeof window.renderDashboardTrend === 'function') window.renderDashboardTrend();
			if (typeof window.loadAdminActivityLog === 'function') window.loadAdminActivityLog();
			if (typeof window.loadAdminScenarios === 'function') window.loadAdminScenarios();
		}
		if (page === 'inquiries' && typeof window.loadAdminInquiries === 'function') {
			window.loadAdminInquiries();
		}
		if (page === 'members' && typeof window.loadAdminMembers === 'function') {
			window.loadAdminMembers();
		}
		if (page === 'scenarios' && typeof window.loadAdminScenarios === 'function') {
			window.loadAdminScenarios();
		}
	};

	document.querySelectorAll('[data-admin-nav]').forEach((link) => {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			const hash = link.getAttribute('href');
			if (window.location.hash !== hash) window.history.pushState(null, '', hash);
			renderAdminPage();
		});
	});

	window.addEventListener('popstate', renderAdminPage);
	window.addEventListener('hashchange', renderAdminPage);
	window.renderAdminPage = renderAdminPage;

	// 초기 실행
	renderAdminPage();

	// 최초 DB 데이터 로드 실행
	if (typeof window.loadAdminDashboardStats === 'function') window.loadAdminDashboardStats();
	if (typeof window.loadAdminActivityLog === 'function') window.loadAdminActivityLog();
	if (typeof window.loadAdminInquiries === 'function') window.loadAdminInquiries();
	if (typeof window.loadAdminMembers === 'function') window.loadAdminMembers();
	if (typeof window.loadAdminScenarios === 'function') window.loadAdminScenarios();

})();
