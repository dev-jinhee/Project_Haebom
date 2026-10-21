// 회원가입 페이지에서만 실행되는 코드입니다.
(function () {
    // 회원가입 페이지가 아니면 이 스크립트를 실행하지 않습니다.
    const page = document.querySelector('.member-signup-page');
    if (page === null) {
        return;
    }

    // 화면에서 사용하는 요소들을 가져옵니다.
    const steps = document.querySelectorAll('[id^="signupStep"]');
    const stepLabels = document.querySelectorAll('[data-signup-step-label]');
    const consent = document.getElementById('signupRequiredConsent');
    const consentError = document.getElementById('signupConsentError');
    const accountError = document.getElementById('signupAccountError');
    const form = document.getElementById('signupAccountForm');

    // 오류 메시지를 표시하거나 지웁니다.
    function setError(element, message) {
        if (element === null) {
            return;
        }

        element.textContent = message;
        element.hidden = !message;
    }

    // 지정한 가입 단계만 화면에 표시합니다.
    function showStep(activeIndex) {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const isActive = i === activeIndex;

            step.classList.toggle('d-none', !isActive);
            step.setAttribute('aria-hidden', String(!isActive));
        }

        for (let i = 0; i < stepLabels.length; i++) {
            const label = stepLabels[i];
            const labelIndex = Number(label.dataset.signupStepLabel);

            label.classList.toggle('is-active', labelIndex === activeIndex);
            label.classList.toggle('is-complete', labelIndex < activeIndex);

            if (labelIndex === activeIndex) {
                label.setAttribute('aria-current', 'step');
            } else {
                label.removeAttribute('aria-current');
            }
        }

        const activeStep = steps[activeIndex];
        if (activeStep !== undefined) {
            activeStep.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const heading = activeStep.querySelector('h2');
            if (heading !== null) {
                heading.focus({ preventScroll: true });
            }
        }
    }

    // 약관에 동의하면 다음 단계로 이동합니다.
    const nextButton = document.querySelector('[data-signup-next="1"]');
    if (nextButton !== null) {
        nextButton.addEventListener('click', function () {
            if (consent === null || !consent.checked) {
                setError(consentError, page.dataset.consentError);

                if (consent !== null) {
                    consent.focus();
                }
                return;
            }

            setError(consentError, '');
            showStep(1);
        });
    }

    // 동의 체크를 선택하면 동의 오류 메시지를 지웁니다.
    if (consent !== null) {
        consent.addEventListener('change', function () {
            if (consent.checked) {
                setError(consentError, '');
            }
        });
    }

    // 뒤로 가기 버튼은 첫 번째 단계로 이동합니다.
    const backButtons = document.querySelectorAll('[data-signup-back="0"]');
    for (let j = 0; j < backButtons.length; j++) {
        backButtons[j].addEventListener('click', function () {
            showStep(0);
        });
    }

    // 등록번호 입력란에는 숫자만 남깁니다.
    function allowDigitsOnly(inputId) {
        const input = document.getElementById(inputId);
        if (input === null) {
            return;
        }

        input.addEventListener('input', function (event) {
            event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '');
        });
    }

    allowDigitsOnly('registrationNumberFront');
    allowDigitsOnly('registrationNumberBackFirstDigit');

    // 아이디 중복 확인 버튼의 현재 화면 동작입니다.
    const idCheckButton = document.querySelector('[data-check-id]');
    if (idCheckButton !== null) {
        idCheckButton.addEventListener('click', function () {
            const idField = document.getElementById('signupId');
            const status = document.getElementById('signupIdCheckStatus');

            if (idField === null || idField.value.trim() === '') {
                if (idField !== null) {
                    idField.focus();
                }
                return;
            }

            if (status !== null) {
                status.textContent = page.dataset.idCheckMessage || '';
            }
        });
    }

    // 가입 폼 제출을 확인합니다.
    if (form !== null) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            setError(accountError, '');

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const password = document.getElementById('signupPassword');
            const confirmation = document.getElementById('signupPasswordConfirm');

            const passwordValue = password === null ? undefined : password.value;
            const confirmationValue = confirmation === null ? undefined : confirmation.value;

            if (passwordValue !== confirmationValue) {
                setError(accountError, page.dataset.passwordError);

                if (confirmation !== null) {
                    confirmation.focus();
                }
                return;
            }

            // 현재는 화면 흐름만 확인합니다. 아직 서버로 가입 요청을 보내지 않습니다.
            form.reset();
            setError(accountError, '');

            const idStatus = document.getElementById('signupIdCheckStatus');
            if (idStatus !== null) {
                idStatus.textContent = '';
            }

            showStep(2);
        });
    }
})();
