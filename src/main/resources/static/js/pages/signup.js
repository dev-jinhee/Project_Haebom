(() => {
  const page = document.querySelector('.member-signup-page');
  if (!page) return;

  const steps = [...document.querySelectorAll('[id^="signupStep"]')];
  const stepLabels = [...document.querySelectorAll('[data-signup-step-label]')];
  const consent = document.getElementById('signupRequiredConsent');
  const consentError = document.getElementById('signupConsentError');
  const accountError = document.getElementById('signupAccountError');
  const form = document.getElementById('signupAccountForm');

  const setError = (node, message) => {
    if (!node) return;
    node.textContent = message;
    node.hidden = !message;
  };

  const showStep = (activeIndex) => {
    steps.forEach((step, index) => {
      const isActive = index === activeIndex;
      step.classList.toggle('d-none', !isActive);
      step.setAttribute('aria-hidden', String(!isActive));
    });

    stepLabels.forEach((label) => {
      const index = Number(label.dataset.signupStepLabel);
      label.classList.toggle('is-active', index === activeIndex);
      label.classList.toggle('is-complete', index < activeIndex);
      if (index === activeIndex) label.setAttribute('aria-current', 'step');
      else label.removeAttribute('aria-current');
    });

    const activeStep = steps[activeIndex];
    activeStep?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    activeStep?.querySelector('h2')?.focus({ preventScroll: true });
  };

  document.querySelector('[data-signup-next="1"]')?.addEventListener('click', () => {
    if (!consent?.checked) {
      setError(consentError, page.dataset.consentError);
      consent?.focus();
      return;
    }
    setError(consentError, '');
    showStep(1);
  });

  consent?.addEventListener('change', () => {
    if (consent.checked) setError(consentError, '');
  });

  document.querySelectorAll('[data-signup-back="0"]').forEach((button) => {
    button.addEventListener('click', () => showStep(0));
  });

  ['rrnFront', 'rrnFirst'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', (event) => {
      event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
    });
  });

  document.querySelector('[data-check-id]')?.addEventListener('click', () => {
    const idField = document.getElementById('signupId');
    const status = document.getElementById('signupIdCheckStatus');
    if (!idField?.value.trim()) {
      idField?.focus();
      return;
    }
    if (status) status.textContent = page.dataset.idCheckMessage || '';
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    setError(accountError, '');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const password = document.getElementById('signupPassword');
    const confirmation = document.getElementById('signupPasswordConfirm');
    if (password?.value !== confirmation?.value) {
      setError(accountError, page.dataset.passwordError);
      confirmation?.focus();
      return;
    }

    // 화면 흐름만 확인하는 단계입니다. 입력값은 저장하거나 서버로 보내지 않습니다.
    form.reset();
    setError(accountError, '');
    const idStatus = document.getElementById('signupIdCheckStatus');
    if (idStatus) idStatus.textContent = '';
    showStep(2);
  });
})();
