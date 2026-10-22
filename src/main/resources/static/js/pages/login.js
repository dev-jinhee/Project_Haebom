(() => {
  // 폼 제출 동작은 건드리지 않고 비밀번호 표시 여부만 전환합니다.
  document.querySelector('[data-password-toggle]')?.addEventListener('click', (event) => {
    const input = document.getElementById('loginPassword');
    if (!input) return;

    input.type = input.type === 'password' ? 'text' : 'password';
    const icon = document.getElementById('loginPasswordToggleIcon');
    if (icon) icon.textContent = input.type === 'password' ? 'visibility' : 'visibility_off';
    event.currentTarget.setAttribute(
      'aria-label',
      input.type === 'password' ? '비밀번호 표시' : '비밀번호 숨기기'
    );
  });
})();
