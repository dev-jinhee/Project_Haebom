export function initEmailVerification(page) {
    const emailField = document.getElementById('signupEmail');
    const emailHelp = document.getElementById('signupEmailHelp');
    const emailCodeField = document.getElementById('signupEmailCode');
    const emailSendStatus = document.getElementById('signupEmailSendStatus');
    const emailExpiryStatus = document.getElementById('signupEmailExpiryStatus');
    const emailVerifyStatus = document.getElementById('signupEmailVerifyStatus');
    const csrfToken = document.getElementById('csrfToken');
    const emailSendButton = document.querySelector('[data-send-email-code]');
    const emailVerifyButton = document.querySelector('[data-verify-email-code]');
    let verifiedEmail = null;
    let emailExpiryTimer = null;
    let emailExpiresAt = 0;
    let resendTimer = null;
    let resendUntil = 0;
    let resendEmail = '';
    let resendHelpMessage = '';
    let sendInProgress = false;
    const defaultEmailHelp = '아이디·비밀번호 찾기에 사용할 이메일을 입력해 주세요.';

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

    function clearResendTimer() {
        if (resendTimer !== null) {
            window.clearInterval(resendTimer);
            resendTimer = null;
        }
        resendUntil = 0;
        resendEmail = '';
        resendHelpMessage = '';
    }

    function updateResendButton() {
        if (emailSendButton === null) return;
        const isEmailChange = verifiedEmail !== null;
        const isCoolingDown = resendUntil > Date.now()
            && emailField.value.trim().toLowerCase() === resendEmail;

        if (isCoolingDown && !isEmailChange) {
            emailSendButton.textContent = '인증번호 받기';
            emailSendButton.setAttribute('aria-label', '인증번호 받기');
            emailSendButton.disabled = true;
        } else {
            emailSendButton.textContent = isEmailChange ? '이메일 변경' : '인증번호 받기';
            emailSendButton.setAttribute('aria-label', isEmailChange ? '이메일 변경' : '인증번호 받기');
            emailSendButton.disabled = sendInProgress;
        }

        if (emailHelp !== null) {
            emailHelp.textContent = isCoolingDown && !isEmailChange
                ? resendHelpMessage
                : defaultEmailHelp;
        }

        if (resendUntil > 0 && resendUntil <= Date.now()) clearResendTimer();
    }

    function startResendTimer(email, seconds) {
        clearResendTimer();
        resendEmail = email.trim().toLowerCase();
        resendHelpMessage = seconds <= 30
            ? '인증번호 발송 후 30초 뒤 다시 요청할 수 있습니다.'
            : '인증번호 발송 한도에 도달했습니다. 잠시 후 다시 요청해 주세요.';
        resendUntil = Date.now() + (Math.max(1, seconds) * 1000);
        updateResendButton();
        resendTimer = window.setInterval(updateResendButton, 1000);
    }

    function retrySecondsFrom(message) {
        const match = String(message || '').match(/(\d+)\s*초\s*후/);
        return match ? Number(match[1]) : null;
    }

    function updateExpiryStatus() {
        const remainingSeconds = Math.max(
            0,
            Math.ceil((emailExpiresAt - Date.now()) / 1000)
        );

        if (remainingSeconds === 0) {
            clearExpiryTimer();
            showMessage(emailExpiryStatus, '인증번호가 만료되었습니다. 다시 발송해 주세요.', false);
            return;
        }

        const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const seconds = String(remainingSeconds % 60).padStart(2, '0');
        showMessage(emailExpiryStatus, '인증번호 유효시간 ' + minutes + ':' + seconds, true);
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
            updateResendButton();
            if (emailVerifyButton !== null) {
                emailVerifyButton.disabled = false;
                emailVerifyButton.textContent = '인증 확인';
                emailVerifyButton.classList.remove('btn-outline-success');
                emailVerifyButton.classList.add('btn-outline-primary');
            }
            showMessage(emailSendStatus, '', false);
            showMessage(emailExpiryStatus, '', false);
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
                clearResendTimer();
                updateResendButton();
                if (emailVerifyButton !== null) {
                    emailVerifyButton.disabled = false;
                    emailVerifyButton.textContent = '인증 확인';
                    emailVerifyButton.classList.remove('btn-outline-success');
                    emailVerifyButton.classList.add('btn-outline-primary');
                }
                showMessage(emailSendStatus, '', false);
                showMessage(emailExpiryStatus, '', false);
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

            sendInProgress = true;
            updateResendButton();
            try {
                const params = new URLSearchParams();
                params.append('email', email);

                const response = await fetch(page.dataset.contextPath
                        + '/api/members/email-verification/send', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken.value
                    },
                    body: params.toString()
                });
                const result = await response.json().catch(function () {
                    return null;
                });

                if (response.status === 429) {
                    const message = result && result.message
                        ? result.message
                        : '인증번호는 30초 간격으로 요청할 수 있으며, 1시간에 최대 10회까지 발송할 수 있습니다.';
                    const retrySeconds = retrySecondsFrom(message);
                    if (retrySeconds !== null) startResendTimer(email, retrySeconds);
                    const error = new Error(message);
                    error.status = 429;
                    throw error;
                }

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
                    showMessage(emailSendStatus, '인증번호를 이메일로 보냈습니다.', true);
                    startExpiryTimer();
                    startResendTimer(email, 30);
                    if (emailCodeField !== null) emailCodeField.disabled = false;
                } else {
                    clearExpiryTimer();
                    showMessage(emailExpiryStatus, '', false);
                    showMessage(emailSendStatus, '이미 가입된 이메일입니다.', false);
                }
            } catch (error) {
                if (emailField.value.trim() === email) {
                    showMessage(emailSendStatus,
                        error.message || '인증번호 발송에 실패했습니다.', false);
                }
            } finally {
                sendInProgress = false;
                updateResendButton();
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
            let attemptsExceeded = false;
            try {
                const params = new URLSearchParams();
                params.append('email', email);
                params.append('code', code);

                const response = await fetch(page.dataset.contextPath
                        + '/api/members/email-verification/confirm', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken.value
                    },
                    body: params.toString()
                });
                const result = await response.json().catch(function () {
                    return null;
                });

                if (!response.ok || result === null || typeof result.verified !== 'boolean') {
                    throw new Error('이메일 인증 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                }

                if (emailField.value.trim() !== email) return;
                verifiedEmail = result.verified ? email : null;
                if (result.attemptsExceeded) {
                    attemptsExceeded = true;
                    clearExpiryTimer();
                    showMessage(emailExpiryStatus, '', false);
                    if (emailCodeField !== null) emailCodeField.value = '';
                    emailVerifyButton.disabled = true;
                    showMessage(emailVerifyStatus,
                        '입력 횟수를 초과했습니다. 인증번호를 다시 받아주세요.', false);
                    return;
                }
                if (result.verified) {
                    clearExpiryTimer();
                    clearResendTimer();
                    showMessage(emailSendStatus, '', false);
                    showMessage(emailExpiryStatus, '', false);
                    emailField.disabled = true;
                    emailCodeField.disabled = true;
                    if (emailSendButton !== null) emailSendButton.textContent = '이메일 변경';
                    updateResendButton();
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
                emailVerifyButton.disabled = verifiedEmail === email || attemptsExceeded;
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
