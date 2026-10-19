(() => {
  const toast = window.Haebom.toast;
// Signup prototype: validate the visible flow without retaining identity data.
  const signupSteps = [...document.querySelectorAll('[id^="signupStep"]')];
  const showSignupStep = (index) => {
    signupSteps.forEach((step, i) => step.classList.toggle('d-none', i !== index));
    document.querySelectorAll('[data-signup-step-label]').forEach((label) => {
      const n = Number(label.dataset.signupStepLabel);
      label.classList.toggle('active', n === index);
      label.classList.toggle('complete', n < index);
    });
    document.getElementById(`signupStep${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  document.getElementById('termsAll')?.addEventListener('change', (event) => {
    document.querySelectorAll('.term-required, .term-optional').forEach((checkbox) => { checkbox.checked = event.currentTarget.checked; });
  });
  document.querySelectorAll('.term-required, .term-optional').forEach((checkbox) => checkbox.addEventListener('change', () => {
    const all = [...document.querySelectorAll('.term-required, .term-optional')];
    const termsAll = document.getElementById('termsAll');
    if (termsAll) termsAll.checked = all.every((item) => item.checked);
  }));
  document.querySelectorAll('[data-signup-next]').forEach((button) => button.addEventListener('click', () => {
    const next = Number(button.dataset.signupNext);
    if (next === 1 && [...document.querySelectorAll('.term-required')].some((item) => !item.checked)) { toast('필수 약관에 동의해 주세요.'); return; }
    showSignupStep(next);
  }));
  document.querySelectorAll('[data-signup-back]').forEach((button) => button.addEventListener('click', () => showSignupStep(Number(button.dataset.signupBack))));
  ['rrnFront', 'rrnFirst'].forEach((id) => document.getElementById(id)?.addEventListener('input', (event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, ''); }));
  document.getElementById('signupAccountForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const password = document.getElementById('signupPassword');
    const confirm = document.getElementById('signupPasswordConfirm');
    const email = document.getElementById('signupEmail')?.value.trim();
    if (password?.value !== confirm?.value) { toast('비밀번호가 서로 일치하지 않습니다.'); confirm?.focus(); return; }
    if (email) localStorage.setItem('ongyeol-demo-email', email);
    event.currentTarget.reset();
    ['rrnFront', 'rrnFirst'].forEach((id) => { const field = document.getElementById(id); if (field) field.value = ''; });
    showSignupStep(2);
  });
  if (new URLSearchParams(window.location.search).get('step') === 'complete') showSignupStep(2);
})();
