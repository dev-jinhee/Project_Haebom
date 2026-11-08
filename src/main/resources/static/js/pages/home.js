(function () {
  const page = document.getElementById('main-content');
  const logoutForm = document.querySelector('[data-logout-form]');
  let administrativeCenterMap = null;

  if (logoutForm !== null) {
    logoutForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
      const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content
        || 'X-CSRF-TOKEN';
      const csrfInput = logoutForm.querySelector('input[name="_csrf"]');
      const token = csrfToken || (csrfInput ? csrfInput.value : '');
      const submitButton = logoutForm.querySelector('[type="submit"]');

      if (!token) {
        window.alert('보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.');
        return;
      }

      if (submitButton) submitButton.disabled = true;
      try {
        const params = new URLSearchParams(new FormData(logoutForm));
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Accept': 'text/html'
        };
        headers[csrfHeader] = token;

        const response = await fetch(logoutForm.action, {
          method: 'POST',
          credentials: 'same-origin',
          headers: headers,
          body: params.toString()
        });

        if (response.redirected) {
          window.location.assign(response.url);
        } else if (response.ok) {
          window.location.reload();
        } else {
          throw new Error('로그아웃 요청을 처리하지 못했습니다. 다시 시도해 주세요.');
        }
      } catch (error) {
        window.alert(error.message || '로그아웃 중 통신 오류가 발생했습니다.');
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  if (page !== null) {
    loadMainPage(page);
  }

  initializePolicySearch();
  initializeAdministrativeCenterMap();

  function show(element, visible) {
    if (element !== null) {
      element.hidden = !visible;
    }
  }

  function initializeAdministrativeCenterMap() {
    const section = document.getElementById('center-map-section');
    if (section === null) return;

    const mapElement = document.getElementById('center-map');
    const message = document.getElementById('center-map-message');
    const apiKey = (section.dataset.mapKey || '').trim();
    if (mapElement === null || message === null) return;

    if (!apiKey) {
      message.textContent = 'Google Maps 브라우저 키가 설정되지 않아 지도를 표시할 수 없습니다.';
      mapElement.hidden = true;
      return;
    }

    message.textContent = '지도를 불러오는 중입니다.';

    window.initHaebomCenterMap = function () {
      if (!window.google || !window.google.maps) {
        message.textContent = '지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
        return;
      }

      administrativeCenterMap = new google.maps.Map(mapElement, {
        center: { lat: 36.5, lng: 127.8 },
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
      });
      message.textContent = '지역 선택 기능은 다음 단계에서 연결합니다.';
    };

    window.gm_authFailure = function () {
      message.textContent = 'Google Maps 인증에 실패했습니다. API 키와 허용 도메인 설정을 확인해 주세요.';
    };

    const script = document.createElement('script');
    const query = new URLSearchParams({
      key: apiKey,
      callback: 'initHaebomCenterMap',
      loading: 'async'
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${query.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = function () {
      message.textContent = 'Google Maps 스크립트를 불러오지 못했습니다. 네트워크와 API 키 설정을 확인해 주세요.';
    };
    document.head.append(script);
  }

  async function loadMainPage(pageElement) {
    const loggedOutView = document.getElementById('loggedOutView');
    const noProgressView = document.getElementById('loggedInNoProgressView');
    const inProgressView = document.getElementById('loggedInProgressView');
    const startGuideCard = document.getElementById('startGuideCard');
    const recentProgressMount = document.getElementById('recentProgressMount');

    try {
      const response = await fetch(pageElement.dataset.apiUrl, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error('메인 정보를 불러오지 못했습니다.');
      }

      const data = await response.json();
      const hasProgress = Boolean(data.recentScenario);

      initializePopularScenarios(
        document.getElementById('popular-scenarios'),
        data.popularScenarios || [],
        Boolean(data.loggedIn),
        pageElement.dataset.apiUrl
      );

      show(loggedOutView, !data.loggedIn);
      show(noProgressView, data.loggedIn && !hasProgress);
      show(inProgressView, data.loggedIn && hasProgress);
      show(startGuideCard, !data.loggedIn || !hasProgress);
      show(recentProgressMount, data.loggedIn && hasProgress);

      if (data.loggedIn) {
        setMemberName('memberNameNoProgress', data.memberName);
        setMemberName('memberNameProgress', data.memberName);
      }

      if (data.loggedIn && hasProgress) {
        await renderRecentScenarioCard(recentProgressMount, data.recentScenario, pageElement.dataset.apiUrl);
      }
    } catch (error) {
      console.error(error);
      initializePopularScenarios(
        document.getElementById('popular-scenarios'),
        [],
        false,
        pageElement.dataset.apiUrl,
        '인기 시나리오를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
      );
      show(loggedOutView, true);
      show(noProgressView, false);
      show(inProgressView, false);
      show(startGuideCard, true);
      show(recentProgressMount, false);
    }
  }

  function setMemberName(elementId, memberName) {
    const element = document.getElementById(elementId);

    if (element !== null) {
      element.textContent = memberName || '';
    }
  }

  function initializePopularScenarios(root, items, loggedIn, mainApiUrl, loadError) {
    if (root === null) return;

    const slide = root.querySelector('[data-popular-slide]');
    const position = root.querySelector('[data-popular-position]');
    const dots = root.querySelector('[data-popular-dots]');
    const feedback = root.querySelector('[data-popular-feedback]');
    const previousButton = root.querySelector('[data-popular-prev]');
    const nextButton = root.querySelector('[data-popular-next]');
    const toggleButton = root.querySelector('[data-popular-toggle]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mainUrl = new URL(mainApiUrl, window.location.href);
    const contextPath = mainUrl.pathname.replace(/\/api\/main\/?$/, '');
    const scenarios = Array.isArray(items) ? items : [];
    let currentIndex = 0;
    let timerId = null;
    let paused = reducedMotion;

    function updateAutoPlayButton() {
      const icon = toggleButton.querySelector('.material-symbols-outlined');
      const isRunning = timerId !== null;
      icon.textContent = isRunning ? 'pause' : 'play_arrow';
      toggleButton.setAttribute('aria-label', isRunning ? '자동 넘김 일시정지' : '자동 넘김 시작');
      toggleButton.setAttribute('aria-pressed', String(!isRunning));
    }

    function stopAutoPlay() {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
      updateAutoPlayButton();
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (paused || reducedMotion || scenarios.length < 2) return;
      timerId = window.setInterval(function () {
        currentIndex = (currentIndex + 1) % scenarios.length;
        render();
      }, 6000);
      updateAutoPlayButton();
    }

    function render() {
      slide.replaceChildren();
      dots.replaceChildren();

      if (loadError || scenarios.length === 0) {
        const message = document.createElement('p');
        message.className = 'popular-scenarios-status';
        message.textContent = loadError || '이번 달 인기 시나리오가 아직 없습니다.';
        slide.append(message);
        position.textContent = '0 / 0';
        previousButton.disabled = true;
        nextButton.disabled = true;
        toggleButton.disabled = true;
        stopAutoPlay();
        return;
      }

      const item = scenarios[currentIndex];
      const card = document.createElement('article');
      card.className = 'popular-scenario-card';

      const copy = document.createElement('div');
      copy.className = 'popular-scenario-copy';

      const eyebrow = document.createElement('div');
      eyebrow.className = 'popular-scenario-eyebrow';
      const rank = document.createElement('span');
      rank.className = 'popular-scenario-rank';
      rank.textContent = `인기 ${currentIndex + 1}`;
      const category = document.createElement('span');
      category.className = 'popular-scenario-category';
      category.textContent = item.categoryLabel || item.categoryName || '행정절차';
      eyebrow.append(rank, category);

      const title = document.createElement('h3');
      title.textContent = item.scenarioTitle || '시나리오';
      const description = document.createElement('p');
      description.textContent = item.description || '단계별 행정절차를 미리 연습해 보세요.';

      const duration = document.createElement('p');
      duration.className = 'popular-scenario-duration';
      const minutes = Number(item.estimatedMinutes);
      duration.textContent = Number.isFinite(minutes) && minutes > 0
        ? `예상 ${minutes}분 · 학습용 시뮬레이션`
        : '학습용 시뮬레이션';
      copy.append(eyebrow, title, description, duration);

      const actions = document.createElement('div');
      actions.className = 'popular-scenario-actions';
      const startButton = document.createElement('button');
      startButton.className = 'btn btn-light rounded-pill';
      startButton.type = 'button';
      startButton.textContent = loggedIn ? '연습 시작' : '로그인하고 연습하기';
      startButton.addEventListener('click', function () {
        startScenario(item.scenarioId, startButton);
      });
      const listLink = document.createElement('a');
      listLink.className = 'popular-scenario-list-link';
      listLink.href = `${contextPath}/scenario`;
      listLink.textContent = '시나리오 안내 보기';
      actions.append(startButton, listLink);

      card.append(copy, actions);
      slide.append(card);
      position.textContent = `${currentIndex + 1} / ${scenarios.length}`;
      previousButton.disabled = scenarios.length < 2;
      nextButton.disabled = scenarios.length < 2;
      toggleButton.disabled = scenarios.length < 2 || reducedMotion;

      scenarios.forEach(function (scenario, index) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'popular-carousel-dot';
        dot.setAttribute('aria-label', `인기 시나리오 ${index + 1} 보기`);
        dot.setAttribute('aria-current', String(index === currentIndex));
        dot.addEventListener('click', function () {
          currentIndex = index;
          render();
          startAutoPlay();
        });
        dots.append(dot);
      });

      updateAutoPlayButton();
    }

    async function startScenario(scenarioId, button) {
      if (!loggedIn) {
        const returnTo = `${contextPath}/scenario`;
        window.location.assign(`${contextPath}/login?redirect=${encodeURIComponent(returnTo)}`);
        return;
      }
      if (!Number.isInteger(Number(scenarioId))) {
        feedback.textContent = '시나리오 정보를 확인할 수 없습니다.';
        return;
      }

      button.disabled = true;
      feedback.textContent = '시나리오를 준비하고 있습니다.';
      try {
        const response = await fetch(
          `${contextPath}/api/scenario/${encodeURIComponent(scenarioId)}/start`,
          { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json' } }
        );
        if (response.redirected) {
          window.location.assign(response.url);
          return;
        }
        if (!response.ok) throw new Error('시나리오를 시작하지 못했습니다. 다시 시도해 주세요.');

        const progressId = await response.json();
        if (!Number.isInteger(Number(progressId))) {
          throw new Error('시작 결과를 확인하지 못했습니다. 시나리오 목록에서 다시 시작해 주세요.');
        }
        window.sessionStorage.setItem('progressId', String(progressId));
        window.location.assign(`${contextPath}/simulation`);
      } catch (error) {
        feedback.textContent = error.message || '시나리오 시작 중 오류가 발생했습니다.';
        button.disabled = false;
      }
    }

    previousButton.addEventListener('click', function () {
      if (scenarios.length < 2) return;
      currentIndex = (currentIndex - 1 + scenarios.length) % scenarios.length;
      render();
      startAutoPlay();
    });
    nextButton.addEventListener('click', function () {
      if (scenarios.length < 2) return;
      currentIndex = (currentIndex + 1) % scenarios.length;
      render();
      startAutoPlay();
    });
    toggleButton.addEventListener('click', function () {
      paused = !paused;
      if (paused) stopAutoPlay();
      else startAutoPlay();
    });
    root.addEventListener('mouseenter', stopAutoPlay);
    root.addEventListener('mouseleave', startAutoPlay);
    root.addEventListener('focusin', stopAutoPlay);
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) startAutoPlay();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoPlay();
      else startAutoPlay();
    });

    render();
    startAutoPlay();
  }

  async function renderRecentScenarioCard(mount, item, mainApiUrl) {
    if (mount === null || !item || !item.scenario || !item.progress) {
      return;
    }

    const scenario = item.scenario;
    const progress = item.progress;
    const totalSteps = Number(scenario.stepCount) || 0;
    const currentStep = Math.max(0, Number(progress.stepOrder) || 0);
    const progressPercent = totalSteps > 1
      ? Math.min(100, Math.max(0, (currentStep - 1) / (totalSteps - 1) * 100))
      : (currentStep > 0 ? 100 : 0);

    let steps = [];
    try {
      const mainUrl = new URL(mainApiUrl, window.location.href);
      const contextPath = mainUrl.pathname.replace(/\/api\/main\/?$/, '');
      const stepsResponse = await fetch(
        `${contextPath}/api/scenario/${encodeURIComponent(scenario.scenarioId)}/steps`,
        { headers: { Accept: 'application/json' } }
      );
      if (!stepsResponse.ok) {
        throw new Error('시나리오 단계 정보를 불러오지 못했습니다.');
      }
      const allSteps = await stepsResponse.json();
      steps = Array.isArray(allSteps)
        ? allSteps
            .filter(function (step) { return Number(step.stepOrder) > 0; })
            .sort(function (left, right) {
              return Number(left.stepOrder) - Number(right.stepOrder);
            })
        : [];
    } catch (error) {
      console.error(error);
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      steps = Array.from({ length: totalSteps }, function (_, index) {
        return { stepOrder: index + 1, stepTitle: `${index + 1}단계` };
      });
    }

    const card = document.createElement('section');
    card.className = 'home-recent-progress';

    const heading = document.createElement('div');
    heading.className = 'home-recent-progress-heading';

    const title = document.createElement('h2');
    title.textContent = scenario.scenarioTitle || '시나리오';
    heading.append(title);

    const progressSection = document.createElement('div');
    progressSection.className = 'home-sim-progress';

    const progressHeading = document.createElement('div');
    progressHeading.className = 'home-sim-progress-heading';

    const currentTitle = document.createElement('strong');
    const activeStep = steps.find(function (step) {
      return Number(step.stepOrder) === currentStep;
    });
    currentTitle.textContent = currentStep === 0
      ? '사전정보 입력'
      : (activeStep ? activeStep.stepTitle : `${currentStep}단계`);

    const currentCount = document.createElement('span');
    currentCount.textContent = `현재 ${currentStep} / ${totalSteps}단계`;
    progressHeading.append(currentTitle, currentCount);

    const progressTrack = document.createElement('div');
    progressTrack.className = 'progress home-sim-progress-track';
    progressTrack.setAttribute('role', 'progressbar');
    progressTrack.setAttribute('aria-label', '시나리오 진행률');
    progressTrack.setAttribute('aria-valuemin', '0');
    progressTrack.setAttribute('aria-valuemax', '100');
    progressTrack.setAttribute('aria-valuenow', String(Math.round(progressPercent)));

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = `${progressPercent}%`;
    progressTrack.append(progressBar);

    const stepLabels = document.createElement('ol');
    stepLabels.className = 'home-sim-step-labels';
    stepLabels.setAttribute('aria-label', '단계별 진행 상황');

    steps.forEach(function (step) {
      const stepItem = document.createElement('li');
      const stepOrder = Number(step.stepOrder);
      const status = stepOrder < currentStep
        ? 'complete'
        : (stepOrder === currentStep ? 'active' : 'upcoming');
      stepItem.className = `home-sim-step-label step-label ${status}`;
      stepItem.textContent = step.stepTitle || `${stepOrder}단계`;

      if (status === 'active') {
        stepItem.setAttribute('aria-current', 'step');
      }

      stepLabels.append(stepItem);
    });

    progressSection.append(progressHeading, progressTrack, stepLabels);
    card.append(heading, progressSection);
    mount.replaceChildren(card);
  }

  function initializePolicySearch() {
    const policyForm = document.getElementById('policySearchForm');
    if (policyForm === null) {
      return;
    }

    const policyInput = document.getElementById('policySearchInput');
    const results = document.getElementById('policySearchResults');
    const message = document.getElementById('policySearchMessage');

    async function runPolicySearch() {
      const keyword = policyInput.value.trim();
      if (keyword === '') {
        message.textContent = '검색어를 입력해 주세요.';
        results.classList.add('d-none');
        policyInput.focus();
        return;
      }

      const requestUrl = new URL(policyForm.action, window.location.href);
      requestUrl.searchParams.set('keyword', keyword);
      message.textContent = '공공서비스를 검색하고 있습니다.';
      results.replaceChildren();
      results.classList.add('d-none');

      const submitButton = policyForm.querySelector('[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      try {
        const response = await fetch(requestUrl.toString(), {
          method: 'GET',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          throw new Error('공공서비스 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }

        const policies = await response.json();
        if (!Array.isArray(policies) || policies.length === 0) {
          message.textContent = '검색 결과가 없습니다. 다른 검색어를 입력해 주세요.';
          return;
        }

        policies.forEach(function (policy) {
          results.append(createPolicySearchCard(policy));
        });
        message.textContent = `검색 결과 ${policies.length}건`;
        results.classList.remove('d-none');
        results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (error) {
        message.textContent = error.message || '공공서비스 검색 중 오류가 발생했습니다.';
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    }

    function handlePolicyFormSubmit(event) {
      event.preventDefault();
      runPolicySearch();
    }

    policyForm.addEventListener('submit', handlePolicyFormSubmit);

    function createPolicySearchCard(policy) {
      const card = document.createElement('article');
      card.className = 'policy-search-result';

      const title = document.createElement('h3');
      title.textContent = policy.serviceName || '서비스명 미제공';

      const summary = document.createElement('p');
      summary.textContent = policy.summary || '자세한 내용은 공식 상세 페이지에서 확인해 주세요.';

      const target = document.createElement('p');
      target.textContent = '지원 대상: ' + (policy.target || '공식 상세 페이지에서 확인해 주세요.');

      const agency = document.createElement('p');
      agency.textContent = '소관 기관: ' + (policy.agencyName || '정보 미제공');

      const detailLink = document.createElement('a');
      detailLink.className = 'btn btn-sm btn-outline-primary align-self-start';
      detailLink.textContent = '정부 공식 상세 페이지';
      detailLink.href = safePolicyDetailUrl(policy.detailUrl);
      detailLink.target = '_blank';
      detailLink.rel = 'noopener noreferrer';

      card.append(title, summary, target, agency, detailLink);
      return card;
    }

    function safePolicyDetailUrl(value) {
      if (value) {
        try {
          const url = new URL(value);
          if (url.protocol === 'https:') {
            return url.toString();
          }
        } catch (error) {
          // 잘못된 주소는 공식 사이트로 대체합니다.
        }
      }
      return 'https://www.gov.kr/';
    }
  }

})();
