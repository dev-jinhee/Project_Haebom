(() => {
  const toast = window.Haebom.toast;
const policyForm = document.getElementById('policySearchForm');
  const runPolicySearch = (query) => {
    const results = document.getElementById('policySearchResults');
    const cards = [...document.querySelectorAll('.policy-search-result')];
    const normalized = query.trim().toLowerCase();
    if (!normalized) { toast('정책명이나 관심 분야를 입력해 주세요.'); document.getElementById('policySearchInput')?.focus(); return; }
    let count = 0;
    cards.forEach((card) => {
      const matches = `${card.dataset.policyTerms} ${card.textContent}`.toLowerCase().includes(normalized);
      card.classList.toggle('d-none', !matches);
      if (matches) count += 1;
    });
    results?.classList.remove('d-none');
    document.getElementById('policySearchEmpty')?.classList.toggle('d-none', count > 0);
    results?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  policyForm?.addEventListener('submit', (event) => { event.preventDefault(); runPolicySearch(document.getElementById('policySearchInput')?.value || ''); });
  document.querySelectorAll('[data-policy-query]').forEach((button) => button.addEventListener('click', () => {
    const input = document.getElementById('policySearchInput');
    if (input) input.value = button.dataset.policyQuery;
    runPolicySearch(button.dataset.policyQuery);
  }));
})();
