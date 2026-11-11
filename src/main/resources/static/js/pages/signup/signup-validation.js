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

        const result = window.Haebom.passwordValidation.validate('');
        setFieldStatus(input, 'signupPasswordStatus', result.message, result.state);
    }

    function validatePassword() {
        const input = document.getElementById('signupPassword');
        if (input === null) return false;

        const result = window.Haebom.passwordValidation.validate(input.value);
        setFieldStatus(input, 'signupPasswordStatus', result.message, result.state);
        return result.valid;
    }

    function validatePasswordConfirmation() {
        const passwordInput = document.getElementById('signupPassword');
        const confirmInput = document.getElementById('signupPasswordConfirm');
        if (passwordInput === null || confirmInput === null) return false;

        const passwordResult = window.Haebom.passwordValidation.validate(passwordInput.value);
        const result = window.Haebom.passwordValidation.validateConfirmation(
            confirmInput.value, passwordInput.value, passwordResult.valid);
        setFieldStatus(confirmInput, 'signupPasswordConfirmStatus', result.message, result.state);
        return result.valid;
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
        passwordInput.addEventListener('input', function () {
            validatePassword();
            validatePasswordConfirmation();
        });
        passwordInput.addEventListener('focus', showPasswordGuidance);
        passwordInput.addEventListener('blur', validatePassword);
    }

    if (passwordConfirmInput !== null) {
        passwordConfirmInput.addEventListener('focus', showPasswordConfirmationGuidance);
        passwordConfirmInput.addEventListener('blur', validatePasswordConfirmation);
    }

    return { validateName, validatePassword, validatePasswordConfirmation };
}
