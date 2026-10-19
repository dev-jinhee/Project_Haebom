(() => {
  const toast = window.Haebom.toast;
const adminPageTitles = {
    dashboard: '이용 현황',
    members: '회원',
    scenarios: '시나리오',
    inquiries: '문의 게시판'
  };
  const renderAdminPage = () => {
    if (window.location.pathname !== '/admin.html') return;
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

  const adminActivityStorageKey = 'ongyeol-admin-activity-log';
  let adminActivityLog = [];
  try {
    const savedActivityLog = JSON.parse(localStorage.getItem(adminActivityStorageKey) || '[]');
    if (Array.isArray(savedActivityLog)) adminActivityLog = savedActivityLog;
  } catch (_) { adminActivityLog = []; }
  const adminActivityExamples = [
    { type: 'inquiry', title: '김○○ 회원 문의에 답변했습니다.', operatorId: 'admin', at: new Date(2026, 9, 15, 14, 20).toISOString(), isExample: true },
    { type: 'scenario', title: '전입신고 시나리오를 수정했습니다.', operatorId: 'admin', at: new Date(2026, 9, 15, 13, 45).toISOString(), isExample: true }
  ];
  const adminActivityIcons = {
    member: ['blue', 'bi-person-gear'],
    inquiry: ['amber', 'bi-chat-left-text'],
    scenario: ['teal', 'bi-diagram-3']
  };
  const formatAdminActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (value) => String(value).padStart(2, '0');
    const datePart = `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
    const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    const today = new Date();
    return date.toDateString() === today.toDateString() ? `오늘 ${timePart}` : `${datePart} ${timePart}`;
  };
  const renderAdminActivityLog = () => {
    const list = document.querySelector('[data-admin-activity-list]');
    if (!list) return;
    list.replaceChildren();
    const visibleActivities = adminActivityLog.length ? adminActivityLog.slice(0, 6) : adminActivityExamples;
    visibleActivities.forEach((activity) => {
      const [color, icon] = adminActivityIcons[activity.type] || adminActivityIcons.member;
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
      row.append(symbol, copy);
      const metadata = document.createElement('small');
      metadata.textContent = `운영자 ID ${activity.operatorId || 'admin'} · ${formatAdminActivityTime(activity.at)}`;
      copy.append(metadata);
      list.append(row);
    });
  };
  const addAdminActivity = (type, title, detail) => {
    adminActivityLog.unshift({ type, title, detail, operatorId: localStorage.getItem('ongyeol-demo-admin-id') || 'admin', at: new Date().toISOString() });
    adminActivityLog = adminActivityLog.slice(0, 30);
    localStorage.setItem(adminActivityStorageKey, JSON.stringify(adminActivityLog));
    renderAdminActivityLog();
  };
  renderAdminActivityLog();

  const adminMembers = {
    'minji.kim': { name: '김민지', email: 'minji.k***@example.com', joined: '2026.09.21', draft: { stage: '4단계 · 이전 주소', percent: 80, stageCount: '4/5', savedAt: '2026.10.13 14:20', expiresAt: '2026.11.12' } },
    'do.lee': { name: '이도현', email: 'do.l***@example.com', joined: '2026.09.28', draft: null },
    'seoyeon.p': { name: '박서연', email: 'seo.p***@example.com', joined: '2026.10.03', draft: { stage: '3단계 · 기본 정보', percent: 60, stageCount: '3/5', savedAt: '2026.10.12 09:45', expiresAt: '2026.11.11' } }
  };
  const statusKey = 'ongyeol-admin-member-statuses';
  let memberStatuses = {};
  try { memberStatuses = JSON.parse(localStorage.getItem(statusKey) || '{}'); } catch (_) { memberStatuses = {}; }
  const statusBadgeClass = (status) => status === '정상' ? 'text-bg-success' : status === '이용 정지' ? 'text-bg-warning' : 'text-bg-secondary';
  document.querySelectorAll('[data-member-row]').forEach((row) => {
    const status = memberStatuses[row.dataset.memberId];
    const badge = row.querySelector('[data-member-status]');
    if (status && badge) { badge.textContent = status; badge.className = `badge ${statusBadgeClass(status)}`; }
  });

  const scenarioDefaults = { name: '전입신고', category: '이사·주거', estimatedMinutes: 5, status: '운영 중' };
  let scenarioSettings = scenarioDefaults;
  try { scenarioSettings = { ...scenarioDefaults, ...JSON.parse(localStorage.getItem('ongyeol-admin-scenario') || '{}') }; } catch (_) { scenarioSettings = scenarioDefaults; }
  const scenarioNameInput = document.getElementById('scenarioName');
  const scenarioCategoryInput = document.getElementById('scenarioCategory');
  const scenarioEstimatedMinutesInput = document.getElementById('scenarioEstimatedMinutes');
  const scenarioStatusInput = document.getElementById('scenarioStatus');
  const scenarioSearch = document.querySelector('[data-scenario-search]');
  const scenarioStatusFilter = document.querySelector('[data-scenario-status-filter]');
  const applyScenarioFilters = () => {
    const query = scenarioSearch?.value.trim().toLocaleLowerCase() || '';
    const selectedStatus = scenarioStatusFilter?.value || '전체 상태';
    let visibleCount = 0;
    document.querySelectorAll('[data-scenario-row]').forEach((row) => {
      const name = row.querySelector('[data-scenario-name-display]')?.textContent.toLocaleLowerCase() || '';
      const status = row.querySelector('[data-scenario-status-display]')?.textContent.trim() || '';
      const visible = name.includes(query) && (selectedStatus === '전체 상태' || status === selectedStatus);
      row.classList.toggle('d-none', !visible);
      if (visible) visibleCount += 1;
    });
    document.querySelector('[data-scenario-empty]')?.classList.toggle('d-none', visibleCount > 0);
  };
  scenarioSearch?.addEventListener('input', applyScenarioFilters);
  scenarioStatusFilter?.addEventListener('change', applyScenarioFilters);
  if (scenarioNameInput) scenarioNameInput.value = scenarioSettings.name;
  if (scenarioCategoryInput) scenarioCategoryInput.value = scenarioSettings.category;
  if (scenarioEstimatedMinutesInput) scenarioEstimatedMinutesInput.value = scenarioSettings.estimatedMinutes;
  if (scenarioStatusInput) scenarioStatusInput.value = scenarioSettings.status;
  const renderScenarioSettings = () => {
    document.querySelectorAll('[data-scenario-name-display]').forEach((node) => { node.textContent = scenarioSettings.name; });
    document.querySelectorAll('[data-scenario-category-display]').forEach((node) => { node.textContent = scenarioSettings.category; });
    document.querySelectorAll('[data-scenario-estimated-minutes]').forEach((node) => { node.innerHTML = `<i class="bi bi-clock me-1" aria-hidden="true"></i>예상 ${scenarioSettings.estimatedMinutes}분`; });
    document.querySelectorAll('[data-scenario-status-display]').forEach((node) => {
      node.textContent = scenarioSettings.status;
      node.className = `badge ${scenarioSettings.status === '운영 중' ? 'text-bg-success' : scenarioSettings.status === '점검 중' ? 'text-bg-warning' : 'text-bg-secondary'}`;
    });
    const title = document.getElementById('scenarioDetailTitle');
    if (title) title.textContent = scenarioSettings.name;
    const scenarioOption = document.querySelector('[data-current-scenario-option]');
    if (scenarioOption) scenarioOption.textContent = scenarioSettings.name;
    document.querySelectorAll('[data-top-scenario-name]').forEach((node) => { node.textContent = scenarioSettings.name; });
    const scenarioStatuses = [...document.querySelectorAll('[data-scenario-status-display]')].map((node) => node.textContent.trim());
    const totalScenarioCount = scenarioStatuses.length || 1;
    const activeScenarioCount = scenarioStatuses.length
      ? scenarioStatuses.filter((status) => status === '운영 중').length
      : (scenarioSettings.status === '운영 중' ? 1 : 0);
    document.querySelectorAll('[data-total-scenario-count]').forEach((node) => { node.textContent = String(totalScenarioCount); });
    document.querySelectorAll('[data-active-scenario-count]').forEach((node) => { node.textContent = `${activeScenarioCount}개`; });
    applyScenarioFilters();
  };
  renderScenarioSettings();
  const dashboardScenarioFilter = document.querySelector('[data-dashboard-scenario-filter]');
  const dashboardTrendPeriod = document.querySelector('[data-dashboard-trend-period]');
  if (dashboardTrendPeriod) dashboardTrendPeriod.value = 'monthly';
  const trendArea = document.getElementById('dashboardTrendArea');
  const trendStart = document.getElementById('dashboardTrendStart');
  const trendComplete = document.getElementById('dashboardTrendComplete');
  const trendPeriodData = {
    daily: {
      range: '최근 7일', step: 10,
      starts: [24, 31, 28, 36, 33, 41, 38],
      completed: [17, 22, 19, 25, 24, 29, 27],
      labels: ['7일 전', '6일 전', '5일 전', '4일 전', '3일 전', '2일 전', '오늘']
    },
    monthly: {
      range: '최근 12개월', step: 100,
      starts: [150, 185, 170, 255, 270, 285, 360, 350, 390, 420, 485, 560],
      completed: [50, 85, 75, 165, 180, 160, 250, 245, 290, 275, 365, 440],
      labels: Array.from({ length: 12 }, (_, index) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - 11 + index);
        return `${date.getMonth() + 1}월`;
      })
    },
    yearly: {
      range: '최근 5년', step: 1000,
      starts: [1420, 1980, 2860, 3910, 5280],
      completed: [820, 1390, 2090, 2780, 4150],
      labels: Array.from({ length: 5 }, (_, index) => `${new Date().getFullYear() - 4 + index}년`)
    }
  };
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
  const renderDashboardTrend = () => {
    if (!trendStart || !trendComplete || !trendArea) return;
    const period = trendPeriodData[dashboardTrendPeriod?.value || 'monthly'];
    const maxValue = Math.max(...period.starts, ...period.completed);
    const axisMax = Math.ceil(maxValue * 1.1 / period.step) * period.step;
    const xMin = 48;
    const xMax = 790;
    const yTop = 26;
    const yBottom = 238;
    const xFor = (index) => xMin + (xMax - xMin) * index / (period.starts.length - 1);
    const yFor = (value) => yBottom - (value / axisMax) * (yBottom - yTop);
    const startPath = svgLinePath(period.starts, xFor, yFor);
    const completePath = svgLinePath(period.completed, xFor, yFor);
    trendStart.setAttribute('d', startPath);
    trendComplete.setAttribute('d', completePath);
    trendArea.setAttribute('d', `${startPath} L${xMax} ${yBottom} L${xMin} ${yBottom} Z`);
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
    if (xLabels) xLabels.innerHTML = period.labels.map((label, index) => `<text x="${xFor(index)}" y="266">${label}</text>`).join('');
    const scenarioLabel = dashboardScenarioFilter?.selectedOptions[0]?.textContent || '전체 시나리오';
    const unitLabel = dashboardTrendPeriod?.selectedOptions[0]?.textContent || '월별';
    const chart = document.querySelector('.admin-svg-chart svg[aria-label]');
    if (chart) chart.setAttribute('aria-label', `${period.range} ${scenarioLabel} ${unitLabel} 연습 시작과 완료 건수 추이`);
  };
  dashboardScenarioFilter?.addEventListener('change', renderDashboardTrend);
  dashboardTrendPeriod?.addEventListener('change', renderDashboardTrend);
  renderDashboardTrend();
  document.getElementById('scenarioDetailForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const previousSettings = scenarioSettings;
    scenarioSettings = { name: scenarioNameInput.value.trim(), category: scenarioCategoryInput.value.trim(), estimatedMinutes: Number(scenarioEstimatedMinutesInput.value), status: scenarioStatusInput.value };
    localStorage.setItem('ongyeol-admin-scenario', JSON.stringify(scenarioSettings));
    renderScenarioSettings();
    if (JSON.stringify(previousSettings) !== JSON.stringify(scenarioSettings)) {
      addAdminActivity('scenario', `${scenarioSettings.name} 시나리오를 수정했습니다.`, `${scenarioSettings.category} · 운영 상태 ${scenarioSettings.status}`);
    }
    bootstrap.Modal.getOrCreateInstance(document.getElementById('scenarioDetailModal')).hide();
    toast('시나리오 정보를 저장했습니다.');
  });

  let selectedMemberId = '';
  document.getElementById('memberDetailModal')?.addEventListener('show.bs.modal', (event) => {
    selectedMemberId = event.relatedTarget?.dataset.memberDetail || '';
    const member = adminMembers[selectedMemberId];
    if (!member) return;
    document.getElementById('memberDetailTitle').textContent = `${member.name} 회원 상세`;
    document.querySelector('[data-member-detail-id]').textContent = selectedMemberId;
    document.querySelector('[data-member-detail-email]').textContent = member.email;
    document.querySelector('[data-member-detail-joined]').textContent = member.joined;
    document.getElementById('memberAccountStatus').value = memberStatuses[selectedMemberId] || document.querySelector(`[data-member-row][data-member-id="${selectedMemberId}"] [data-member-status]`)?.textContent || '정상';
    const draftBody = document.querySelector('[data-member-drafts]');
    const draftCount = document.querySelector('[data-member-draft-count]');
    if (!member.draft) {
      draftBody.innerHTML = '<tr><td colspan="5" class="text-center text-secondary py-4">임시 저장된 연습이 없습니다.</td></tr>';
      draftCount.textContent = '0건';
      return;
    }
    draftBody.innerHTML = `<tr><td>전입신고</td><td>${member.draft.stage}</td><td>${member.draft.percent}% <small class="text-secondary">(${member.draft.stageCount})</small></td><td>${member.draft.savedAt}</td><td>${member.draft.expiresAt}</td></tr>`;
    draftCount.textContent = '1건';
  });
  document.querySelector('[data-save-member-status]')?.addEventListener('click', () => {
    if (!selectedMemberId) return;
    const status = document.getElementById('memberAccountStatus').value;
    const previousStatus = memberStatuses[selectedMemberId] || document.querySelector(`[data-member-row][data-member-id="${selectedMemberId}"] [data-member-status]`)?.textContent || '정상';
    memberStatuses[selectedMemberId] = status;
    localStorage.setItem(statusKey, JSON.stringify(memberStatuses));
    const row = document.querySelector(`[data-member-row][data-member-id="${selectedMemberId}"]`);
    const badge = row?.querySelector('[data-member-status]');
    if (badge) { badge.textContent = status; badge.className = `badge ${statusBadgeClass(status)}`; }
    if (previousStatus !== status) addAdminActivity('member', `${adminMembers[selectedMemberId].name} 회원 상태를 변경했습니다.`, `회원 목록 · ${previousStatus} → ${status}`);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('memberDetailModal')).hide();
    toast(`${adminMembers[selectedMemberId].name} 회원 상태를 변경했습니다.`);
  });
  document.querySelector('[data-member-search]')?.addEventListener('input', (event) => {
    const query = event.currentTarget.value.trim().toLowerCase();
    document.querySelectorAll('[data-member-row]').forEach((row) => { row.classList.toggle('d-none', !row.textContent.toLowerCase().includes(query)); });
  });

  const adminInquiries = {
    'draft-resume': { title: '저장한 연습을 다시 이어가고 싶어요', author: '김○○', category: '회원·계정 문의', date: '2026.10.13', content: '로그인했는데 저장 내역이 보이지 않습니다. 이전에 진행하던 전입신고 연습을 이어서 할 수 있는 방법을 알려주세요.', status: '답변 대기' },
    'screen-reader': { title: '큰 글씨 설정에서도 화면 읽기를 사용할 수 있나요?', author: '이○○', category: '기타 문의', date: '2026.10.12', content: '화면 읽기 기능 사용 방법을 문의합니다. 큰 글씨 설정을 켠 상태에서도 화면 읽기 기능을 함께 사용할 수 있나요?', status: '답변 대기' },
    'simulation-scope': { title: '실제 신청과 같은 절차인가요?', author: '박○○', category: '시뮬레이션 문의', date: '2026.10.11', content: '시뮬레이션에서 안내되는 절차가 정부24에서 실제로 신청할 때의 절차와 같은지 궁금합니다.', status: '답변 완료', responderId: 'admin', answers: [{ author: '관리자', createdAt: '2026.10.11', content: '해봄은 실제 민원 신청을 접수하는 서비스가 아니라, 정부24의 신청 절차를 미리 연습해 보는 학습용 서비스입니다.' }] },
    'move-address-edit': { title: '전입신고 연습 중 주소를 수정하고 싶어요', author: '정○○', category: '회원·계정 문의', date: '2026.10.10', content: '연습을 진행하다가 이전 주소를 잘못 입력했습니다. 처음부터 다시 시작하지 않고 입력한 주소만 수정할 수 있을까요?', status: '답변 대기' },
    'draft-retention': { title: '저장한 연습 내용은 얼마나 보관되나요?', author: '최○○', category: '회원·계정 문의', date: '2026.10.09', content: '중간 저장한 연습 내용이 언제까지 보관되는지 알고 싶습니다.', status: '답변 완료', responderId: 'admin', answers: [{ author: '관리자', createdAt: '2026.10.09', content: '저장된 연습 내용은 마지막 이용일로부터 30일간 보관됩니다.' }] },
    'simulation-error': { title: '주소 검색 단계에서 다음으로 넘어가지 않아요', author: '윤○○', category: '오류·버그 신고', date: '2026.10.08', content: '주소 검색 결과를 선택했는데 다음 단계 버튼이 활성화되지 않습니다. 크롬 브라우저에서 확인했습니다.', status: '답변 대기' },
    'mobile-support': { title: '휴대전화에서도 연습할 수 있나요?', author: '한○○', category: '기타 문의', date: '2026.10.07', content: '컴퓨터가 아닌 스마트폰에서도 행정절차 연습을 이용할 수 있는지 문의드립니다.', status: '답변 완료', responderId: 'admin', answers: [{ author: '관리자', createdAt: '2026.10.07', content: '네, 모바일 브라우저에서도 이용하실 수 있습니다.' }] },
    'household-head': { title: '세대주가 아니어도 전입신고를 할 수 있나요?', author: '장○○', category: '시뮬레이션 문의', date: '2026.10.06', content: '전입신고 연습 중 세대주 여부를 선택하는 단계가 있습니다. 세대원이 신청하는 경우 어떤 항목을 선택해야 하는지 궁금합니다.', status: '답변 대기' }
  };
  const inquiryStorageKey = 'ongyeol-admin-inquiries';
  let savedInquiryStates = {};
  try { savedInquiryStates = JSON.parse(localStorage.getItem(inquiryStorageKey) || '{}'); } catch (_) { savedInquiryStates = {}; }
  const inquiryBadgeClass = (status) => status === '답변 완료' ? 'text-bg-success' : 'text-bg-warning';
  const getInquiryAnswers = (inquiryId) => {
    const saved = savedInquiryStates[inquiryId] || {};
    if (Array.isArray(saved.answers)) return saved.answers;
    const legacyReply = saved.reply || adminInquiries[inquiryId]?.reply;
    if (legacyReply) return [{ author: '관리자', createdAt: '기존 답변', content: legacyReply }];
    return adminInquiries[inquiryId]?.answers || [];
  };
  const renderInquiryAnswers = (inquiryId) => {
    const list = document.querySelector('[data-inquiry-answers]');
    if (!list) return;
    list.replaceChildren();
    const answers = getInquiryAnswers(inquiryId);
    if (!answers.length) {
      const empty = document.createElement('p');
      empty.className = 'inquiry-answer-empty mb-0';
      empty.textContent = '아직 등록된 답변이 없습니다.';
      list.append(empty);
      return;
    }
    answers.forEach((answer, index) => {
      const item = document.createElement('article');
      item.className = 'inquiry-answer-item';
      const heading = document.createElement('div');
      heading.className = 'inquiry-answer-meta';
      const number = document.createElement('span');
      number.className = 'inquiry-answer-number';
      number.textContent = `답변 ${index + 1}`;
      const author = document.createElement('strong');
      author.textContent = answer.author || '관리자';
      const timestamp = document.createElement('time');
      timestamp.textContent = answer.createdAt || '';
      heading.append(number, author, timestamp);
      const content = document.createElement('p');
      content.className = 'mb-0';
      content.textContent = answer.content || '';
      item.append(heading, content);
      list.append(item);
    });
  };
  const inquiryStatusSortButton = document.querySelector('[data-inquiry-status-sort]');
  const inquiryTableBody = document.querySelector('#inquiries-admin tbody');
  const inquiryRows = Array.from(document.querySelectorAll('[data-inquiry-row]'));
  const inquiryOriginalOrder = new Map(inquiryRows.map((row, index) => [row, index]));
  let inquirySortDirection = 0;
  const renderInquiryRows = () => {
    inquiryRows.forEach((row) => {
      const inquiry = adminInquiries[row.dataset.inquiryId];
      const saved = savedInquiryStates[row.dataset.inquiryId] || {};
      if (!inquiry) return;
      row.querySelector('[data-inquiry-category-cell]').textContent = saved.category || inquiry.category;
      const badge = row.querySelector('[data-inquiry-status]');
      const status = saved.status || inquiry.status;
      badge.textContent = status;
      badge.className = `badge ${inquiryBadgeClass(status)}`;
      row.querySelector('[data-inquiry-responder]').textContent = status === '답변 완료'
        ? saved.responderId || inquiry.responderId || 'admin' : '—';
    });
    if (inquirySortDirection && inquiryTableBody) {
      inquiryRows.sort((first, second) => {
        const waitingRank = (row) => row.querySelector('[data-inquiry-status]')?.textContent === '답변 대기' ? 0 : 1;
        return (waitingRank(first) - waitingRank(second)) * inquirySortDirection
          || inquiryOriginalOrder.get(first) - inquiryOriginalOrder.get(second);
      }).forEach((row) => inquiryTableBody.append(row));
    }
    if (inquiryStatusSortButton) {
      const icon = inquiryStatusSortButton.querySelector('i');
      if (icon) icon.className = `bi ${inquirySortDirection === 1 ? 'bi-sort-down' : inquirySortDirection === -1 ? 'bi-sort-up' : 'bi-arrow-down-up'}`;
      inquiryStatusSortButton.setAttribute('aria-pressed', String(inquirySortDirection !== 0));
      inquiryStatusSortButton.title = inquirySortDirection === 1 ? '현재 정렬: 답변 대기 우선' : inquirySortDirection === -1 ? '현재 정렬: 답변 완료 우선' : '상태순 정렬';
    }
  };
  renderInquiryRows();
  inquiryStatusSortButton?.addEventListener('click', () => {
    inquirySortDirection = inquirySortDirection === 1 ? -1 : 1;
    renderInquiryRows();
  });
  let selectedInquiryId = '';
  document.getElementById('inquiryDetailModal')?.addEventListener('show.bs.modal', (event) => {
    selectedInquiryId = event.relatedTarget?.dataset.inquiryDetail || '';
    const inquiry = adminInquiries[selectedInquiryId];
    if (!inquiry) return;
    const saved = savedInquiryStates[selectedInquiryId] || {};
    document.getElementById('inquiryDetailTitle').textContent = inquiry.title;
    document.querySelector('[data-inquiry-author]').textContent = inquiry.author;
    document.getElementById('inquiryCategorySelect').value = saved.category || inquiry.category;
    document.querySelector('[data-inquiry-date]').textContent = inquiry.date;
    document.querySelector('[data-inquiry-content]').textContent = inquiry.content;
    document.getElementById('inquiryStatusSelect').value = saved.status || inquiry.status;
    document.getElementById('inquiryReplyText').value = '';
    renderInquiryAnswers(selectedInquiryId);
  });
  document.querySelector('[data-save-inquiry-status]')?.addEventListener('click', () => {
    if (!selectedInquiryId) return;
    const inquiry = adminInquiries[selectedInquiryId];
    const previous = savedInquiryStates[selectedInquiryId] || {};
    const nextCategory = document.getElementById('inquiryCategorySelect').value;
    const nextStatus = document.getElementById('inquiryStatusSelect').value;
    const previousCategory = previous.category || inquiry.category;
    const previousStatus = previous.status || inquiry.status;
    savedInquiryStates[selectedInquiryId] = {
      ...previous,
      category: nextCategory,
      status: nextStatus,
      responderId: nextStatus === '답변 완료' ? previous.responderId || inquiry.responderId || 'admin' : previous.responderId
    };
    localStorage.setItem(inquiryStorageKey, JSON.stringify(savedInquiryStates));
    renderInquiryRows();
    if (previousStatus !== nextStatus) addAdminActivity('inquiry', `${inquiry.author} 회원 문의 상태를 변경했습니다.`, `${inquiry.title} · ${previousStatus} → ${nextStatus}`);
    if (previousCategory !== nextCategory) addAdminActivity('inquiry', `${inquiry.author} 회원 문의 분류를 변경했습니다.`, `${inquiry.title} · ${previousCategory} → ${nextCategory}`);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('inquiryDetailModal')).hide();
    toast('문의 분류와 상태를 저장했습니다.');
  });
  document.querySelector('[data-save-inquiry-reply]')?.addEventListener('click', () => {
    if (!selectedInquiryId) return;
    const answerContent = document.getElementById('inquiryReplyText').value.trim();
    if (!answerContent) { toast('답변 내용을 입력해 주세요.'); document.getElementById('inquiryReplyText').focus(); return; }
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const createdAt = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    savedInquiryStates[selectedInquiryId] = {
      ...(savedInquiryStates[selectedInquiryId] || {}),
      responderId: (savedInquiryStates[selectedInquiryId] || {}).responderId || 'admin',
      answers: [...getInquiryAnswers(selectedInquiryId), { author: '관리자', createdAt, content: answerContent }]
    };
    localStorage.setItem(inquiryStorageKey, JSON.stringify(savedInquiryStates));
    const inquiry = adminInquiries[selectedInquiryId];
    addAdminActivity('inquiry', `${inquiry.author} 회원 문의에 답변했습니다.`, inquiry.title);
    document.getElementById('inquiryReplyText').value = '';
    renderInquiryAnswers(selectedInquiryId);
    toast('답변을 등록했습니다. 문의 상태는 변경되지 않았습니다.');
  });
})();
