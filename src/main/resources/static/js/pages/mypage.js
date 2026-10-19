(() => {
  const toast = window.Haebom.toast;
const openModal = (selector) => {
    const node = document.querySelector(selector);
    if (node && window.bootstrap) bootstrap.Modal.getOrCreateInstance(node).show();
  };

  document.querySelectorAll('[data-my-tab]').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('[data-my-tab]').forEach((item) => item.classList.toggle('active', item === tab));
    document.querySelectorAll('[data-my-panel]').forEach((panel) => panel.classList.toggle('d-none', panel.dataset.myPanel !== tab.dataset.myTab));
  }));
  document.querySelectorAll('[data-open-password-change]').forEach((button) => button.addEventListener('click', () => openModal('#passwordChangeModal')));
  document.querySelectorAll('[data-open-email-change]').forEach((button) => button.addEventListener('click', () => {
    const currentEmail = document.getElementById('currentEmail');
    if (currentEmail) currentEmail.value = document.querySelector('[data-profile-email]')?.textContent.trim() || '';
    openModal('#emailChangeModal');
  }));
  document.getElementById('emailChangeForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('newEmail')?.value.trim();
    if (!email) return;
    localStorage.setItem('ongyeol-demo-email', email);
    document.querySelectorAll('[data-profile-email]').forEach((node) => { node.textContent = email; });
    bootstrap.Modal.getOrCreateInstance(document.getElementById('emailChangeModal')).hide();
    event.currentTarget.reset();
    const currentEmail = document.getElementById('currentEmail');
    if (currentEmail) currentEmail.value = email;
    toast('이메일이 변경된 화면을 보여드립니다. 실제 이메일 인증은 연결되지 않았습니다.');
  });
  document.getElementById('passwordChangeForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const currentPassword = document.getElementById('currentPassword');
    const password = document.getElementById('newPassword');
    const confirm = document.getElementById('confirmNewPassword');
    if (password?.value.length < 8) { toast('새 비밀번호를 8자 이상 입력해 주세요.'); password?.focus(); return; }
    if (password?.value !== confirm?.value) { toast('새 비밀번호가 서로 일치하지 않습니다.'); confirm?.focus(); return; }
    bootstrap.Modal.getOrCreateInstance(document.getElementById('passwordChangeModal')).hide();
    event.currentTarget.reset();
    toast('화면 시안입니다. 비밀번호는 실제로 변경되지 않았습니다.');
  });
  document.querySelector('[data-delete-account]')?.addEventListener('click', () => openModal('#confirmModal'));
  document.querySelector('[data-confirm-delete]')?.addEventListener('click', () => {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmModal')).hide();
    toast('탈퇴 처리 화면 시안입니다. 계정은 삭제되지 않았습니다.');
  });
})();
