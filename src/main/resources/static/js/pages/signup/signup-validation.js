export function initSignupValidation() {
    function setFieldStatus(input, statusId, message, state) {
        const status = document.getElementById(statusId);
        if (status === null) return;

        status.textContent = message;
        status.classList.remove('text-success', 'text-danger', 'text-muted');
        status.classList.add(state === 'valid' ? 'text-success'
            : state === 'invalid' ? 'text-danger' : 'text-muted');
        input.setAttribute('aria-invalid', String(state === 'invalid'));
    }

    function validateName() {
        const input = document.getElementById('signupName');
        if (input === null) return false;

        const name = input.value.trim();
        const valid = name.length > 0 && name.length <= 20
            && /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z ]+$/.test(name);
        const message = name.length === 0 ? '이름을 입력해 주세요.'
            : valid ? '이름을 입력해 주세요.'
                : '한글·영문·공백만 입력할 수 있습니다. (20자 이내)';

        setFieldStatus(input, 'signupNameStatus', message,
            name.length === 0 || !valid ? 'invalid' : 'neutral');
        return valid;
    }

    function filterName(input) {
        input.value = input.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z ]/g, '');
    }

    function showPasswordGuidance() {
        const input = document.getElementById('signupPassword');
        if (input === null) return;

        const guidance = '비밀번호는 8~20자로 입력해 주세요. 영문 대/소문자를 구분하며, >, <, _, -, ", \'는 사용할 수 없어요.';
        setFieldStatus(input, 'signupPasswordStatus', guidance, 'neutral');
    }

    function validatePassword() {
        const input = document.getElementById('signupPassword');
        if (input === null) return false;

        const password = input.value;
        if (password.length === 0) {
            showPasswordGuidance();
            return false;
        }

        const validLength = password.length >= 8 && password.length <= 20;
        const hasForbiddenCharacter = /[><_\-"']/.test(password);
        const valid = validLength && !hasForbiddenCharacter;
        const message = !validLength ? '8~20자로 입력해 주세요.'
            : hasForbiddenCharacter ? '사용할 수 없는 특수문자(>, <, _, -, ", \')가 포함되어 있습니다.'
                : '사용 가능한 비밀번호입니다.';

        setFieldStatus(input, 'signupPasswordStatus', message, valid ? 'valid' : 'invalid');
        return valid;
    }

    function validatePasswordConfirmation() {
        const passwordInput = document.getElementById('signupPassword');
        const confirmInput = document.getElementById('signupPasswordConfirm');
        if (passwordInput === null || confirmInput === null) return false;

        const confirmation = confirmInput.value;
        const valid = confirmation.length > 0 && confirmation === passwordInput.value;
        const message = confirmation.length === 0 ? '비밀번호를 다시 입력해 주세요.'
            : valid ? '비밀번호가 일치합니다.' : '입력하신 비밀번호가 일치하지 않습니다. 비밀번호를 확인하세요.';

        setFieldStatus(confirmInput, 'signupPasswordConfirmStatus', message,
            confirmation.length === 0 ? 'neutral' : valid ? 'valid' : 'invalid');
        return valid;
    }

    function showPasswordConfirmationGuidance() {
        const confirmInput = document.getElementById('signupPasswordConfirm');
        if (confirmInput === null) return;

        setFieldStatus(confirmInput, 'signupPasswordConfirmStatus', '비밀번호를 다시 입력해 주세요.', 'neutral');
    }

    const nameInput = document.getElementById('signupName');
    const passwordInput = document.getElementById('signupPassword');
    const passwordConfirmInput = document.getElementById('signupPasswordConfirm');

    if (nameInput !== null) {
        nameInput.addEventListener('input', function (event) {
            if (event.isComposing) return;
            filterName(nameInput);
        });
        nameInput.addEventListener('compositionend', function () {
            filterName(nameInput);
        });
        nameInput.addEventListener('blur', function () {
            filterName(nameInput);
            validateName();
        });
    }

    if (passwordInput !== null) {
        passwordInput.addEventListener('input', validatePasswordConfirmation);
        passwordInput.addEventListener('focus', showPasswordGuidance);
        passwordInput.addEventListener('blur', validatePassword);
    }

    if (passwordConfirmInput !== null) {
        passwordConfirmInput.addEventListener('focus', showPasswordConfirmationGuidance);
        passwordConfirmInput.addEventListener('blur', validatePasswordConfirmation);
    }

    return { validateName, validatePassword, validatePasswordConfirmation };
}
