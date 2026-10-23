(function () {
    const toast = window.Haebom.toast;

    function openModal(selector) {
        const modalElement = document.querySelector(selector);

        if (modalElement && window.bootstrap) {
            window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
        }
    }

    function closeModal(selector) {
        const modalElement = document.querySelector(selector);

        if (modalElement && window.bootstrap) {
            window.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
        }
    }

    function handleTabClick(event) {
        const selectedTab = event.currentTarget;
        const tabs = document.querySelectorAll('[data-my-tab]');
        const panels = document.querySelectorAll('[data-my-panel]');

        tabs.forEach(function (tab) {
            tab.classList.toggle('active', tab === selectedTab);
        });

        panels.forEach(function (panel) {
            panel.classList.toggle(
                'd-none',
                panel.dataset.myPanel !== selectedTab.dataset.myTab
            );
        });
    }

    function handleOpenPasswordChange() {
        openModal('#passwordChangeModal');
    }

    function handleOpenEmailChange() {
        const currentEmailInput = document.getElementById('currentEmail');
        const profileEmail = document.querySelector('[data-profile-email]');

        if (currentEmailInput && profileEmail) {
            currentEmailInput.value = profileEmail.textContent.trim();
        }

        openModal('#emailChangeModal');
    }

    function handleEmailChange(event) {
        event.preventDefault();

        const newEmailInput = document.getElementById('newEmail');
        const email = newEmailInput ? newEmailInput.value.trim() : '';

        if (!email) {
            return;
        }

        localStorage.setItem('ongyeol-demo-email', email);

        const profileEmails = document.querySelectorAll('[data-profile-email]');

        profileEmails.forEach(function (profileEmail) {
            profileEmail.textContent = email;
        });

        closeModal('#emailChangeModal');
        event.currentTarget.reset();

        const currentEmailInput = document.getElementById('currentEmail');

        if (currentEmailInput) {
            currentEmailInput.value = email;
        }

        toast('이메일이 변경된 화면을 보여드립니다. 실제 이메일 인증은 연결되지 않았습니다.');
    }

    function handlePasswordChange(event) {
        event.preventDefault();

        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmNewPassword');
        const password = newPasswordInput ? newPasswordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        if (password.length < 8) {
            toast('새 비밀번호를 8자 이상 입력해 주세요.');

            if (newPasswordInput) {
                newPasswordInput.focus();
            }

            return;
        }

        if (password !== confirmPassword) {
            toast('새 비밀번호가 서로 일치하지 않습니다.');

            if (confirmPasswordInput) {
                confirmPasswordInput.focus();
            }

            return;
        }

        closeModal('#passwordChangeModal');
        event.currentTarget.reset();
        toast('화면 시안입니다. 비밀번호는 실제로 변경되지 않았습니다.');
    }

    function handleDeleteAccount() {
        openModal('#confirmModal');
    }

    function handleConfirmDelete() {
        closeModal('#confirmModal');
        toast('탈퇴 처리 화면 시안입니다. 계정은 삭제되지 않았습니다.');
    }

    function bindClickEvents(selector, handler) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(function (element) {
            element.addEventListener('click', handler);
        });
    }

    function bindEvents() {
        bindClickEvents('[data-my-tab]', handleTabClick);
        bindClickEvents('[data-open-password-change]', handleOpenPasswordChange);
        bindClickEvents('[data-open-email-change]', handleOpenEmailChange);
        bindClickEvents('[data-delete-account]', handleDeleteAccount);
        bindClickEvents('[data-confirm-delete]', handleConfirmDelete);

        const emailChangeForm = document.getElementById('emailChangeForm');

        if (emailChangeForm) {
            emailChangeForm.addEventListener('submit', handleEmailChange);
        }

        const passwordChangeForm = document.getElementById('passwordChangeForm');

        if (passwordChangeForm) {
            passwordChangeForm.addEventListener('submit', handlePasswordChange);
        }
    }

    bindEvents();
}());

