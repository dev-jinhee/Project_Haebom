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
    const contextPath = card.dataset.contextPath || '';

    let codeSent = false;
    let verified = false;

    function setStatus(element, message, type) {
        element.textContent = message;
        element.classList.remove('text-success', 'text-danger');
        if (type) element.classList.add(type);
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
                codeSent = false;
                verificationSection.hidden = true;
                setStatus(sendStatus, '입력한 아이디, 이름, 이메일이 가입 정보와 일치하지 않습니다.', 'text-danger');
                return;
            }

            codeSent = true;
            verified = false;
            codeField.value = '';
            verificationSection.hidden = false;
            resetSection.hidden = true;
            setStatus(sendStatus, '인증번호를 이메일로 보냈습니다. 5분 안에 입력해 주세요.', 'text-success');
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
        const allowedPassword = /^[^><_"'-]+$/;

        if (!verified) {
            setStatus(resetStatus, '이메일 인증을 먼저 완료해 주세요.', 'text-danger');
            return;
        }
        if (newPassword.length < 8 || newPassword.length > 20 || !allowedPassword.test(newPassword)) {
            newPasswordField.focus();
            setStatus(resetStatus, '비밀번호는 8~20자이며 사용할 수 없는 특수문자는 제외해 주세요.', 'text-danger');
            return;
        }
        if (!passwordConfirm || newPassword !== passwordConfirm) {
            passwordConfirmField.focus();
            setStatus(resetStatus, '새 비밀번호가 서로 일치하지 않습니다.', 'text-danger');
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
