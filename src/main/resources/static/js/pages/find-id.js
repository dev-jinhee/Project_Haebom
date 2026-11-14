(function () {
    const card = document.querySelector('.account-find-card');
    const form = document.getElementById('findIdForm');
    if (!card || !form) return;

    const nameField = document.getElementById('memberName');
    const emailField = document.getElementById('email');
    const verificationSection = document.getElementById('verificationSection');
    const codeField = document.getElementById('verificationCode');
    const sendButton = document.getElementById('sendCodeButton');
    const confirmButton = document.getElementById('confirmCodeButton');
    const sendStatus = document.getElementById('sendCodeStatus');
    const expiryStatus = document.getElementById('codeExpiryStatus');
    const verifyStatus = document.getElementById('verifyCodeStatus');
    const result = document.getElementById('findIdResult');
    const resultActions = document.getElementById('findIdResultActions');
    const foundLoginId = document.getElementById('foundLoginId');
    const title = document.getElementById('findIdTitle');
    const contextPath = card.dataset.contextPath || '';
    let codeSent = false;
    let expiryTimer = null;
    let expiresAt = 0;
    let resendTimer = null;
    let resendUntil = 0;
    let resendEmail = '';
    let sendInProgress = false;

    function setFieldInvalid(field, invalid) {
        if (field) field.setAttribute('aria-invalid', String(invalid));
    }

    codeField.addEventListener('input', function () {
        codeField.value = codeField.value.replace(/\D/g, '').slice(0, 6);
        setFieldInvalid(codeField, false);
    });
    nameField.addEventListener('input', function () { setFieldInvalid(nameField, false); });
    emailField.addEventListener('input', function () { setFieldInvalid(emailField, false); });

    function setStatus(element, message, type) {
        element.textContent = message;
        element.classList.remove('text-success', 'text-danger');
        if (type) element.classList.add(type);
    }

    function clearExpiryTimer() {
        if (expiryTimer !== null) {
            window.clearInterval(expiryTimer);
            expiryTimer = null;
        }
        expiresAt = 0;
    }

    function clearResendTimer() {
        if (resendTimer !== null) {
            window.clearInterval(resendTimer);
            resendTimer = null;
        }
        resendUntil = 0;
        resendEmail = '';
    }

    function updateResendButton() {
        const coolingDown = resendUntil > Date.now()
            && emailField.value.trim().toLowerCase() === resendEmail;
        if (coolingDown) {
            const remaining = Math.ceil((resendUntil - Date.now()) / 1000);
            sendButton.textContent = remaining + '초';
            sendButton.setAttribute('aria-label', '인증번호 재전송까지 ' + remaining + '초');
            sendButton.disabled = true;
        } else {
            sendButton.textContent = '인증번호 받기';
            sendButton.setAttribute('aria-label', '인증번호 받기');
            sendButton.disabled = sendInProgress;
        }
        if (resendUntil > 0 && resendUntil <= Date.now()) clearResendTimer();
    }

    function startResendTimer(email, seconds) {
        clearResendTimer();
        resendEmail = email.trim().toLowerCase();
        resendUntil = Date.now() + (Math.max(1, seconds) * 1000);
        updateResendButton();
        resendTimer = window.setInterval(updateResendButton, 1000);
    }

    function retrySecondsFrom(message) {
        const match = String(message || '').match(/(\d+)\s*초\s*후/);
        return match ? Number(match[1]) : null;
    }

    function updateExpiryStatus() {
        const remainingSeconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
        if (remainingSeconds === 0) {
            clearExpiryTimer();
            codeSent = false;
            setStatus(expiryStatus, '인증번호가 만료되었습니다. 다시 발송해 주세요.', 'text-danger');
            return;
        }

        const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const seconds = String(remainingSeconds % 60).padStart(2, '0');
        setStatus(expiryStatus, '인증번호 유효시간 ' + minutes + ':' + seconds, 'text-muted');
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
        if (response.status === 429) {
            throw new Error(data && data.message
                ? data.message
                : '인증번호는 60초 간격으로 요청할 수 있으며, 1시간에 최대 5회까지 발송할 수 있습니다.');
        }
        if (!response.ok || data === null) {
            throw new Error('요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
        return data;
    }

    emailField.addEventListener('input', updateResendButton);

    sendButton.addEventListener('click', async function () {
        const memberName = nameField.value.trim();
        const email = emailField.value.trim();
        if (!memberName) {
            setFieldInvalid(nameField, true);
            nameField.focus();
            setStatus(sendStatus, '이름을 입력해 주세요.', 'text-danger');
            return;
        }
        if (!emailField.checkValidity()) {
            setFieldInvalid(emailField, true);
            emailField.focus();
            setStatus(sendStatus, '올바른 이메일 주소를 입력해 주세요.', 'text-danger');
            return;
        }
        setFieldInvalid(nameField, false);
        setFieldInvalid(emailField, false);

        sendInProgress = true;
        updateResendButton();
        setStatus(sendStatus, '인증번호를 보내고 있습니다.', null);
        try {
            const data = await postForm('/api/members/recovery/find-id/send-code', {
                memberName: memberName,
                email: email
            });
            if (!data.sent) {
                clearExpiryTimer();
                codeSent = false;
                setStatus(expiryStatus, '', null);
                setFieldInvalid(nameField, true);
                setFieldInvalid(emailField, true);
                setStatus(sendStatus, '입력한 이름과 이메일이 가입 정보와 일치하지 않습니다.', 'text-danger');
                return;
            }
            setFieldInvalid(nameField, false);
            setFieldInvalid(emailField, false);
            verificationSection.hidden = false;
            setStatus(sendStatus, '인증번호를 이메일로 보냈습니다.', 'text-success');
            startExpiryTimer();
            startResendTimer(email, 60);
            codeField.focus();
        } catch (error) {
            const retrySeconds = retrySecondsFrom(error.message);
            if (retrySeconds !== null) startResendTimer(email, retrySeconds);
            setStatus(sendStatus, error.message, 'text-danger');
        } finally {
            sendInProgress = false;
            updateResendButton();
        }
    });

    confirmButton.addEventListener('click', async function () {
        if (!codeSent) {
            setStatus(verifyStatus, '인증번호를 다시 발송해 주세요.', 'text-danger');
            return;
        }
        const code = codeField.value.trim();
        if (!/^[0-9]{6}$/.test(code)) {
            setFieldInvalid(codeField, true);
            codeField.focus();
            setStatus(verifyStatus, '인증번호 6자리를 입력해 주세요.', 'text-danger');
            return;
        }
        setFieldInvalid(codeField, false);

        confirmButton.disabled = true;
        setStatus(verifyStatus, '인증번호를 확인하고 있습니다.', null);
        try {
            const data = await postForm('/api/members/recovery/find-id/confirm', {
                email: emailField.value.trim(),
                code: code
            });
            if (!data.verified || !data.loginId) {
                setFieldInvalid(codeField, true);
                setStatus(verifyStatus, '인증번호가 틀렸거나 만료되었습니다.', 'text-danger');
                return;
            }

            setFieldInvalid(codeField, false);
            clearExpiryTimer();
            foundLoginId.textContent = data.loginId;
            title.textContent = '아이디 찾기 결과';
            form.hidden = true;
            result.hidden = false;
            resultActions.hidden = false;
        } catch (error) {
            setStatus(verifyStatus, error.message, 'text-danger');
        } finally {
            confirmButton.disabled = false;
        }
    });
})();
