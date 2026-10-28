(function () {
    const toast = window.Haebom.toast;
    const page = document.getElementById('mypage-content');
    const completedHistory = [];
    const withdrawConfirmText = document.getElementById('withdrawConfirmText');
    const withdrawConfirmButton = document.querySelector('[data-confirm-delete]');
    const withdrawModal = document.getElementById('confirmModal');
    const withdrawPhrase = '회원 탈퇴';

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
        const selectedPanel = selectedTab.dataset.myTab;
        const tabs = document.querySelectorAll('.mypage-tabs [data-my-tab]');
        const panels = document.querySelectorAll('[data-my-panel]');

        tabs.forEach(function (tab) {
            const isSelected = tab.dataset.myTab === selectedPanel;
            tab.classList.toggle('active', isSelected);
            if (isSelected) {
                tab.setAttribute('aria-current', 'page');
            } else {
                tab.removeAttribute('aria-current');
            }
        });

        panels.forEach(function (panel) {
            panel.classList.toggle(
                'd-none',
                panel.dataset.myPanel !== selectedPanel
            );
        });
    }

    function setProfileText(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value == null || value === '' ? '정보 없음' : value;
        }
    }

    function formatProfileDate(value, emptyLabel) {
        if (!value) {
            return emptyLabel;
        }

        const datePart = String(value).split('T')[0];
        const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        return match ? `${match[1]}.${match[2]}.${match[3]}` : datePart;
    }

    function formatGender(value) {
        if (value === 'M') {
            return '남성';
        }
        if (value === 'F') {
            return '여성';
        }
        return '미입력';
    }

    async function loadProfile() {
        if (!page || !page.dataset.profileApiUrl) {
            return;
        }

        try {
            const response = await fetch(page.dataset.profileApiUrl, {
                headers: { Accept: 'application/json' }
            });

            if (response.status === 401 || response.redirected) {
                throw new Error('로그인 후 회원 정보를 확인할 수 있습니다.');
            }
            if (!response.ok) {
                throw new Error('회원 정보를 불러오지 못했습니다.');
            }

            const profile = await response.json();
            setProfileText('[data-profile-name]', profile.memberName);
            setProfileText('[data-profile-login-id]', profile.loginId);
            setProfileText('[data-profile-email]', profile.email);
            setProfileText(
                '[data-profile-birth-date]',
                formatProfileDate(profile.birthDate, '미입력')
            );
            setProfileText('[data-profile-gender]', formatGender(profile.gender));
            setProfileText(
                '[data-profile-created-at]',
                formatProfileDate(profile.createdAt, '정보 없음')
            );
        } catch (error) {
            setProfileText('[data-profile-name]', '조회 실패');
            setProfileText('[data-profile-login-id]', '조회 실패');
            setProfileText('[data-profile-email]', '조회 실패');
            setProfileText('[data-profile-birth-date]', '조회 실패');
            setProfileText('[data-profile-gender]', '조회 실패');
            setProfileText('[data-profile-created-at]', '조회 실패');

            const status = document.querySelector('[data-mypage-status]');
            if (status) {
                status.textContent = error.message || '회원 정보를 불러오지 못했습니다.';
            }
        }
    }

    function formatDate(value) {
        if (!value) {
            return '완료일 정보 없음';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '완료일 정보 없음';
        }

        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function renderCompletedList(target, records) {
        if (!target) {
            return;
        }

        if (records.length === 0) {
            target.innerHTML = `
                <div class="completed-history-empty">
                    <span class="material-symbols-outlined" aria-hidden="true">assignment</span>
                    <strong>아직 완료한 연습이 없습니다.</strong>
                    <p>시나리오를 완료하면 작성한 내용을 여기서 다시 볼 수 있어요.</p>
                    <a class="btn btn-outline-primary btn-sm rounded-pill" href="${escapeHtml(page.dataset.scenarioListUrl)}">시나리오 둘러보기</a>
                </div>`;
            return;
        }

        target.innerHTML = records.map(function (record) {
            const scenario = record.scenario || {};
            const progress = record.progress || {};
            const completedAt = progress.completedAt || progress.lastSavedAt || progress.startedAt;

            return `
                <article class="completed-history-item">
                    <span class="completed-history-icon material-symbols-outlined" aria-hidden="true">task_alt</span>
                    <div class="completed-history-info">
                        <h3>${escapeHtml(scenario.scenarioTitle || '시나리오')}</h3>
                        <p>${escapeHtml(scenario.categoryLabel || scenario.categoryName || '행정절차 연습')}</p>
                    </div>
                    <time>${escapeHtml(formatDate(completedAt))}</time>
                    <button class="btn btn-outline-primary btn-sm rounded-pill" type="button" data-review-progress="${escapeHtml(progress.progressId)}">
                        작성 내역 보기
                    </button>
                </article>`;
        }).join('');
    }

    function renderCompletedHistory(records) {
        const list = document.querySelector('[data-completed-list]');
        renderCompletedList(list, records);
    }

    async function loadCompletedHistory() {
        if (!page) {
            return;
        }

        const list = document.querySelector('[data-completed-list]');
        if (list) {
            list.innerHTML = '<p class="text-secondary mb-0" role="status">완료 내역을 불러오는 중입니다.</p>';
        }

        try {
            const response = await fetch(page.dataset.scenariosApiUrl, {
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) {
                throw new Error('완료 내역을 불러오지 못했습니다.');
            }

            const scenarios = await response.json();
            const records = scenarios
                .filter(function (item) {
                    return item && item.progress && item.progress.progressStatus === 'COMPLETED';
                })
                .sort(function (first, second) {
                    const firstDate = new Date(first.progress.completedAt || first.progress.lastSavedAt || first.progress.startedAt || 0).getTime();
                    const secondDate = new Date(second.progress.completedAt || second.progress.lastSavedAt || second.progress.startedAt || 0).getTime();
                    return secondDate - firstDate;
                });

            completedHistory.splice(0, completedHistory.length, ...records);
            renderCompletedHistory(completedHistory);
        } catch (error) {
            if (list) {
                list.innerHTML = `
                    <div class="completed-history-error" role="alert">
                        <span>${escapeHtml(error.message || '완료 내역을 불러오지 못했습니다.')}</span>
                        <button class="btn btn-outline-secondary btn-sm" type="button" data-retry-completed>다시 시도</button>
                    </div>`;
            }
        }
    }

    function handleReviewClick(event) {
        const button = event.target.closest('[data-review-progress]');
        if (!button || !page) {
            return;
        }

        sessionStorage.setItem('progressId', button.dataset.reviewProgress);
        window.location.href = page.dataset.simulationUrl;
    }

    function handleOpenPasswordChange() {
        openModal('#passwordChangeModal');
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

    function updateWithdrawButtonState() {
        if (!withdrawConfirmText || !withdrawConfirmButton) {
            return;
        }

        withdrawConfirmButton.disabled =
            withdrawConfirmText.value.trim() !== withdrawPhrase;
    }

    async function handleConfirmDelete(event) {
        const button = event.currentTarget;
        const apiUrl = page && page.dataset.withdrawApiUrl;

        // 화면의 disabled 상태와 별개로 요청 직전에도 확인 문구를 검사합니다.
        if (!withdrawConfirmText
                || withdrawConfirmText.value.trim() !== withdrawPhrase) {
            toast('안내 문구에 회원 탈퇴를 입력해 주세요.');
            return;
        }

        if (!apiUrl) {
            toast('회원 탈퇴 요청 주소를 찾을 수 없습니다.');
            return;
        }

        button.disabled = true;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { Accept: 'application/json' }
            });

            if (!response.ok || response.redirected) {
                throw new Error('회원 탈퇴 처리에 실패했습니다. 다시 로그인한 뒤 시도해 주세요.');
            }

            const result = await response.json();
            if (!result.withdrawn) {
                throw new Error('회원 탈퇴 처리에 실패했습니다. 다시 시도해 주세요.');
            }

            closeModal('#confirmModal');
            window.location.href = page.dataset.homeUrl || '/';
        } catch (error) {
            toast(error.message || '회원 탈퇴 중 오류가 발생했습니다.');
            updateWithdrawButtonState();
        }
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
        bindClickEvents('[data-delete-account]', handleDeleteAccount);
        bindClickEvents('[data-confirm-delete]', handleConfirmDelete);

        if (withdrawConfirmText) {
            withdrawConfirmText.addEventListener('input', updateWithdrawButtonState);
        }

        if (withdrawModal && withdrawConfirmText && withdrawConfirmButton) {
            withdrawModal.addEventListener('hidden.bs.modal', function () {
                withdrawConfirmText.value = '';
                updateWithdrawButtonState();
            });
        }

        const passwordChangeForm = document.getElementById('passwordChangeForm');

        if (passwordChangeForm) {
            passwordChangeForm.addEventListener('submit', handlePasswordChange);
        }

        document.addEventListener('click', function (event) {
            if (event.target.closest('[data-review-progress]')) {
                handleReviewClick(event);
            } else if (event.target.closest('[data-retry-completed]')) {
                loadCompletedHistory();
            }
        });
    }

    bindEvents();
    loadProfile();
    loadCompletedHistory();
}());

