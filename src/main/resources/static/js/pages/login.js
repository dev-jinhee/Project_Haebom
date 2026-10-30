(() => {
  const loginForm = document.getElementById('loginForm');

  function showLoginRequestError(message) {
    let errorElement = document.getElementById('loginFetchError');
    if (!errorElement && loginForm) {
      errorElement = document.createElement('p');
      errorElement.id = 'loginFetchError';
      errorElement.className = 'login-error';
      errorElement.setAttribute('role', 'alert');
      loginForm.before(errorElement);
    }
    if (errorElement) errorElement.textContent = message;
  }

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    showLoginRequestError('');

    const csrfInput = loginForm.querySelector('input[name="_csrf"]');
    if (!csrfInput || !csrfInput.value) {
      showLoginRequestError('보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.');
      return;
    }

    const submitButton = loginForm.querySelector('[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const params = new URLSearchParams(new FormData(loginForm));
      const response = await fetch(loginForm.action, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Accept': 'text/html',
          'X-CSRF-TOKEN': csrfInput.value
        },
        body: params.toString()
      });

      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }

      if (!response.ok) {
        showLoginRequestError('로그인 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch (error) {
      showLoginRequestError('서버와 통신하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  // 로그인 요청은 fetch로 보내고, 이 버튼은 비밀번호 표시만 전환합니다.
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
