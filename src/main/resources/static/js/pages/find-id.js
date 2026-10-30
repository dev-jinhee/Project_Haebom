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
    const verifyStatus = document.getElementById('verifyCodeStatus');
    const result = document.getElementById('findIdResult');
    const resultActions = document.getElementById('findIdResultActions');
    const foundLoginId = document.getElementById('foundLoginId');
    const title = document.getElementById('findIdTitle');
    const contextPath = card.dataset.contextPath || '';

    codeField.addEventListener('input', function () {
        codeField.value = codeField.value.replace(/\D/g, '').slice(0, 6);
    });

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

    sendButton.addEventListener('click', async function () {
        const memberName = nameField.value.trim();
        const email = emailField.value.trim();
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
            const data = await postForm('/api/members/recovery/find-id/send-code', {
                memberName: memberName,
                email: email
            });
            if (!data.sent) {
                setStatus(sendStatus, '입력한 이름과 이메일이 가입 정보와 일치하지 않습니다.', 'text-danger');
                return;
            }
            setStatus(sendStatus, '인증번호를 이메일로 보냈습니다. 5분 안에 입력해 주세요.', 'text-success');
            verificationSection.hidden = false;
            codeField.focus();
        } catch (error) {
            setStatus(sendStatus, error.message, 'text-danger');
        } finally {
            sendButton.disabled = false;
        }
    });

    confirmButton.addEventListener('click', async function () {
        const code = codeField.value.trim();
        if (!/^[0-9]{6}$/.test(code)) {
            codeField.focus();
            setStatus(verifyStatus, '인증번호 6자리를 입력해 주세요.', 'text-danger');
            return;
        }

        confirmButton.disabled = true;
        setStatus(verifyStatus, '인증번호를 확인하고 있습니다.', null);
        try {
            const data = await postForm('/api/members/recovery/find-id/confirm', {
                email: emailField.value.trim(),
                code: code
            });
            if (!data.verified || !data.loginId) {
                setStatus(verifyStatus, '인증번호가 틀렸거나 만료되었습니다.', 'text-danger');
                return;
            }

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
