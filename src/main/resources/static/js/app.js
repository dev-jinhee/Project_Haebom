(() => {
  const savedSimulationKey = 'ongyeol-sim-saved';
  const simulationRetentionMs = 30 * 24 * 60 * 60 * 1000;
  try {
    const savedSimulation = JSON.parse(localStorage.getItem(savedSimulationKey) || 'null');
    if (savedSimulation) {
      if (Number.isFinite(savedSimulation.savedAt) && Date.now() - savedSimulation.savedAt >= simulationRetentionMs) {
        localStorage.removeItem(savedSimulationKey);
        localStorage.removeItem('ongyeol-last-scenario-progress');
      } else if (!Number.isFinite(savedSimulation.savedAt)) {
        savedSimulation.savedAt = Date.now();
        localStorage.setItem(savedSimulationKey, JSON.stringify(savedSimulation));
      }
    }
  } catch (_) {
    localStorage.removeItem(savedSimulationKey);
    localStorage.removeItem('ongyeol-last-scenario-progress');
  }
  const toast = (message) => {
    const node = document.getElementById('siteToast');
    const label = document.getElementById('toastMessage');
    if (!node || !window.bootstrap) return;
    label.textContent = message;
    bootstrap.Toast.getOrCreateInstance(node, { delay: 2800 }).show();
  };
  window.Haebom = window.Haebom || {};
  window.Haebom.toast = toast;

  const savedTextSize = localStorage.getItem('ongyeol-text-size');
  let textSize = ['normal', 'large', 'larger', 'largest'].includes(savedTextSize)
    ? savedTextSize
    : (localStorage.getItem('ongyeol-access-mode') === 'on' || localStorage.getItem('ongyeol-mode') === 'easy' || savedTextSize === 'large')
      ? 'large'
      : 'normal';
  const isAdmin = localStorage.getItem('ongyeol-demo-role') === 'admin';
  document.querySelectorAll('[data-admin-entry]').forEach((entry) => entry.classList.toggle('d-none', !isAdmin));
  const savedSignupEmail = localStorage.getItem('ongyeol-demo-email');
  if (savedSignupEmail) document.querySelectorAll('[data-profile-email]').forEach((node) => { node.textContent = savedSignupEmail; });
  const currentEmailInput = document.getElementById('currentEmail');
  if (currentEmailInput) currentEmailInput.value = savedSignupEmail || document.querySelector('[data-profile-email]')?.textContent.trim() || '';
  if (window.location.pathname === '/admin.html' && !isAdmin) { window.location.replace('/home.html'); return; }
  const renderTextSize = () => {
    document.documentElement.dataset.textSize = textSize;
    document.body.classList.toggle('large-text-mode', textSize !== 'normal');
    document.querySelectorAll('[data-mode-label]').forEach((label) => {
      const labelMap = {
        'normal': '보통',
        'large': '크게',
        'larger': '더 크게',
        'largest': '가장 크게'
      };
      label.textContent = labelMap[textSize] || '보통';
    });
    document.querySelectorAll('[data-text-size]').forEach((option) => {
      const selected = option.dataset.textSize === textSize;
      option.classList.toggle('active', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
  };
  renderTextSize();
  document.querySelectorAll('[data-text-size]').forEach((button) => {
    button.addEventListener('click', () => {
      textSize = button.dataset.textSize;
      localStorage.setItem('ongyeol-text-size', textSize);
      localStorage.removeItem('ongyeol-access-mode');
      localStorage.removeItem('ongyeol-mode');
      renderTextSize();
    });
  });

})();
