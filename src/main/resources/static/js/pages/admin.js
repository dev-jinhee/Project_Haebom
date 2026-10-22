(() => {
  const toast = window.Haebom.toast;

  const escapeAdminHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

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
      if (typeof loadAdminDashboardStats === 'function') loadAdminDashboardStats();
      if (typeof renderDashboardTrend === 'function') renderDashboardTrend();
      if (typeof loadAdminActivityLog === 'function') loadAdminActivityLog();
      if (typeof loadAdminScenarios === 'function') loadAdminScenarios();
    }
    if (page === 'inquiries' && typeof loadAdminInquiries === 'function') {
      loadAdminInquiries();
    }
    if (page === 'members' && typeof loadAdminMembers === 'function') {
      loadAdminMembers();
    }
    if (page === 'scenarios' && typeof loadAdminScenarios === 'function') {
      loadAdminScenarios();
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
  renderAdminPage();

  // ========================================================
  // ⭐ [실제 DB 연동] 관리자 최근 활동 로그
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

    const items = activities;

    items.slice(0, 6).forEach((activity) => {
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

  // 초기 로드 시도
  loadAdminActivityLog();


  // ========================================================
  // ⭐ [실제 DB 연동] 관리자 대시보드 종합 통계
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
  // ⭐ [실제 DB 연동] 관리자 시나리오 관리
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

    if (titleEl) titleEl.textContent = scenario.scenarioTitle;
    if (idInput) idInput.value = scenario.scenarioId;
    if (nameInput) nameInput.value = scenario.scenarioTitle;
    if (categorySelect) categorySelect.value = scenario.categoryId || '1';
    if (minutesInput) minutesInput.value = scenario.estimatedMinutes || 5;
    if (statusSelect) statusSelect.value = scenario.isActive ? 'true' : 'false';

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

    const updatePayload = {
      scenarioId: Number(selectedAdminScenarioId),
      scenarioTitle: nameInput.value.trim(),
      categoryId: Number(categorySelect?.value || 1),
      estimatedMinutes: Number(minutesInput.value),
      isActive: statusSelect.value === 'true'
    };

    try {
      const response = await fetch(`/api/admin/scenarios/${selectedAdminScenarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
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

  // ========================================================
  // ⭐ [실제 DB 연동] 관리자 회원 관리
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
      adminMemberCache = list || [];

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
  document.getElementById('memberDetailModal')?.addEventListener('show.bs.modal', (event) => {
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
      draftBody.innerHTML = '<tr><td colspan="5" class="text-center text-secondary py-4">임시 저장된 연습이 없습니다.</td></tr>';
    }
    if (draftCount) draftCount.textContent = '0건';
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
      if (typeof loadAdminActivityLog === 'function') loadAdminActivityLog();
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

  // ========================================================
  // ⭐ [실제 DB 연동] 관리자 문의 게시판 관리
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
      const author = qna.memberName || ('회원' + qna.memberId);

      return `
        <tr data-inquiry-row data-inquiry-id="${qna.qnaId}">
          <td class="ps-3"><strong>${escapeAdminHtml(qna.qnaTitle)}</strong></td>
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
          <p class="mb-0" style="white-space: pre-line;">${escapeAdminHtml(ans.qnaAnswerContent)}</p>
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

    document.getElementById('inquiryDetailTitle').textContent = inquiry.qnaTitle;
    document.querySelector('[data-inquiry-author]').textContent = inquiry.memberName || ('회원' + inquiry.memberId);
    document.getElementById('inquiryCategorySelect').value = inquiry.qnaCategoryName || '시뮬레이션 문의';
    document.querySelector('[data-inquiry-date]').textContent = inquiry.qnaCreatedAt ? String(inquiry.qnaCreatedAt).substring(0, 10).replace(/-/g, '.') : '';
    document.querySelector('[data-inquiry-content]').textContent = inquiry.qnaContent;
    document.getElementById('inquiryStatusSelect').value = inquiry.qnaStatus === 'ANSWERED' ? '답변 완료' : '답변 대기';
    document.getElementById('inquiryReplyText').value = '';

    // 실제 DB에서 해당 문의글의 답변 목록 로드
    loadInquiryAnswers(selectedInquiryId);
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
      const response = await fetch(`/api/inquiries/${selectedInquiryId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qnaAnswerContent: answerContent
        })
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

      if (typeof loadAdminActivityLog === 'function') loadAdminActivityLog();

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
      const response = await fetch(`/api/inquiries/${selectedInquiryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qnaCategoryId: categoryId,
          qnaStatus: qnaStatus
        })
      });

      if (!response.ok) throw new Error('상태 저장 실패');

      toast('문의 분류와 상태를 저장했습니다.');
      bootstrap.Modal.getOrCreateInstance(document.getElementById('inquiryDetailModal')).hide();

      // 전체 문의 목록 및 카운트 새로고침
      await loadAdminInquiries();

      if (typeof loadAdminActivityLog === 'function') loadAdminActivityLog();

    } catch (error) {
      console.error('문의 상태 변경 실패:', error);
      toast('변경사항 저장에 실패했습니다.');
    }
  });

  // 8. 최초 DB 데이터 로드 실행
  loadAdminDashboardStats();
  loadAdminActivityLog();
  loadAdminInquiries();
  loadAdminMembers();
  loadAdminScenarios();

  // 전역 호출 가능하게 노출 (외부 새로고침용)
  window.loadAdminDashboardStats = loadAdminDashboardStats;
  window.loadAdminActivityLog = loadAdminActivityLog;
  window.loadAdminInquiries = loadAdminInquiries;
  window.loadAdminMembers = loadAdminMembers;
  window.loadAdminScenarios = loadAdminScenarios;

})();
