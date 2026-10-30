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
	// [실제 DB 연동] 관리자 시나리오 관리
	// ========================================================
	let adminScenarioCache = [];
	let selectedAdminScenarioId = null;

	async function loadAdminScenarios() {
		const tbody = document.getElementById('adminScenarioTableBody');
		if (!tbody) return;

		try {
			const response = await fetch('/api/admin/scenarios');
			if (!response.ok) throw new Error('시나리오 목록 조회 실패');
			const list = await response.json();
			adminScenarioCache = list || [];

			renderAdminScenarioRows();
			updateScenarioDashboardKPIs();
		} catch (error) {
			console.error('시나리오 목록 불러오기 실패:', error);
			tbody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-danger">시나리오 목록을 불러오지 못했습니다.</td></tr>';
		}
	}

	function renderAdminScenarioRows() {
		const tbody = document.getElementById('adminScenarioTableBody');
		const totalCountEl = document.getElementById('adminScenarioTotalCount');
		if (!tbody) return;

		if (!adminScenarioCache || adminScenarioCache.length === 0) {
			tbody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-secondary">등록된 시나리오가 없습니다.</td></tr>';
			if (totalCountEl) totalCountEl.textContent = '0개 시나리오';
			return;
		}

		if (totalCountEl) {
			totalCountEl.textContent = `${adminScenarioCache.length}개 시나리오`;
		}

		const getIcon = (categoryName) => {
			if (categoryName === 'HOUSING') return 'bi-house-check';
			if (categoryName === 'IDENTITY') return 'bi-person-vcard';
			return 'bi-diagram-3';
		};

		tbody.innerHTML = adminScenarioCache.map(s => {
			const statusBadge = s.isActive
				? '<span class="badge text-bg-success">운영 중</span>'
				: '<span class="badge text-bg-warning">점검 중</span>';
			const icon = getIcon(s.categoryName);
			const categoryText = s.categoryLabel || s.categoryName || '기타';

			return `
        <tr data-scenario-row data-scenario-id="${s.scenarioId}">
          <td class="ps-3">
            <div class="admin-scenario-table-title">
              <span class="admin-scenario-table-icon"><i class="bi ${icon}"></i></span>
              <div>
                <strong data-scenario-name-display>${escapeAdminHtml(s.scenarioTitle)}</strong>
                <small class="text-secondary">${escapeAdminHtml(s.description || '행정 절차 연습')}</small>
              </div>
            </div>
          <td class="text-nowrap"><span class="badge text-bg-light border">${escapeAdminHtml(categoryText)}</span></td>
          <td class="text-nowrap"><i class="bi bi-clock me-1 text-secondary" aria-hidden="true"></i>예상 ${s.estimatedMinutes || 0}분</td>
          <td class="text-nowrap">${statusBadge}</td>
          <td class="text-end pe-3 text-nowrap">
            <button type="button" class="btn btn-sm btn-outline-primary text-nowrap" data-bs-toggle="modal" data-bs-target="#scenarioDetailModal" data-scenario-id="${s.scenarioId}">
              <i class="bi bi-pencil-square me-1"></i>상세·수정
            </button>
          </td>
        </tr>
      `;
		}).join('');
	}

	function updateScenarioDashboardKPIs() {
		if (!adminScenarioCache || adminScenarioCache.length === 0) return;
		const totalCount = adminScenarioCache.length;
		const activeCount = adminScenarioCache.filter(s => s.isActive).length;

		document.querySelectorAll('[data-total-scenario-count]').forEach(el => {
			el.textContent = String(totalCount);
		});
		document.querySelectorAll('[data-active-scenario-count]').forEach(el => {
			el.textContent = `${activeCount}개`;
		});

		const firstScenario = adminScenarioCache[0];
		if (firstScenario) {
			const scenarioOption = document.querySelector('[data-current-scenario-option]');
			if (scenarioOption) scenarioOption.textContent = firstScenario.scenarioTitle;
		}

		const dashboardScenarioFilter = document.querySelector('[data-dashboard-scenario-filter]');
		if (dashboardScenarioFilter && adminScenarioCache && adminScenarioCache.length > 0) {
			const currentVal = dashboardScenarioFilter.value;
			dashboardScenarioFilter.innerHTML = '<option value="all">전체 시나리오</option>' +
				adminScenarioCache.map(s => `<option value="${s.scenarioId}">${escapeAdminHtml(s.scenarioTitle)}</option>`).join('');
			if (currentVal && dashboardScenarioFilter.querySelector(`option[value="${currentVal}"]`)) {
				dashboardScenarioFilter.value = currentVal;
			}
		}
	}

	// 시나리오 상세 모달 열릴 때 데이터 바인딩
	document.getElementById('scenarioDetailModal')?.addEventListener('show.bs.modal', async (event) => {
		const trigger = event.relatedTarget;
		if (!trigger) return;
		selectedAdminScenarioId = trigger.dataset.scenarioId;
		const scenario = adminScenarioCache.find(s => String(s.scenarioId) === String(selectedAdminScenarioId));
		if (!scenario) return;

		const titleEl = document.getElementById('scenarioDetailTitle');
		const idInput = document.getElementById('scenarioId');
		const nameInput = document.getElementById('scenarioName');
		const categorySelect = document.getElementById('scenarioCategory');
		const minutesInput = document.getElementById('scenarioEstimatedMinutes');
		const statusSelect = document.getElementById('scenarioStatus');
		const descInput = document.getElementById('scenarioDescription');

		if (titleEl) titleEl.textContent = typeof decodeHtml === 'function' ? decodeHtml(scenario.scenarioTitle) : scenario.scenarioTitle;
		if (idInput) idInput.value = scenario.scenarioId;
		if (nameInput) nameInput.value = typeof decodeHtml === 'function' ? decodeHtml(scenario.scenarioTitle) : scenario.scenarioTitle;
		if (categorySelect) categorySelect.value = scenario.categoryId || '1';
		if (minutesInput) minutesInput.value = scenario.estimatedMinutes || 5;
		if (statusSelect) statusSelect.value = scenario.isActive ? 'true' : 'false';
		if (descInput) descInput.value = typeof decodeHtml === 'function' ? decodeHtml(scenario.description || '') : (scenario.description || '');

		const descEl = document.getElementById('scenarioUsageDescription');
		if (descEl) descEl.textContent = `${scenario.scenarioTitle} 시나리오 운영 이후의 전체 이용 흐름입니다.`;

		// 실제 DB에서 시나리오 상세 통계(임시 저장 단계별 현황 + 누적 이용 현황) 로드!
		await loadScenarioDetailStats(selectedAdminScenarioId);
	});

	async function loadScenarioDetailStats(scenarioId) {
		const tbody = document.getElementById('scenarioStepStatsTableBody');
		const startsEl = document.getElementById('scenarioKpiStarts');
		const completedEl = document.getElementById('scenarioKpiCompleted');
		const rateEl = document.getElementById('scenarioKpiRate');
		const dropoffEl = document.getElementById('scenarioKpiDropoff');
		const dropoffRateEl = document.getElementById('scenarioKpiDropoffRate');

		if (tbody) {
			tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-secondary"><div class="spinner-border spinner-border-sm text-primary me-2"></div>단계별 통계를 불러오는 중입니다...</td></tr>';
		}

		try {
			const response = await fetch(`/api/admin/scenarios/${scenarioId}/stats`);
			if (!response.ok) throw new Error('시나리오 통계 조회 실패');
			const stats = await response.json();

			// 1. 누적 이용 현황 KPI 4개 갱신
			if (startsEl) startsEl.innerHTML = `${Number(stats.totalStarts || 0).toLocaleString('ko-KR')}<small>회</small>`;
			if (completedEl) completedEl.innerHTML = `${Number(stats.totalCompleted || 0).toLocaleString('ko-KR')}<small>회</small>`;
			if (rateEl) rateEl.innerHTML = `${(stats.completionRate || 0).toFixed(1)}<small>%</small>`;
			if (dropoffEl) dropoffEl.textContent = stats.dropoffStepTitle || '—';
			if (dropoffRateEl) dropoffRateEl.textContent = `이탈 비율 ${(stats.dropoffRate || 0).toFixed(1)}%`;

			// 2. 단계별 임시 저장 현황 테이블 렌더링
			if (tbody) {
				if (!stats.stepStats || stats.stepStats.length === 0) {
					tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-secondary">등록된 시나리오 단계가 없습니다.</td></tr>';
					return;
				}

				tbody.innerHTML = stats.stepStats.map(step => {
					const rateVal = Math.min(Math.round(step.saveRate || 0), 100);
					return `
            <tr>
              <td><strong>${escapeAdminHtml(step.stepTitle)}</strong></td>
              <td>
                <div class="progress" role="progressbar" aria-label="${escapeAdminHtml(step.stepTitle)} 저장 비율 ${rateVal}%" aria-valuenow="${rateVal}" aria-valuemin="0" aria-valuemax="100" style="height: 8px">
                  <div class="progress-bar" style="width: ${rateVal}%"></div>
                </div>
              </td>
              <td class="text-end">${Number(step.saveCount || 0).toLocaleString('ko-KR')}건</td>
              <td class="text-end">${(step.saveRate || 0).toFixed(1)}%</td>
            </tr>
          `;
				}).join('');
			}
		} catch (error) {
			console.warn('시나리오 통계 불러오기 실패(또는 백엔드 API 미준비):', error);
			if (tbody) {
				tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-secondary">통계 데이터를 불러오지 못했습니다.</td></tr>';
			}
		}
	}

	// 시나리오 정보 수정 폼 제출
	document.getElementById('scenarioDetailForm')?.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (!selectedAdminScenarioId) return;

		const nameInput = document.getElementById('scenarioName');
		const categorySelect = document.getElementById('scenarioCategory');
		const minutesInput = document.getElementById('scenarioEstimatedMinutes');
		const statusSelect = document.getElementById('scenarioStatus');
		const descInput = document.getElementById('scenarioDescription');

		const updateParams = new URLSearchParams({
			scenarioId: selectedAdminScenarioId,
			scenarioTitle: nameInput.value.trim(),
			description: descInput ? descInput.value.trim() : '',
			categoryId: categorySelect?.value || 1,
			estimatedMinutes: minutesInput.value,
			isActive: statusSelect.value === 'true'
		});

		try {
			const response = await fetch(`/api/admin/scenarios/${selectedAdminScenarioId}`, {
				method: 'PUT',
				body: updateParams
			});

			if (!response.ok) throw new Error('시나리오 정보 수정 실패');

			toast('시나리오 정보를 성공적으로 저장했습니다.');
			bootstrap.Modal.getInstance(document.getElementById('scenarioDetailModal'))?.hide();

			if (typeof loadAdminActivityLog === 'function') loadAdminActivityLog();

			await loadAdminScenarios();
		} catch (error) {
			console.error('시나리오 수정 오류:', error);
			toast('시나리오 정보 수정에 실패했습니다. 다시 시도해 주세요.');
		}
	});

	// 시나리오 검색 필터
	document.querySelector('[data-scenario-search]')?.addEventListener('input', (event) => {
		const query = event.currentTarget.value.trim().toLowerCase();
		document.querySelectorAll('#adminScenarioTableBody [data-scenario-row]').forEach((row) => {
			row.classList.toggle('d-none', !row.textContent.toLowerCase().includes(query));
		});
	});

	// 외부 노출
	window.loadAdminScenarios = loadAdminScenarios;
	window.adminScenarioCache = adminScenarioCache;
})();
