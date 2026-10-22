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

    // 입력값을 확인한 뒤 회원가입 API에 요청을 보냅니다.
    if (form !== null) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            setError(accountError, '');

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const passwordInput = document.getElementById('signupPassword');
            const passwordConfirmInput = document.getElementById('signupPasswordConfirm');

            if (passwordInput === null || passwordConfirmInput === null) {
                return;
            }

            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;

            if (password !== passwordConfirm) {
                setError(accountError, page.dataset.passwordError);
                passwordConfirmInput.focus();
                return;
            }

            // API가 받는 DTO 필드명과 같은 이름으로 요청 데이터를 만듭니다.
            const requestData = {
                memberName: document.getElementById('signupName').value.trim(),
                loginId: document.getElementById('signupId').value.trim(),
                password: password,
                email: document.getElementById('signupEmail').value.trim(),
                registrationNumberFront: document.getElementById('registrationNumberFront').value,
                registrationNumberBackFirstDigit: document.getElementById('registrationNumberBackFirstDigit').value,
                termsAgreed: consent !== null && consent.checked
            };

            const csrfInput = document.getElementById('csrfToken');
            if (csrfInput === null) {
                setError(accountError, '보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.');
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
                    setError(accountError, '회원가입에 실패했습니다. 입력 정보를 확인해 주세요.');
                    return;
                }

                // 성공 응답은 201 Created이며 본문이 비어 있습니다.
                form.reset();
                setError(accountError, '');

                const idStatus = document.getElementById('signupIdCheckStatus');
                if (idStatus !== null) {
                    idStatus.textContent = '';
                }

                showStep(2);
            } catch (error) {
                setError(accountError, '서버와 통신하지 못했습니다. 잠시 후 다시 시도해 주세요.');
            }
        });
    }
})();
