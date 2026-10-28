(function () {
  const page = document.getElementById('main-content');

  if (page !== null) {
    loadMainPage(page);
  }

  initializePolicySearch();

  function show(element, visible) {
    if (element !== null) {
      element.hidden = !visible;
    }
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

    // 정책 검색 영역이 화면에 없으면 정책 검색만 초기화하지 않습니다.
    if (policyForm === null) {
      return;
    }

    const policyInput = document.getElementById('policySearchInput');
    const results = document.getElementById('policySearchResults');
    const emptyMessage = document.getElementById('policySearchEmpty');
    const resultCards = document.querySelectorAll('.policy-search-result');
    const policyButtons = document.querySelectorAll('[data-policy-query]');

    function runPolicySearch(query) {
      const normalizedQuery = query.trim().toLowerCase();

      if (normalizedQuery === '') {
        if (window.Haebom && typeof window.Haebom.toast === 'function') {
          window.Haebom.toast('정책명이나 관심 분야를 입력해 주세요.');
        }

        if (policyInput !== null) {
          policyInput.focus();
        }
        return;
      }

      let matchCount = 0;

      resultCards.forEach(updatePolicyResultCard);
      updateEmptyMessage();

      if (results !== null) {
        results.classList.remove('d-none');
        results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      function updatePolicyResultCard(card) {
        const policyTerms = card.getAttribute('data-policy-terms') || '';
        const searchableText = policyTerms + ' ' + card.textContent;
        const matches = searchableText.toLowerCase().indexOf(normalizedQuery) !== -1;

        card.classList.toggle('d-none', !matches);
        if (matches) {
          matchCount += 1;
        }
      }

      function updateEmptyMessage() {
        if (emptyMessage === null) {
          return;
        }

        emptyMessage.classList.toggle('d-none', matchCount > 0);
      }
    }

    function handlePolicyFormSubmit(event) {
      event.preventDefault();

      const query = policyInput === null ? '' : policyInput.value;
      runPolicySearch(query);
    }

    function handlePolicyButtonClick(event) {
      const button = event.currentTarget;
      const query = button.getAttribute('data-policy-query') || '';

      if (policyInput !== null) {
        policyInput.value = query;
      }

      runPolicySearch(query);
    }

    function addPolicyButtonListener(button) {
      button.addEventListener('click', handlePolicyButtonClick);
    }

    policyForm.addEventListener('submit', handlePolicyFormSubmit);
    policyButtons.forEach(addPolicyButtonListener);
  }
})();
