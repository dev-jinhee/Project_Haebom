(() => {
  const toast = window.Haebom.toast;
const openModal = (selector) => {
    const node = document.querySelector(selector);
    if (node && window.bootstrap) bootstrap.Modal.getOrCreateInstance(node).show();
  };
  document.querySelector('[data-open-inquiry]')?.addEventListener('click', () => openModal('#inquiryModal'));
  document.getElementById('inquiryForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('inquiryModal')).hide();
    event.currentTarget.reset();
    toast('문의가 등록된 화면을 미리 보여드립니다.');
  });
})();
