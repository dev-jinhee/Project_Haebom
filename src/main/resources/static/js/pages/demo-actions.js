(() => {
  const toast = window.Haebom.toast;
document.querySelectorAll('[data-demo-action], [data-admin-action], [data-suggest]').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (button.matches('a')) event.preventDefault();
      toast(button.dataset.adminAction || button.dataset.demoAction || '절차 제안 기능은 화면 시안입니다.');
    });
  });
})();
