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

      if (
        data.loggedIn &&
        hasProgress &&
        typeof window.renderRecentScenarioCard === 'function'
      ) {
        window.renderRecentScenarioCard(recentProgressMount, data.recentScenario);
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
