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
    let checkedLoginId = null;
    const signupNoticeElement = document.getElementById('signupNoticeModal');
    const signupNoticeMessage = document.getElementById('signupNoticeMessage');
    const signupNoticeModal = signupNoticeElement !== null
            && window.bootstrap !== undefined
        ? window.bootstrap.Modal.getOrCreateInstance(signupNoticeElement)
        : null;

    function showSignupNotice(message) {
        if (signupNoticeMessage !== null && signupNoticeModal !== null) {
            signupNoticeMessage.textContent = message;
            signupNoticeModal.show();
            return;
        }

        window.alert(message);
    }

    // 오류 메시지를 표시하거나 지웁니다.
    function setError(element, message) {
        if (element === null) {
            return;
        }

        element.textContent = message;
        element.hidden = !message;
    }

    // 검사 결과를 입력칸 아래에 표시합니다.
    function setFieldStatus(input, statusId, message, state) {
        const status = document.getElementById(statusId);
        if (status === null) return;

        status.textContent = message;
        status.classList.remove('text-success', 'text-danger', 'text-muted');
        status.classList.add(state === 'valid' ? 'text-success'
            : state === 'invalid' ? 'text-danger' : 'text-muted');
        input.setAttribute('aria-invalid', String(state === 'invalid'));
    }

    function validateSignupName() {
        const input = document.getElementById('signupName');
        if (input === null) return false;

        const name = input.value.trim();
        const valid = name.length > 0 && name.length <= 20
            && /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z ]+$/.test(name);
        const message = name.length === 0 ? '이름을 입력해 주세요.'
            : valid ? ''
                : '한글·영문·공백만 입력할 수 있습니다. (20자 이내)';

        setFieldStatus(input, 'signupNameStatus', message,
            name.length === 0 || !valid ? 'invalid' : 'valid');
        return valid;
    }

    function filterSignupName(input) {
        input.value = input.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z ]/g, '');
    }

    function showSignupNameGuidance() {
        const input = document.getElementById('signupName');
        if (input === null) return;

        setFieldStatus(input, 'signupNameStatus', '이름을 입력해 주세요.', 'neutral');
    }

    function showSignupPasswordGuidance() {
        const input = document.getElementById('signupPassword');
        if (input === null) return;

        const guidance = '비밀번호는 8~20자로 입력해 주세요. 영문 대/소문자를 구분하며, >, <, _, -, ", \'는 사용할 수 없어요.';
        setFieldStatus(input, 'signupPasswordStatus', guidance, 'neutral');
    }

    function validateSignupPassword() {
        const input = document.getElementById('signupPassword');
        if (input === null) return false;

        const password = input.value;
        if (password.length === 0) {
            showSignupPasswordGuidance();
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

    function bindImmediateValidation() {
        const nameInput = document.getElementById('signupName');
        const passwordInput = document.getElementById('signupPassword');
        if (nameInput !== null) {
            nameInput.addEventListener('input', function (event) {
                if (event.isComposing) return;
                filterSignupName(nameInput);
            });
            nameInput.addEventListener('compositionend', function () {
                filterSignupName(nameInput);
            });
            nameInput.addEventListener('focus', showSignupNameGuidance);
            nameInput.addEventListener('blur', function () {
                filterSignupName(nameInput);
                validateSignupName();
            });
        }

        if (passwordInput !== null) {
            passwordInput.addEventListener('input', function () {
                validatePasswordConfirmation();
            });
            passwordInput.addEventListener('focus', showSignupPasswordGuidance);
            passwordInput.addEventListener('blur', validateSignupPassword);
        }

        const passwordConfirmInput = document.getElementById('signupPasswordConfirm');
        if (passwordConfirmInput !== null) {
            passwordConfirmInput.addEventListener('focus', showPasswordConfirmationGuidance);
            passwordConfirmInput.addEventListener('blur', validatePasswordConfirmation);
        }

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

    bindImmediateValidation();

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

    // 중복확인 결과는 아이디가 바뀌면 더 이상 유효하지 않습니다.
    const idField = document.getElementById('signupId');
    const idStatus = document.getElementById('signupIdCheckStatus');
    const idCheckButton = document.querySelector('[data-check-id]');
    if (idField !== null) {
        idField.addEventListener('input', function () {
            checkedLoginId = null;
            if (idStatus !== null) {
                idStatus.textContent = '';
                idStatus.classList.remove('text-success', 'text-danger');
            }
        });
    }

    if (idCheckButton !== null && idField !== null) {
        idCheckButton.addEventListener('click', async function () {
            const loginId = idField.value.trim();

            if (!/^[A-Za-z0-9]{4,16}$/.test(loginId)) {
                checkedLoginId = null;
                idField.focus();
                showSignupNotice('아이디는 4~16자의 영문 대소문자와 숫자로 입력해 주세요.');
                return;
            }

            idCheckButton.disabled = true;

            try {
                const url = page.dataset.contextPath
                    + '/api/members/id-availability?loginId='
                    + encodeURIComponent(loginId);
                const response = await fetch(url, {
                    headers: { Accept: 'application/json' }
                });
                const result = await response.json().catch(function () {
                    return null;
                });

                if (!response.ok || result === null
                        || typeof result.available !== 'boolean') {
                    throw new Error('중복확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                }

                checkedLoginId = result.available ? loginId : null;
                if (idStatus !== null) {
                    idStatus.textContent = '';
                    idStatus.classList.remove('text-success', 'text-danger', 'text-muted');
                }
                showSignupNotice(result.available
                    ? '사용할 수 있는 아이디입니다.'
                    : '이미 사용 중인 아이디입니다.');
            } catch (error) {
                checkedLoginId = null;
                if (idStatus !== null) {
                    idStatus.textContent = '';
                    idStatus.classList.remove('text-success', 'text-danger', 'text-muted');
                }
                showSignupNotice(error.message
                    || '중복확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
            } finally {
                idCheckButton.disabled = false;
            }
        });
    }

    // 입력값을 확인한 뒤 회원가입 API에 요청을 보냅니다.
    if (form !== null) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            setError(accountError, '');

            if (!validateSignupName()) {
                document.getElementById('signupName').focus();
                return;
            }

            if (!validateSignupPassword()) {
                document.getElementById('signupPassword').focus();
                return;
            }

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
                validatePasswordConfirmation();
                passwordConfirmInput.focus();
                return;
            }

            const loginId = idField === null ? '' : idField.value.trim();
            if (checkedLoginId !== loginId) {
                if (idStatus !== null) {
                    idStatus.textContent = '아이디 중복확인을 해주세요.';
                    idStatus.classList.remove('text-success', 'text-muted');
                    idStatus.classList.add('text-danger');
                }
                if (idField !== null) {
                    idField.focus();
                }
                return;
            }

            // 생년월일·성별 필드는 이후 회원가입 API DTO와 맞춰야 합니다.
            const selectedGender = form.querySelector('input[name="gender"]:checked');
            const requestData = {
                memberName: document.getElementById('signupName').value.trim(),
                loginId: loginId,
                password: password,
                email: document.getElementById('signupEmail').value.trim(),
                birthDate: document.getElementById('signupBirthDate').value || null,
                gender: selectedGender === null ? null : selectedGender.value,
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

                if (idStatus !== null) {
                    idStatus.textContent = '';
                    idStatus.classList.remove('text-success', 'text-danger');
                }
                checkedLoginId = null;

                showStep(2);
            } catch (error) {
                setError(accountError, '서버와 통신하지 못했습니다. 잠시 후 다시 시도해 주세요.');
            }
        });
    }
})();
