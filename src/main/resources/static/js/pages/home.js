(function () {
  const policyForm = document.getElementById('policySearchForm');

  // 정책 검색 영역이 화면에 없으면 이 페이지에서는 할 일이 없습니다.
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
})();
