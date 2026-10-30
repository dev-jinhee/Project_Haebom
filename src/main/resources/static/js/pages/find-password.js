(function () {
    const card = document.querySelector('.account-find-card');
    const form = document.getElementById('passwordRecoveryForm');
    if (!card || !form) return;

    const loginIdField = document.getElementById('loginId');
    const nameField = document.getElementById('memberName');
    const emailField = document.getElementById('email');
    const codeField = document.getElementById('verificationCode');
    const sendButton = document.getElementById('sendCodeButton');
    const confirmButton = document.getElementById('confirmCodeButton');
    const resetButton = document.getElementById('resetPasswordButton');
    const sendStatus = document.getElementById('sendCodeStatus');
    const verifyStatus = document.getElementById('verifyCodeStatus');
    const resetStatus = document.getElementById('resetPasswordStatus');
    const verificationSection = document.getElementById('verificationSection');
    const resetSection = document.getElementById('resetPasswordSection');
    const resetCard = document.getElementById('resetPasswordCard');
    const completeSection = document.getElementById('passwordRecoveryComplete');
    const verifiedSummary = document.getElementById('verifiedAccountSummary');
    const newPasswordField = document.getElementById('newPassword');
    const passwordConfirmField = document.getElementById('passwordConfirm');
    const newPasswordStatus = document.getElementById('newPasswordStatus');
    const passwordConfirmStatus = document.getElementById('passwordConfirmStatus');
    const contextPath = card.dataset.contextPath || '';

    let codeSent = false;
    let verified = false;
    let expiryTimer = null;
    let expiresAt = 0;

    function setStatus(element, message, type) {
        element.textContent = message;
        element.classList.remove('text-success', 'text-danger', 'text-muted');
        if (type) element.classList.add(type);
    }

    function setPasswordStatus(input, status, message, state) {
        setStatus(status, message, state === 'valid' ? 'text-success'
            : state === 'invalid' ? 'text-danger' : 'text-muted');
        input.setAttribute('aria-invalid', String(state === 'invalid'));
    }

    function showNewPasswordGuidance() {
        setPasswordStatus(newPasswordField, newPasswordStatus,
            '비밀번호는 8~20자로 입력해 주세요. 영문 대/소문자를 구분하며, >, <, _, -, ", \'는 사용할 수 없어요.',
            'neutral');
    }

    function validateNewPassword() {
        const password = newPasswordField.value;
        if (password.length === 0) {
            showNewPasswordGuidance();
            return false;
        }

        const validLength = password.length >= 8 && password.length <= 20;
        const hasForbiddenCharacter = /[><_\-"']/.test(password);
        const valid = validLength && !hasForbiddenCharacter;
        const message = !validLength ? '8~20자로 입력해 주세요.'
            : hasForbiddenCharacter ? '사용할 수 없는 특수문자(>, <, _, -, ", \')가 포함되어 있습니다.'
                : '사용 가능한 비밀번호입니다.';

        setPasswordStatus(newPasswordField, newPasswordStatus, message, valid ? 'valid' : 'invalid');
        return valid;
    }

    function showPasswordConfirmationGuidance() {
        setPasswordStatus(passwordConfirmField, passwordConfirmStatus,
            '비밀번호를 다시 입력해 주세요.', 'neutral');
    }

    function validatePasswordConfirmation() {
        const confirmation = passwordConfirmField.value;
        const valid = confirmation.length > 0 && confirmation === newPasswordField.value;
        const message = confirmation.length === 0 ? '비밀번호를 다시 입력해 주세요.'
            : valid ? '비밀번호가 일치합니다.'
                : '입력하신 비밀번호가 일치하지 않습니다. 비밀번호를 확인하세요.';

        setPasswordStatus(passwordConfirmField, passwordConfirmStatus, message,
            confirmation.length === 0 ? 'neutral' : valid ? 'valid' : 'invalid');
        return valid;
    }

    document.querySelectorAll('[data-toggle-password]').forEach(function (button) {
        button.addEventListener('click', function () {
            const input = document.getElementById(button.dataset.togglePassword);
            const icon = button.querySelector('.material-symbols-outlined');
            if (input === null || icon === null) return;

            const showPassword = input.type === 'password';
            input.type = showPassword ? 'text' : 'password';
            icon.textContent = showPassword ? 'visibility' : 'visibility_off';
            button.setAttribute('aria-label', showPassword ? '비밀번호 숨기기' : '비밀번호 표시');
        });
    });

    newPasswordField.addEventListener('focus', showNewPasswordGuidance);
    newPasswordField.addEventListener('blur', validateNewPassword);
    newPasswordField.addEventListener('input', function () {
        if (newPasswordField.value.length > 0) validateNewPassword();
        if (passwordConfirmField.value.length > 0) validatePasswordConfirmation();
    });
    passwordConfirmField.addEventListener('focus', showPasswordConfirmationGuidance);
    passwordConfirmField.addEventListener('blur', validatePasswordConfirmation);
    passwordConfirmField.addEventListener('input', function () {
        if (passwordConfirmField.value.length > 0) validatePasswordConfirmation();
        else showPasswordConfirmationGuidance();
    });

    function clearExpiryTimer() {
        if (expiryTimer !== null) {
            window.clearInterval(expiryTimer);
            expiryTimer = null;
        }
        expiresAt = 0;
    }

    function updateExpiryStatus() {
        const remainingSeconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
        if (remainingSeconds === 0) {
            clearExpiryTimer();
            codeSent = false;
            setStatus(sendStatus, '인증번호가 만료되었습니다. 다시 발송해 주세요.', 'text-danger');
            return;
        }

        const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const seconds = String(remainingSeconds % 60).padStart(2, '0');
        setStatus(sendStatus, '인증번호를 이메일로 보냈습니다. (' + minutes + ':' + seconds + ' 남음)', 'text-success');
    }

    function startExpiryTimer() {
        clearExpiryTimer();
        expiresAt = Date.now() + (5 * 60 * 1000);
        codeSent = true;
        updateExpiryStatus();
        expiryTimer = window.setInterval(updateExpiryStatus, 1000);
    }

    async function postForm(path, body) {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Accept': 'application/json'
        };
        const csrf = document.getElementById('csrfToken');
        if (csrf && csrf.value && csrf.dataset.header) {
            headers[csrf.dataset.header] = csrf.value;
        }

        const params = new URLSearchParams();
        Object.entries(body).forEach(function ([key, value]) {
            params.append(key, value);
        });

        const response = await fetch(contextPath + path, {
            method: 'POST',
            headers: headers,
            credentials: 'same-origin',
            body: params.toString()
        });
        const data = await response.json().catch(function () { return null; });
        if (!response.ok || data === null) {
            throw new Error('요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
        return data;
    }

    function resetVerificationUi(message) {
        clearExpiryTimer();
        codeSent = false;
        verified = false;
        verificationSection.hidden = true;
        resetSection.hidden = true;
        codeField.value = '';
        codeField.disabled = false;
        confirmButton.disabled = false;
        confirmButton.textContent = '인증 확인';
        setStatus(verifyStatus, '', null);
        if (message) setStatus(sendStatus, message, null);
    }

    [loginIdField, nameField, emailField].forEach(function (field) {
        field.addEventListener('input', function () {
            if (verified) return;
            if (codeSent) {
                resetVerificationUi('정보가 변경되었습니다. 다시 인증번호를 받아 주세요.');
            }
        });
    });

    codeField.addEventListener('input', function () {
        codeField.value = codeField.value.replace(/\D/g, '').slice(0, 6);
    });

    sendButton.addEventListener('click', async function () {
        const loginId = loginIdField.value.trim();
        const memberName = nameField.value.trim();
        const email = emailField.value.trim();

        if (!loginIdField.checkValidity()) {
            loginIdField.focus();
            setStatus(sendStatus, '아이디를 4~16자로 입력해 주세요.', 'text-danger');
            return;
        }
        if (!memberName) {
            nameField.focus();
            setStatus(sendStatus, '이름을 입력해 주세요.', 'text-danger');
            return;
        }
        if (!emailField.checkValidity()) {
            emailField.focus();
            setStatus(sendStatus, '올바른 이메일 주소를 입력해 주세요.', 'text-danger');
            return;
        }

        sendButton.disabled = true;
        setStatus(sendStatus, '인증번호를 보내고 있습니다.', null);
        try {
            const data = await postForm('/api/members/recovery/find-password/send-code', {
                loginId: loginId,
                memberName: memberName,
                email: email
            });
            if (!data.sent) {
                clearExpiryTimer();
                codeSent = false;
                verificationSection.hidden = true;
                setStatus(sendStatus, '입력한 아이디, 이름, 이메일이 가입 정보와 일치하지 않습니다.', 'text-danger');
                return;
            }

            verified = false;
            codeField.value = '';
            verificationSection.hidden = false;
            resetSection.hidden = true;
            startExpiryTimer();
            setStatus(verifyStatus, '', null);
            codeField.focus();
        } catch (error) {
            setStatus(sendStatus, error.message, 'text-danger');
        } finally {
            sendButton.disabled = false;
        }
    });

    confirmButton.addEventListener('click', async function () {
        const code = codeField.value.trim();
        if (!codeSent) {
            setStatus(verifyStatus, '먼저 인증번호를 받아 주세요.', 'text-danger');
            return;
        }
        if (!/^[0-9]{6}$/.test(code)) {
            codeField.focus();
            setStatus(verifyStatus, '인증번호 6자리를 입력해 주세요.', 'text-danger');
            return;
        }

        confirmButton.disabled = true;
        setStatus(verifyStatus, '인증번호를 확인하고 있습니다.', null);
        try {
            const data = await postForm('/api/members/recovery/find-password/confirm', {
                email: emailField.value.trim(),
                code: code
            });
            if (!data.verified) {
                setStatus(verifyStatus, '인증번호가 틀렸거나 만료되었습니다.', 'text-danger');
                return;
            }

            clearExpiryTimer();
            verified = true;
            loginIdField.disabled = true;
            nameField.disabled = true;
            emailField.disabled = true;
            codeField.disabled = true;
            confirmButton.textContent = '인증 완료 ✓';
            verifiedSummary.textContent = '인증된 이메일: ' + emailField.value.trim();
            resetSection.hidden = false;
            setStatus(verifyStatus, '이메일 인증이 완료되었습니다.', 'text-success');
            card.hidden = true;
            resetCard.hidden = false;
            newPasswordField.focus();
        } catch (error) {
            setStatus(verifyStatus, error.message, 'text-danger');
        } finally {
            confirmButton.disabled = verified;
        }
    });

    resetButton.addEventListener('click', async function () {
        const newPassword = newPasswordField.value;
        const passwordConfirm = passwordConfirmField.value;

        if (!verified) {
            setStatus(resetStatus, '이메일 인증을 먼저 완료해 주세요.', 'text-danger');
            return;
        }
        if (!validateNewPassword()) {
            newPasswordField.focus();
            return;
        }
        if (!validatePasswordConfirmation()) {
            passwordConfirmField.focus();
            return;
        }

        resetButton.disabled = true;
        setStatus(resetStatus, '비밀번호를 변경하고 있습니다.', null);
        try {
            const data = await postForm('/api/members/recovery/find-password/reset', {
                loginId: loginIdField.value.trim(),
                email: emailField.value.trim(),
                newPassword: newPassword,
                passwordConfirm: passwordConfirm
            });
            if (!data.changed) {
                setStatus(resetStatus, '인증이 만료되었거나 계정 정보가 일치하지 않습니다. 다시 인증해 주세요.', 'text-danger');
                return;
            }

            resetSection.hidden = true;
            completeSection.hidden = false;
        } catch (error) {
            setStatus(resetStatus, error.message, 'text-danger');
        } finally {
            resetButton.disabled = false;
        }
    });
})();
