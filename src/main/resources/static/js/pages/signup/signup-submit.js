export function initSignupSubmit(options) {
    const { page, form, consent, showError, showStep, validation, idAvailability, emailVerification } = options;
    if (form === null) return;

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        showError('');

        if (!validation.validateName()) {
            document.getElementById('signupName').focus();
            return;
        }
        if (!validation.validatePassword()) {
            document.getElementById('signupPassword').focus();
            return;
        }
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const passwordInput = document.getElementById('signupPassword');
        const passwordConfirmInput = document.getElementById('signupPasswordConfirm');
        if (passwordInput === null || passwordConfirmInput === null) return;

        const password = passwordInput.value;
        if (password !== passwordConfirmInput.value) {
            showError(page.dataset.passwordError);
            validation.validatePasswordConfirmation();
            passwordConfirmInput.focus();
            return;
        }

        const loginId = idAvailability.getValue();
        if (!idAvailability.isChecked(loginId)) {
            idAvailability.showRequiredMessage();
            return;
        }

        const email = emailVerification.getValue();
        if (!emailVerification.isVerified(email)) {
            emailVerification.showRequiredMessage();
            return;
        }

        const selectedGender = form.querySelector('input[name="gender"]:checked');
        const requestData = {
            memberName: document.getElementById('signupName').value.trim(),
            loginId: loginId,
            password: password,
            email: email,
            birthDate: document.getElementById('signupBirthDate').value || null,
            gender: selectedGender === null ? null : selectedGender.value,
            termsAgreed: consent !== null && consent.checked
        };

        const csrfInput = document.getElementById('csrfToken');
        if (csrfInput === null) {
            showError('보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.');
            return;
        }

        try {
            const response = await fetch(page.dataset.contextPath + '/api/members/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfInput.value
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                showError('회원가입에 실패했습니다. 입력 정보를 확인해 주세요.');
                return;
            }

            form.reset();
            showError('');
            idAvailability.clear();
            showStep(2);
        } catch (error) {
            showError('서버와 통신하지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
    });
}
