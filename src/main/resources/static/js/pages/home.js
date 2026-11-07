(function () {
  const page = document.getElementById('main-content');
  const logoutForm = document.querySelector('[data-logout-form]');

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
