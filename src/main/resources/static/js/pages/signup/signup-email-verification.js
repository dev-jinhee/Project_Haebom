export function initEmailVerification(page) {
    const emailField = document.getElementById('signupEmail');
    const emailCodeField = document.getElementById('signupEmailCode');
    const emailSendStatus = document.getElementById('signupEmailSendStatus');
    const emailVerifyStatus = document.getElementById('signupEmailVerifyStatus');
    const csrfToken = document.getElementById('csrfToken');
    const emailSendButton = document.querySelector('[data-send-email-code]');
    const emailVerifyButton = document.querySelector('[data-verify-email-code]');
    let verifiedEmail = null;
    let emailExpiryTimer = null;
    let emailExpiresAt = 0;

    function showMessage(element, message, success) {
        if (element === null) return;

        element.textContent = message;
        element.classList.remove('text-success', 'text-danger');
        if (message !== '') {
            element.classList.add(success ? 'text-success' : 'text-danger');
        }
    }

    function clearExpiryTimer() {
        if (emailExpiryTimer !== null) {
            window.clearInterval(emailExpiryTimer);
            emailExpiryTimer = null;
        }
        emailExpiresAt = 0;
    }

    function updateExpiryStatus() {
        const remainingSeconds = Math.max(
            0,
            Math.ceil((emailExpiresAt - Date.now()) / 1000)
        );

        if (remainingSeconds === 0) {
            clearExpiryTimer();
            showMessage(emailSendStatus, '인증번호가 만료되었습니다. 다시 발송해 주세요.', false);
            return;
        }

        const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const seconds = String(remainingSeconds % 60).padStart(2, '0');
        showMessage(emailSendStatus,
            '인증번호를 이메일로 보냈습니다. (' + minutes + ':' + seconds + ' 남음)', true);
    }

    function startExpiryTimer() {
        clearExpiryTimer();
        emailExpiresAt = Date.now() + (5 * 60 * 1000);
        updateExpiryStatus();
        emailExpiryTimer = window.setInterval(updateExpiryStatus, 1000);
    }

    if (emailField !== null) {
        emailField.addEventListener('input', function () {
            verifiedEmail = null;
            clearExpiryTimer();
            if (emailCodeField !== null) emailCodeField.value = '';
            if (emailVerifyButton !== null) {
                emailVerifyButton.disabled = false;
                emailVerifyButton.textContent = '인증 확인';
                emailVerifyButton.classList.remove('btn-outline-success');
                emailVerifyButton.classList.add('btn-outline-primary');
            }
            showMessage(emailSendStatus, '', false);
            showMessage(emailVerifyStatus, '', false);
        });
    }

    if (emailSendButton !== null && emailField !== null) {
        emailSendButton.addEventListener('click', async function () {
            if (verifiedEmail !== null) {
                verifiedEmail = null;
                clearExpiryTimer();
                emailField.disabled = false;
                emailField.focus();
                if (emailCodeField !== null) {
                    emailCodeField.value = '';
                    emailCodeField.disabled = false;
                }
                if (emailVerifyButton !== null) {
                    emailVerifyButton.disabled = false;
                    emailVerifyButton.textContent = '인증 확인';
                    emailVerifyButton.classList.remove('btn-outline-success');
                    emailVerifyButton.classList.add('btn-outline-primary');
                }
                emailSendButton.textContent = '인증번호 받기';
                showMessage(emailSendStatus, '', false);
                showMessage(emailVerifyStatus, '', false);
                return;
            }

            const email = emailField.value.trim();
            if (!emailField.checkValidity()) {
                emailField.reportValidity();
                emailField.focus();
                return;
            }
            if (csrfToken === null) {
                showMessage(emailSendStatus,
                    '보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.', false);
                return;
            }

            emailSendButton.disabled = true;
            try {
                const response = await fetch(page.dataset.contextPath
                        + '/api/members/email-verification/send', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken.value
                    },
                    body: JSON.stringify({ email: email })
                });
                const result = await response.json().catch(function () {
                    return null;
                });

                if (!response.ok || result === null || typeof result.sent !== 'boolean') {
                    throw new Error('인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                }

                if (emailField.value.trim() !== email) return;
                verifiedEmail = null;
                if (emailCodeField !== null) emailCodeField.value = '';
                if (emailVerifyButton !== null) {
                    emailVerifyButton.disabled = !result.sent;
                    emailVerifyButton.textContent = '인증 확인';
                    emailVerifyButton.classList.remove('btn-outline-success');
                    emailVerifyButton.classList.add('btn-outline-primary');
                }
                showMessage(emailVerifyStatus, '', false);
                if (result.sent) {
                    startExpiryTimer();
                    if (emailCodeField !== null) emailCodeField.disabled = false;
                } else {
                    clearExpiryTimer();
                    showMessage(emailSendStatus, '이미 가입된 이메일입니다.', false);
                }
            } catch (error) {
                if (emailField.value.trim() === email) {
                    showMessage(emailSendStatus,
                        error.message || '인증번호 발송에 실패했습니다.', false);
                }
            } finally {
                emailSendButton.disabled = false;
            }
        });
    }

    if (emailVerifyButton !== null && emailField !== null && emailCodeField !== null) {
        emailVerifyButton.addEventListener('click', async function () {
            const email = emailField.value.trim();
            const code = emailCodeField.value.trim();
            if (!emailField.checkValidity()) {
                emailField.reportValidity();
                emailField.focus();
                return;
            }
            if (!/^[0-9]{6}$/.test(code)) {
                showMessage(emailVerifyStatus, '인증번호 6자리를 입력해 주세요.', false);
                emailCodeField.focus();
                return;
            }
            if (csrfToken === null) {
                showMessage(emailVerifyStatus,
                    '보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.', false);
                return;
            }

            emailVerifyButton.disabled = true;
            try {
                const response = await fetch(page.dataset.contextPath
                        + '/api/members/email-verification/confirm', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken.value
                    },
                    body: JSON.stringify({ email: email, code: code })
                });
                const result = await response.json().catch(function () {
                    return null;
                });

                if (!response.ok || result === null || typeof result.verified !== 'boolean') {
                    throw new Error('이메일 인증 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                }

                if (emailField.value.trim() !== email) return;
                verifiedEmail = result.verified ? email : null;
                if (result.verified) {
                    clearExpiryTimer();
                    showMessage(emailSendStatus, '', false);
                    emailField.disabled = true;
                    emailCodeField.disabled = true;
                    if (emailSendButton !== null) emailSendButton.textContent = '이메일 변경';
                    emailVerifyButton.textContent = '인증 완료 ✓';
                    emailVerifyButton.classList.remove('btn-outline-primary');
                    emailVerifyButton.classList.add('btn-outline-success');
                }
                showMessage(emailVerifyStatus,
                    result.verified ? '이메일 인증이 완료되었습니다.'
                        : '인증번호가 틀렸거나 만료되었습니다.', result.verified);
            } catch (error) {
                verifiedEmail = null;
                if (emailField.value.trim() === email) {
                    showMessage(emailVerifyStatus,
                        error.message || '이메일 인증 확인에 실패했습니다.', false);
                }
            } finally {
                emailVerifyButton.disabled = verifiedEmail === email;
            }
        });
    }

    return {
        getValue: function () {
            return emailField === null ? '' : emailField.value.trim();
        },
        isVerified: function (email) {
            return verifiedEmail === email;
        },
        showRequiredMessage: function () {
            showMessage(emailVerifyStatus, '가입할 이메일 인증을 완료해 주세요.', false);
            if (emailField !== null) emailField.focus();
        }
    };
}
