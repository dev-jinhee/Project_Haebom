import { initSignupValidation } from './signup-validation.js?v=signup-modules-2';
import { initIdAvailability } from './signup-id-availability.js?v=signup-modules-8';
import { initEmailVerification } from './signup-email-verification.js?v=signup-modules-4';
import { initSignupSubmit } from './signup-submit.js?v=signup-modules-1';

const page = document.querySelector('.member-signup-page');
if (page !== null) {
    const steps = document.querySelectorAll('[id^="signupStep"]');
    const stepLabels = document.querySelectorAll('[data-signup-step-label]');
    const consent = document.getElementById('signupRequiredConsent');
    const termsConsent = document.getElementById('signupTermsConsent');
    const agreeAll = document.getElementById('signupAgreeAll');
    const consentError = document.getElementById('signupConsentError');
    const accountError = document.getElementById('signupAccountError');
    const form = document.getElementById('signupAccountForm');
    function showError(message) {
        if (accountError === null) return;
        accountError.textContent = message;
        accountError.hidden = !message;
    }

    function showNotice(message) {
        if (typeof window.haebomAlert === 'function') {
            window.haebomAlert(message, '아이디 중복확인', null, 'warn');
        } else {
            window.alert(message);
        }
    }

    function showStep(activeIndex) {
        steps.forEach(function (step, index) {
            step.classList.toggle('d-none', index !== activeIndex);
            step.setAttribute('aria-hidden', String(index !== activeIndex));
        });

        stepLabels.forEach(function (label) {
            const index = Number(label.dataset.signupStepLabel);
            label.classList.toggle('is-active', index === activeIndex);
            label.classList.toggle('is-complete', index < activeIndex);
            if (index === activeIndex) {
                label.setAttribute('aria-current', 'step');
            } else {
                label.removeAttribute('aria-current');
            }
        });

        const activeStep = steps[activeIndex];
        if (activeStep !== undefined) {
            activeStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const heading = activeStep.querySelector('h2');
            if (heading !== null) heading.focus({ preventScroll: true });
        }
    }

    const nextButton = document.querySelector('[data-signup-next="1"]');
    if (nextButton !== null) {
        nextButton.addEventListener('click', function () {
            if (consent === null || termsConsent === null
                    || !consent.checked || !termsConsent.checked) {
                if (consentError !== null) {
                    consentError.textContent = page.dataset.consentError;
                    consentError.hidden = false;
                }
                const uncheckedConsent = termsConsent !== null && !termsConsent.checked
                    ? termsConsent : consent;
                if (uncheckedConsent !== null) uncheckedConsent.focus();
                return;
            }
            if (consentError !== null) {
                consentError.textContent = '';
                consentError.hidden = true;
            }
            showStep(1);
        });
    }

    const requiredConsents = [termsConsent, consent].filter(Boolean);
    function syncAgreeAll() {
        if (agreeAll === null) return;
        const checkedCount = requiredConsents.filter(function (checkbox) {
            return checkbox.checked;
        }).length;
        agreeAll.checked = checkedCount === requiredConsents.length;
        agreeAll.indeterminate = false;
    }

    if (agreeAll !== null) {
        agreeAll.addEventListener('change', function () {
            requiredConsents.forEach(function (checkbox) {
                checkbox.checked = agreeAll.checked;
            });
            syncAgreeAll();
            if (agreeAll.checked && consentError !== null) {
                consentError.textContent = '';
                consentError.hidden = true;
            }
        });
    }

    requiredConsents.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            syncAgreeAll();
            if (requiredConsents.every(function (item) { return item.checked; })
                    && consentError !== null) {
                consentError.textContent = '';
                consentError.hidden = true;
            }
        });
    });

    document.querySelectorAll('[data-consent-details]').forEach(function (button) {
        button.addEventListener('click', function () {
            const details = document.getElementById(button.dataset.consentDetails);
            if (details === null) return;
            const willOpen = details.hidden;
            details.hidden = !willOpen;
            button.setAttribute('aria-expanded', String(willOpen));
            button.textContent = willOpen ? '내용 접기' : '내용 보기';
        });
    });

    syncAgreeAll();

    document.querySelectorAll('[data-signup-back="0"]').forEach(function (button) {
        button.addEventListener('click', function () {
            showStep(0);
        });
    });

    const birthDateInput = document.getElementById('signupBirthDate');
    const birthDatePickerInput = document.getElementById('signupBirthDatePicker');
    const birthDatePickerButton = document.querySelector('[data-birth-date-picker]');
    const birthDateHelp = document.getElementById('signupBirthDateHelp');
    if (birthDateInput !== null && birthDatePickerInput !== null && birthDatePickerButton !== null) {
        const birthDateHint = '생년월일을 숫자 8자리로 입력하거나 달력에서 선택해 주세요. 예: 20030217';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const padDatePart = function (value) { return String(value).padStart(2, '0'); };
        birthDatePickerInput.max = `${today.getFullYear()}-${padDatePart(today.getMonth() + 1)}-${padDatePart(today.getDate())}`;
        let birthDateTouched = false;
        let birthDateFocused = false;

        function validateBirthDate(revealError) {
            if (revealError) birthDateTouched = true;
            const value = birthDateInput.value.trim();
            let message = '';

            if (value !== '') {
                const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (!match) {
                    message = '생년월일을 숫자 8자리로 입력해 주세요. 예: 20030217';
                } else {
                    const year = Number(match[1]);
                    const month = Number(match[2]);
                    const day = Number(match[3]);
                    const date = new Date(year, month - 1, day);
                    if (year < 1900 || date.getFullYear() !== year
                            || date.getMonth() !== month - 1 || date.getDate() !== day) {
                        message = '실제 달력에 있는 날짜를 입력해 주세요.';
                    } else if (date > today) {
                        message = '오늘 이후 날짜는 입력할 수 없습니다.';
                    }
                }
            }

            birthDateInput.setCustomValidity(message);
            const showError = birthDateTouched && !birthDateFocused && Boolean(message);
            birthDateInput.setAttribute('aria-invalid', String(showError));
            if (birthDateHelp !== null) {
                birthDateHelp.textContent = showError ? message : birthDateHint;
                birthDateHelp.classList.toggle('text-danger', showError);
                birthDateHelp.classList.toggle('text-muted', !showError);
            }
            birthDatePickerInput.value = message === '' ? value : '';
            return message === '';
        }

        birthDateInput.setAttribute('aria-invalid', 'false');
        birthDateInput.addEventListener('input', function () {
            const digits = birthDateInput.value.replace(/[^0-9]/g, '').slice(0, 8);
            if (digits.length <= 4) {
                birthDateInput.value = digits;
            } else if (digits.length <= 6) {
                birthDateInput.value = `${digits.slice(0, 4)}-${digits.slice(4)}`;
            } else {
                birthDateInput.value = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
            }
            validateBirthDate(false);
        });
        birthDateInput.addEventListener('focus', function () {
            birthDateFocused = true;
            validateBirthDate(false);
        });
        birthDateInput.addEventListener('blur', function () {
            birthDateFocused = false;
            validateBirthDate(true);
        });
        if (form !== null) {
            form.addEventListener('submit', function () {
                birthDateFocused = false;
                validateBirthDate(true);
            });
        }

        function copyDateFromPicker() {
            birthDateInput.value = birthDatePickerInput.value;
            validateBirthDate(false);
        }
        birthDatePickerInput.addEventListener('input', copyDateFromPicker);
        birthDatePickerInput.addEventListener('change', copyDateFromPicker);
        birthDatePickerButton.addEventListener('click', function () {
            if (typeof birthDatePickerInput.showPicker === 'function') {
                try {
                    birthDatePickerInput.showPicker();
                    return;
                } catch (error) {
                    // Use the browser's native date control as a fallback.
                }
            }
            birthDatePickerInput.click();
        });
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

    const validation = initSignupValidation();
    const idAvailability = initIdAvailability(page, showNotice);
    const emailVerification = initEmailVerification(page);
    initSignupSubmit({
        page: page,
        form: form,
        consent: consent,
        showError: showError,
        showStep: showStep,
        validation: validation,
        idAvailability: idAvailability,
        emailVerification: emailVerification
    });
}
