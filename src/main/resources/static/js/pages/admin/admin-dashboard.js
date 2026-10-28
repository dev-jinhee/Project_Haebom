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
	// [실제 DB 연동] 관리자 최근 활동 로그
	// ========================================================
	const adminActivityIcons = {
		member: ['blue', 'bi-person-gear'],
		inquiry: ['amber', 'bi-chat-left-text'],
		scenario: ['teal', 'bi-diagram-3']
	};

	const formatAdminActivityTime = (timestamp) => {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		if (Number.isNaN(date.getTime())) return '';
		const pad = (value) => String(value).padStart(2, '0');
		const datePart = `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
		const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
		const today = new Date();
		return date.toDateString() === today.toDateString() ? `오늘 ${timePart}` : `${datePart} ${timePart}`;
	};

	async function loadAdminActivityLog() {
		const list = document.querySelector('[data-admin-activity-list]');
		if (!list) return;

		try {
			const response = await fetch('/api/admin/dashboard/activities');
			if (!response.ok) throw new Error('활동 로그 조회 실패');
			const activities = await response.json();
			renderAdminActivityLog(activities);
		} catch (error) {
			console.warn('활동 로그 조회 실패(또는 API 미준비):', error);
			renderAdminActivityLog([]);
		}
	}

	function renderAdminActivityLog(activities) {
		const list = document.querySelector('[data-admin-activity-list]');
		if (!list) return;
		list.replaceChildren();

		if (!activities || activities.length === 0) {
			const emptyNotice = document.createElement('div');
			emptyNotice.className = 'text-center py-5 text-secondary small';
			emptyNotice.textContent = '최근 운영자 활동 내역이 없습니다.';
			list.append(emptyNotice);
			return;
		}

		itemsSlice(activities).forEach((activity) => {
			const typeKey = (activity.logType || 'member').toLowerCase();
			const [color, icon] = adminActivityIcons[typeKey] || adminActivityIcons.member;
			const row = document.createElement('div');
			const symbol = document.createElement('span');
			symbol.className = `admin-activity-icon ${color}`;
			const iconElement = document.createElement('i');
			iconElement.className = `bi ${icon}`;
			iconElement.setAttribute('aria-hidden', 'true');
			symbol.append(iconElement);

			const copy = document.createElement('p');
			const title = document.createElement('strong');
			title.textContent = activity.title;
			copy.append(title);

			const metadata = document.createElement('small');
			metadata.textContent = `운영자 ID ${activity.operatorId || 'admin'} · ${formatAdminActivityTime(activity.createdAt)}`;
			copy.append(metadata);

			row.append(symbol, copy);
			list.append(row);
		});
	}

	function itemsSlice(arr) {
		return (arr || []).slice(0, 10);
	}

	// ========================================================
	// [실제 DB 연동] 관리자 대시보드 종합 통계
	// ========================================================
	async function loadAdminDashboardStats() {
		try {
			const response = await fetch('/api/admin/dashboard/stats');
			if (!response.ok) throw new Error('대시보드 통계 조회 실패');
			const stats = await response.json();
			renderAdminDashboardStats(stats);
		} catch (error) {
			console.error('대시보드 통계 불러오기 실패:', error);
		}
	}

	function renderAdminDashboardStats(stats) {
		if (!stats) return;

		// 1. 상단 4대 KPI 카드
		const totalMembersEl = document.getElementById('adminDashboardTotalMembers');
		const monthlyStartsEl = document.getElementById('adminDashboardMonthlyStarts');
		const completionRateEl = document.getElementById('adminDashboardCompletionRate');
		const waitingInquiryEl = document.getElementById('adminDashboardWaitingInquiryCount');

		if (totalMembersEl) totalMembersEl.textContent = Number(stats.totalMemberCount || 0).toLocaleString('ko-KR');
		if (monthlyStartsEl) monthlyStartsEl.textContent = Number(stats.monthlyStartCount || 0).toLocaleString('ko-KR');
		if (completionRateEl) completionRateEl.innerHTML = `${(stats.completionRate || 0).toFixed(1)}<small>%</small>`;
		if (waitingInquiryEl) {
			const waitCount = Number(stats.waitingInquiryCount || 0);
			waitingInquiryEl.textContent = waitCount.toLocaleString('ko-KR');
			const card = waitingInquiryEl.closest('.admin-kpi-card');
			const footLabel = card?.querySelector('.admin-kpi-foot-label');
			const actionLink = card?.querySelector('.admin-kpi-action-link');
			if (footLabel) {
				if (waitCount === 0) {
					footLabel.innerHTML = '<span class="positive">모두 처리됨</span><span>미답변 없음</span>';
					if (actionLink) actionLink.style.display = 'none';
				} else {
					footLabel.innerHTML = '<span class="attention">확인 필요</span><span>미답변 문의</span>';
					if (actionLink) actionLink.style.display = 'inline-flex';
				}
			} else {
				const foot = card?.querySelector('.admin-kpi-foot');
				if (foot) {
					if (waitCount === 0) {
						foot.innerHTML = '<span class="positive">모두 처리됨</span><span>미답변 없음</span>';
					} else {
						foot.innerHTML = '<span class="attention">확인 필요</span><span>미답변 문의</span>';
					}
				}
			}
		}

		// 1-1. 상단 KPI 미니 스파크라인 (0일 땐 일직선, 데이터가 생기면 물결 곡선으로 전환!)
		const sparklinePaths = {
			members: 'M0 25 C22 23 27 28 45 21 S75 25 93 18 S120 22 141 13 S174 19 191 9 S208 12 220 5',
			starts: 'M0 27 C19 21 30 29 47 20 S76 23 93 18 S120 24 140 15 S167 20 186 12 S208 14 220 7',
			completion: 'M0 24 C20 16 34 22 48 19 S78 22 95 15 S120 20 140 14 S171 18 190 10 S209 13 220 6',
			inquiries: 'M0 26 C22 23 34 27 52 20 S82 24 101 17 S128 22 148 13 S176 18 194 9 S210 12 220 6'
		};
		const flatLine = 'M0 26 L220 26';

		const updateSparkline = (key, val) => {
			const path = document.querySelector(`[data-kpi-sparkline="${key}"]`);
			if (!path) return;
			if (Number(val || 0) > 0) {
				path.setAttribute('d', sparklinePaths[key] || flatLine);
				path.style.opacity = '1';
			} else {
				path.setAttribute('d', flatLine);
				path.style.opacity = '0.35';
			}
		};

		updateSparkline('members', stats.totalMemberCount);
		updateSparkline('starts', stats.monthlyStartCount);
		updateSparkline('completion', stats.completionRate);
		updateSparkline('inquiries', stats.waitingInquiryCount);

		// 2. 회원 성별 구성
		const genderTotalEl = document.getElementById('adminGenderTotalMembers');
		const maleCountEl = document.getElementById('adminMaleCount');
		const maleRateEl = document.getElementById('adminMaleRate');
		const femaleCountEl = document.getElementById('adminFemaleCount');
		const femaleRateEl = document.getElementById('adminFemaleRate');
		const genderChartEl = document.getElementById('adminGenderChart');

		const totalMembers = stats.totalMemberCount || 0;
		if (genderTotalEl) genderTotalEl.textContent = totalMembers.toLocaleString('ko-KR');
		if (maleCountEl) maleCountEl.textContent = Number(stats.maleCount || 0).toLocaleString('ko-KR');
		if (maleRateEl) maleRateEl.textContent = `${(stats.maleRate || 0).toFixed(1)}%`;
		if (femaleCountEl) femaleCountEl.textContent = Number(stats.femaleCount || 0).toLocaleString('ko-KR');
		if (femaleRateEl) femaleRateEl.textContent = `${(stats.femaleRate || 0).toFixed(1)}%`;

		if (genderChartEl) {
			if (totalMembers > 0) {
				genderChartEl.style.background = `conic-gradient(#1769aa 0 ${stats.maleRate}%, #a9c4d8 ${stats.maleRate}% 100%)`;
				genderChartEl.setAttribute('aria-label', `남성 ${stats.maleRate}%, 여성 ${stats.femaleRate}%`);
			} else {
				genderChartEl.style.background = '#edf1f4';
				genderChartEl.setAttribute('aria-label', '가입 회원 없음');
			}
		}

		// 3. 회원 연령대 분포
		const ageListEl = document.getElementById('adminAgeList');
		if (ageListEl) {
			const ageGroups = [
				{ label: '10대', count: stats.age10s || 0 },
				{ label: '20대', count: stats.age20s || 0 },
				{ label: '30대', count: stats.age30s || 0 },
				{ label: '40대', count: stats.age40s || 0 },
				{ label: '50대', count: stats.age50s || 0 },
				{ label: '60대 이상', count: stats.age60sOver || 0 }
			];

			const maxAgeCount = Math.max(...ageGroups.map(g => g.count), 1);

			ageListEl.innerHTML = ageGroups.map(group => {
				const sharePct = totalMembers > 0 ? ((group.count / totalMembers) * 100).toFixed(1) : '0';
				const trackWidthPct = totalMembers > 0 ? ((group.count / maxAgeCount) * 100).toFixed(1) : '0';

				return `
          <div class="admin-age-row">
            <span>${group.label}</span>
            <div class="admin-age-track" role="img" aria-label="${group.label} ${group.count}명, ${sharePct}%">
              <i style="--age-share: ${trackWidthPct}%"></i>
            </div>
            <strong>${group.count} <small>${sharePct}%</small></strong>
          </div>
        `;
			}).join('');
		}

		// 4. 이번 달 이용 상위 시나리오 요약 바인딩
		const topNameEl = document.querySelector('[data-top-scenario-name]');
		const topStartsEl = document.querySelector('[data-top-scenario-starts]');
		const topCompletesEl = document.querySelector('[data-top-scenario-completes]');

		if (topNameEl && stats.topScenarioTitle) {
			topNameEl.textContent = stats.topScenarioTitle;
		}
		if (topStartsEl && stats.topScenarioStarts !== undefined) {
			topStartsEl.textContent = `${Number(stats.topScenarioStarts).toLocaleString('ko-KR')}회`;
		}
		if (topCompletesEl && stats.topScenarioCompletes !== undefined) {
			topCompletesEl.textContent = Number(stats.topScenarioCompletes).toLocaleString('ko-KR');
		}
	}

	// ========================================================
	// [실제 DB 연동] 관리자 연습 추이 차트
	// ========================================================
	const svgLinePath = (values, xFor, yFor) => {
		const points = values.map((value, index) => [xFor(index), yFor(value)]);
		if (points.length < 2) return '';
		return points.reduce((path, point, index) => {
			if (index === 0) return `M${point[0]} ${point[1]}`;
			const previous = points[index - 1];
			const beforePrevious = points[Math.max(0, index - 2)];
			const next = points[Math.min(points.length - 1, index + 1)];
			const control1 = [previous[0] + (point[0] - beforePrevious[0]) / 6, previous[1] + (point[1] - beforePrevious[1]) / 6];
			const control2 = [point[0] - (next[0] - previous[0]) / 6, point[1] - (next[1] - previous[1]) / 6];
			return `${path} C${control1[0]} ${control1[1]} ${control2[0]} ${control2[1]} ${point[0]} ${point[1]}`;
		}, '');
	};

	async function renderDashboardTrend() {
		const trendStart = document.getElementById('dashboardTrendStart');
		const trendComplete = document.getElementById('dashboardTrendComplete');
		const trendArea = document.getElementById('dashboardTrendArea');
		const dashboardTrendPeriod = document.querySelector('[data-dashboard-trend-period]');
		const dashboardScenarioFilter = document.querySelector('[data-dashboard-scenario-filter]');

		if (!trendStart || !trendComplete || !trendArea) return;

		const periodValue = dashboardTrendPeriod?.value || 'monthly';
		const scenarioFilterValue = dashboardScenarioFilter?.value || 'all';
		const scenarioIdParam = scenarioFilterValue === 'all' ? '' : `&scenarioId=${scenarioFilterValue}`;

		try {
			const response = await fetch(`/api/admin/dashboard/trend?period=${periodValue}${scenarioIdParam}`);
			if (!response.ok) throw new Error('추이 데이터 조회 실패');
			const trendData = await response.json();

			const startsArr = trendData.starts || [];
			const completedArr = trendData.completed || [];
			const labelsArr = trendData.labels || [];

			const maxValue = Math.max(...startsArr, ...completedArr, 0);
			const step = trendData.step || 100;
			const axisMax = maxValue > 0 ? Math.ceil(maxValue * 1.1 / step) * step : (step * 4);

			const xMin = 48;
			const xMax = 790;
			const yTop = 26;
			const yBottom = 238;

			const xFor = (index) => xMin + (xMax - xMin) * index / (labelsArr.length > 1 ? (labelsArr.length - 1) : 1);
			const yFor = (value) => yBottom - (value / axisMax) * (yBottom - yTop);

			const startPath = svgLinePath(startsArr, xFor, yFor);
			const completePath = svgLinePath(completedArr, xFor, yFor);

			trendStart.setAttribute('d', startPath);
			trendComplete.setAttribute('d', completePath);
			trendArea.setAttribute('d', startPath ? `${startPath} L${xMax} ${yBottom} L${xMin} ${yBottom} Z` : '');

			const grid = document.querySelector('[data-trend-grid]');
			if (grid) grid.innerHTML = Array.from({ length: 5 }, (_, index) => {
				const y = yTop + (yBottom - yTop) * index / 4;
				return `<line x1="${xMin}" y1="${y}" x2="${xMax}" y2="${y}"/>`;
			}).join('');

			const yLabels = document.querySelector('[data-trend-y-labels]');
			if (yLabels) yLabels.innerHTML = Array.from({ length: 5 }, (_, index) => {
				const value = Math.round(axisMax * (4 - index) / 4);
				const y = yTop + (yBottom - yTop) * index / 4 + 4;
				return `<text x="8" y="${y}">${value.toLocaleString('ko-KR')}</text>`;
			}).join('');

			const xLabels = document.querySelector('[data-trend-x-labels]');
			if (xLabels) xLabels.innerHTML = labelsArr.map((label, index) => `<text x="${xFor(index)}" y="266">${label}</text>`).join('');

			const scenarioLabel = dashboardScenarioFilter?.selectedOptions[0]?.textContent || '전체 시나리오';
			const unitLabel = dashboardTrendPeriod?.selectedOptions[0]?.textContent || '월별';
			const chart = document.querySelector('.admin-svg-chart svg[aria-label]');
			if (chart) chart.setAttribute('aria-label', `${trendData.range || ''} ${scenarioLabel} ${unitLabel} 연습 시작과 완료 건수 추이`);
		} catch (error) {
			console.error('추이 데이터 로드 오류:', error);
		}
	}

	document.querySelector('[data-dashboard-scenario-filter]')?.addEventListener('change', renderDashboardTrend);
	document.querySelector('[data-dashboard-trend-period]')?.addEventListener('change', renderDashboardTrend);

	// 외부 노출
	window.loadAdminDashboardStats = loadAdminDashboardStats;
	window.loadAdminActivityLog = loadAdminActivityLog;
	window.renderDashboardTrend = renderDashboardTrend;
})();
