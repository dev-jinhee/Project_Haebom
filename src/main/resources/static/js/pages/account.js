(() => {
  const toast = window.Haebom.toast;
document.querySelector('[data-logout]')?.addEventListener('click', () => {
    localStorage.removeItem('ongyeol-demo-user');
    localStorage.removeItem('ongyeol-demo-role');
    window.location.href = '/login.html';
  });

  document.getElementById('loginForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('loginId')?.value.trim() || '';
    const password = document.getElementById('loginPassword')?.value || '';
    if (id === 'admin' && password !== 'admin1234') { toast('관리자 시안 계정의 비밀번호를 확인해 주세요.'); return; }
    const adminLogin = id === 'admin' && password === 'admin1234';
    localStorage.setItem('ongyeol-demo-user', adminLogin ? '관리자' : '김민지');
    localStorage.setItem('ongyeol-demo-role', adminLogin ? 'admin' : 'member');
    if (adminLogin) localStorage.setItem('ongyeol-demo-admin-id', id);
    else localStorage.removeItem('ongyeol-demo-admin-id');
    window.location.href = '/home.html';
  });

  document.getElementById('findIdForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('findIdLookup')?.classList.add('d-none');
    document.getElementById('findIdVerification')?.classList.remove('d-none');
    const email = document.getElementById('findIdEmail')?.value || '';
    const at = email.indexOf('@');
    const emailLabel = document.getElementById('findIdEmailTarget');
    if (emailLabel) emailLabel.textContent = at > 1 ? `${email.slice(0, 2)}***${email.slice(at)}` : email;
    const code = document.getElementById('findIdCode');
    if (code) { code.disabled = false; code.focus(); }
  });
  document.getElementById('verifyFindIdCode')?.addEventListener('click', () => {
    const code = document.getElementById('findIdCode');
    if (!/^\d{6}$/.test(code?.value || '')) { toast('인증번호 6자리를 입력해 주세요.'); code?.focus(); return; }
    document.getElementById('findIdResult')?.classList.remove('d-none');
    document.getElementById('findIdResult')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  const passwordRecoveryForm = document.getElementById('findPasswordForm');
  passwordRecoveryForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('passwordRecoveryLookup')?.classList.add('d-none');
    document.getElementById('passwordRecoveryReset')?.classList.remove('d-none');
    const email = document.getElementById('recoverEmail')?.value || '';
    const at = email.indexOf('@');
    const emailLabel = document.getElementById('recoverEmailTarget');
    if (emailLabel) emailLabel.textContent = at > 1 ? `${email.slice(0, 2)}***${email.slice(at)}` : email;
    const code = document.getElementById('recoveryCode');
    if (code) { code.disabled = false; code.focus(); }
  });
  document.getElementById('verifyRecoveryCode')?.addEventListener('click', () => {
    const code = document.getElementById('recoveryCode');
    if (!/^\d{6}$/.test(code?.value || '')) { toast('인증번호 6자리를 입력해 주세요.'); code?.focus(); return; }
    document.getElementById('passwordResetFields')?.classList.remove('d-none');
    ['newRecoveryPassword', 'confirmRecoveryPassword'].forEach((id) => { const field = document.getElementById(id); if (field) field.disabled = false; });
    document.getElementById('newRecoveryPassword')?.focus();
  });
  document.getElementById('completePasswordReset')?.addEventListener('click', () => {
    const password = document.getElementById('newRecoveryPassword');
    const confirmation = document.getElementById('confirmRecoveryPassword');
    if (!password?.reportValidity()) return;
    if (password.value !== confirmation?.value) { toast('새 비밀번호가 서로 일치하지 않습니다.'); confirmation?.focus(); return; }
    passwordRecoveryForm?.classList.add('d-none');
    document.getElementById('passwordRecoveryComplete')?.classList.remove('d-none');
  });


  document.querySelector('[data-password-toggle]')?.addEventListener('click', (event) => {
    const input = document.getElementById('loginPassword');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    event.currentTarget.setAttribute('aria-label', input.type === 'password' ? '비밀번호 표시' : '비밀번호 숨기기');
  });
})();
