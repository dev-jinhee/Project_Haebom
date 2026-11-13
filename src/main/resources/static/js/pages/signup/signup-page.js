import { initSignupValidation } from './signup-validation.js?v=signup-modules-1';
import { initIdAvailability } from './signup-id-availability.js?v=signup-modules-7';
import { initEmailVerification } from './signup-email-verification.js?v=signup-modules-3';
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
    const noticeElement = document.getElementById('signupNoticeModal');
    const noticeMessage = document.getElementById('signupNoticeMessage');
    const noticeModal = noticeElement !== null && window.bootstrap !== undefined
        ? window.bootstrap.Modal.getOrCreateInstance(noticeElement)
        : null;

    function showError(message) {
        if (accountError === null) return;
        accountError.textContent = message;
        accountError.hidden = !message;
    }

    function showNotice(message) {
        if (noticeMessage !== null && noticeModal !== null) {
            noticeMessage.textContent = message;
            noticeModal.show();
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
    if (birthDateInput !== null && typeof birthDateInput.showPicker === 'function') {
        birthDateInput.addEventListener('click', function () {
            try {
                birthDateInput.showPicker();
            } catch (error) {
                // 브라우저에서 제공하는 달력 버튼을 사용할 수 있습니다.
            }
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
