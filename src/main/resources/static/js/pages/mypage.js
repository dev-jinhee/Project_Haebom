(function () {
    const toast = window.Haebom.toast;
    const page = document.getElementById('mypage-content');
    const completedHistory = [];
    const scenarioDetailsById = new Map();
    let latestProgressByScenarioId = null;
    let latestProgressLoaded = false;
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

    function openMyPageSimulation(progressId) {
        sessionStorage.setItem('progressId', progressId);
        window.location.href = page.dataset.simulationUrl;
    }

    function renderInProgressScenarios(items) {
        const list = document.querySelector('[data-in-progress-list]');
        const template = document.getElementById('mypageProgressScenarioTemplate');
        if (!list || !template) {
            return;
        }

        const activeItems = items.filter(function (item) {
            return item && item.progress && item.progress.progressStatus === 'IN_PROGRESS';
        });

        if (activeItems.length === 0) {
            list.innerHTML = '<p class="scenario-empty" role="status">현재 진행 중인 연습이 없습니다. 시나리오를 선택해 연습을 시작해 보세요.</p>';
            return;
        }

        list.replaceChildren();
        activeItems.forEach(function (item) {
            const scenario = item.scenario || {};
            const progress = item.progress;
            const card = template.content.firstElementChild.cloneNode(true);
            const totalSteps = Number(scenario.stepCount) || 0;
            const currentStep = Number(progress.stepOrder) || 0;
            const completedSteps = Math.max(0, currentStep - 1);
            const percent = totalSteps > 0
                ? Math.min(100, Math.round(completedSteps / totalSteps * 100))
                : 0;

            card.querySelector('[data-progress-category]').textContent = scenario.categoryLabel || '행정절차 연습';
            card.querySelector('[data-progress-status]').textContent = progress.progressStatusLabel || '진행 중';
            card.querySelector('[data-progress-title]').textContent = scenario.scenarioTitle || '시나리오';
            card.querySelector('[data-progress-description]').textContent = scenario.description || '';
            card.querySelector('[data-progress-step-count]').textContent = totalSteps ? `${totalSteps}단계` : '단계 정보 없음';
            card.querySelector('[data-progress-estimated-time]').textContent = scenario.estimatedMinutes
                ? `예상 ${scenario.estimatedMinutes}분`
                : '예상 시간 정보 없음';
            card.querySelector('[data-progress-percent]').textContent = `${percent}%`;
            const progressBar = card.querySelector('[data-progress-bar]');
            progressBar.style.width = `${percent}%`;
            progressBar.parentElement.setAttribute('aria-valuenow', String(percent));
            card.querySelector('[data-progress-continue]').addEventListener('click', function () {
                openMyPageSimulation(progress.progressId);
            });
            card.querySelector('[data-progress-restart]').addEventListener('click', function (event) {
                restartMyPageProgress(progress.progressId, event.currentTarget);
            });
            card.querySelector('[data-progress-delete]').addEventListener('click', function (event) {
                deleteMyPageProgress(progress.progressId, event.currentTarget);
            });

            list.appendChild(card);
        });
    }

    async function loadInProgressScenarios() {
        if (!page || !page.dataset.scenariosApiUrl) {
            return;
        }

        const list = document.querySelector('[data-in-progress-list]');
        if (list) {
            list.innerHTML = '<p class="scenario-empty" role="status">진행 중인 연습을 불러오는 중입니다.</p>';
        }

        try {
            const response = await fetch(page.dataset.scenariosApiUrl, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                credentials: 'same-origin'
            });
            if (response.status === 401 || response.redirected) {
                throw new Error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
            }
            if (!response.ok) {
                throw new Error('진행 중인 연습을 불러오지 못했습니다.');
            }

            const items = await response.json();
            if (!Array.isArray(items)) {
                throw new Error('진행 중인 연습 응답 형식이 올바르지 않습니다.');
            }
            scenarioDetailsById.clear();
            latestProgressByScenarioId = new Map();
            items.forEach(function (item) {
                if (item && item.scenario && item.scenario.scenarioId != null) {
                    scenarioDetailsById.set(String(item.scenario.scenarioId), item.scenario);
                }
                if (item && item.scenario && item.progress
                        && item.scenario.scenarioId != null) {
                    latestProgressByScenarioId.set(
                        String(item.scenario.scenarioId), item.progress
                    );
                }
            });
            latestProgressLoaded = true;
            renderInProgressScenarios(items);
            renderCompletedHistory(completedHistory);
        } catch (error) {
            latestProgressLoaded = true;
            latestProgressByScenarioId = null;
            renderCompletedHistory(completedHistory);
            if (list) {
                list.innerHTML = `
                    <div class="completed-history-error" role="alert">
                        <span>${escapeHtml(error.message || '진행 중인 연습을 불러오지 못했습니다.')}</span>
                        <button class="btn btn-outline-secondary btn-sm" type="button" data-retry-progress>다시 시도</button>
                    </div>`;
                list.querySelector('[data-retry-progress]').addEventListener('click', loadInProgressScenarios);
            }
        }
    }

    async function restartMyPageProgress(progressId, button) {
        if (!window.confirm('기존 진행기록을 삭제하고 처음부터 시작하시겠습니까?')) {
            return;
        }

        button.disabled = true;
        try {
            const response = await fetch(`${page.dataset.simulationApiUrl}/${encodeURIComponent(progressId)}/restart`, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                credentials: 'same-origin'
            });
            if (response.status === 401 || response.redirected) {
                throw new Error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
            }
            if (!response.ok) {
                throw new Error('처음부터 다시 시작하지 못했습니다.');
            }

            const newProgressId = await response.json();
            openMyPageSimulation(newProgressId);
        } catch (error) {
            toast(error.message || '시뮬레이션을 다시 시작하지 못했습니다.');
            button.disabled = false;
        }
    }

    async function deleteMyPageProgress(progressId, button, isCompleted) {
        const message = isCompleted
            ? '완료 기록을 삭제하시겠습니까?\n삭제된 입력값은 복구할 수 없습니다.'
            : '진행기록을 삭제하시겠습니까?\n삭제된 입력값은 복구할 수 없습니다.';
        if (!window.confirm(message)) {
            return;
        }

        button.disabled = true;
        try {
            const response = await fetch(`${page.dataset.simulationApiUrl}/${encodeURIComponent(progressId)}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
                credentials: 'same-origin'
            });
            if (response.status === 401 || response.redirected) {
                throw new Error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
            }
            if (!response.ok) {
                throw new Error('진행 기록을 삭제하지 못했습니다.');
            }

            toast(isCompleted ? '완료 기록을 삭제했습니다.' : '진행 기록을 삭제했습니다.');
            await Promise.all([loadInProgressScenarios(), loadCompletedHistory()]);
        } catch (error) {
            toast(error.message || '진행 기록 삭제 중 오류가 발생했습니다.');
            button.disabled = false;
        }
    }

    function renderCompletedList(target, records) {
        if (!target) {
            return;
        }

        target.classList.add('scenario-catalog');

        if (records.length === 0) {
            target.innerHTML = `
                <div class="completed-history-empty">
                    <span class="material-symbols-outlined" aria-hidden="true">assignment</span>
                    <strong>아직 완료한 연습이 없습니다.</strong>
                    <p>완료한 시나리오가 여기에 표시됩니다.</p>
                </div>`;
            return;
        }

        const template = document.getElementById('mypageProgressScenarioTemplate');
        if (!template) {
            return;
        }

        target.replaceChildren();
        records.forEach(function (record) {
            const scenario = scenarioDetailsById.get(String(record.scenarioId)) || {};
            const card = template.content.firstElementChild.cloneNode(true);
            const progressBar = card.querySelector('[data-progress-bar]');
            const reviewButton = card.querySelector('[data-progress-continue]');
            const progressId = record.progressId;

            card.querySelector('[data-progress-category]').textContent =
                record.categoryLabel || scenario.categoryLabel || record.categoryName || '행정절차 연습';
            card.querySelector('[data-progress-status]').textContent = '완료';
            card.querySelector('[data-progress-title]').textContent = record.scenarioTitle || scenario.scenarioTitle || '시나리오';
            card.querySelector('[data-progress-description]').textContent =
                scenario.description || '완료한 시나리오입니다. 작성한 내용을 확인해 보세요.';
            card.querySelector('[data-progress-step-count]').textContent = scenario.stepCount
                ? `${scenario.stepCount}단계`
                : '완료한 연습';
            card.querySelector('[data-progress-estimated-time]').textContent = scenario.estimatedMinutes
                ? `예상 ${scenario.estimatedMinutes}분`
                : `완료일 ${formatDate(record.completedAt)}`;
            card.querySelector('[data-progress-caption]').textContent = '완료한 연습';
            card.querySelector('[data-progress-percent]').textContent = '100%';
            progressBar.style.width = '100%';
            progressBar.parentElement.setAttribute('aria-valuenow', '100');
            reviewButton.textContent = '작성 내용 확인';
            reviewButton.addEventListener('click', function () {
                openMyPageSimulation(progressId);
            });
            card.querySelector('[data-progress-restart]').addEventListener('click', function (event) {
                restartMyPageProgress(progressId, event.currentTarget);
            });
            card.querySelector('[data-progress-delete]').addEventListener('click', function (event) {
                deleteMyPageProgress(progressId, event.currentTarget, true);
            });

            target.appendChild(card);
        });
    }

    function renderCompletedHistory(records) {
        if (!latestProgressLoaded) {
            return;
        }

        const list = document.querySelector('[data-completed-list]');
        const latestCompletedRecords = latestProgressByScenarioId
            ? records.filter(function (record) {
                const latestProgress = latestProgressByScenarioId.get(String(record.scenarioId));
                return latestProgress
                    && latestProgress.progressStatus === 'COMPLETED'
                    && String(latestProgress.progressId) === String(record.progressId);
            })
            : records;

        renderCompletedList(list, latestCompletedRecords);
    }

    async function loadCompletedHistory() {
        if (!page || !page.dataset.completedHistoryApiUrl) {
            return;
        }

        const list = document.querySelector('[data-completed-list]');
        if (list) {
            list.innerHTML = '<p class="text-secondary mb-0" role="status">완료 내역을 불러오는 중입니다.</p>';
        }

        try {
            const response = await fetch(page.dataset.completedHistoryApiUrl, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                credentials: 'same-origin'
            });
            if (response.status === 401 || response.redirected) {
                throw new Error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
            }
            if (!response.ok) {
                throw new Error('완료 내역을 불러오지 못했습니다.');
            }

            const records = await response.json();
            if (!Array.isArray(records)) {
                throw new Error('완료 내역 응답 형식이 올바르지 않습니다.');
            }

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

    function initializeMyInquiries() {
        const rows = document.querySelector('[data-mypage-inquiry-rows]');
        const statusFilter = document.getElementById('mypageInquiryStatus');
        const searchInput = document.getElementById('mypageInquirySearch');
        const totalElement = document.querySelector('[data-mypage-inquiry-total]');
        const pagination = document.querySelector('[data-mypage-inquiry-pagination]');

        if (!page || !rows || !page.dataset.inquiriesApiUrl) {
            return;
        }

        let inquiryItems = [];
        let currentPage = 1;
        const pageSize = 10;

        function showMessage(message, isError) {
            const messageElement = document.createElement('p');
            messageElement.className = 'mypage-inquiry-message' + (isError ? ' is-error' : '');
            messageElement.setAttribute('role', isError ? 'alert' : 'status');
            messageElement.textContent = message;
            rows.replaceChildren(messageElement);
        }

        function getFilteredItems() {
            const selectedStatus = statusFilter ? statusFilter.value : '';
            const keyword = searchInput
                ? searchInput.value.trim().toLocaleLowerCase()
                : '';

            return inquiryItems.filter(function (item) {
                const statusMatches = !selectedStatus || item.qnaStatus === selectedStatus;
                const title = String(item.qnaTitle || '').toLocaleLowerCase();
                const keywordMatches = !keyword || title.indexOf(keyword) !== -1;
                return statusMatches && keywordMatches;
            });
        }

        function renderPagination(totalPages, totalItems) {
            if (!pagination) {
                return;
            }

            pagination.replaceChildren();

            function appendPage(label, targetPage, disabled, active) {
                const item = document.createElement('li');
                item.className = 'page-item';
                if (disabled) item.classList.add('disabled');
                if (active) item.classList.add('active');

                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'page-link';
                button.textContent = label;
                button.disabled = disabled;
                button.setAttribute('aria-label', label === '이전' || label === '다음'
                    ? label + ' 페이지'
                    : '페이지 ' + label);
                button.addEventListener('click', function () {
                    currentPage = targetPage;
                    render();
                });

                item.appendChild(button);
                pagination.appendChild(item);
            }

            appendPage('이전', currentPage - 1, currentPage <= 1, false);
            for (let pageNumber = 1; pageNumber <= Math.max(1, totalPages); pageNumber++) {
                appendPage(String(pageNumber), pageNumber, false, pageNumber === currentPage);
            }
            appendPage('다음', currentPage + 1, currentPage >= totalPages, false);
        }

        function render() {
            const filteredItems = getFilteredItems();
            const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            if (totalElement) {
                totalElement.textContent = '총 ' + filteredItems.length + '건';
            }

            if (filteredItems.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'mypage-inquiry-empty';

                const icon = document.createElement('span');
                icon.className = 'material-symbols-outlined mypage-inquiry-empty-icon';
                icon.setAttribute('aria-hidden', 'true');
                icon.textContent = 'chat';

                const title = document.createElement('strong');
                title.textContent = inquiryItems.length === 0
                    ? '작성하신 문의 내역이 없습니다'
                    : '검색 결과가 없습니다';

                emptyState.append(icon, title);

                if (inquiryItems.length === 0) {
                    const description = document.createElement('p');
                    description.textContent = '궁금한 점이 있으시다면 언제든 편하게 문의를 남겨주세요.';

                    const link = document.createElement('a');
                    link.className = 'btn btn-outline-primary btn-sm rounded-pill px-4';
                    link.href = page.dataset.inquiryBoardUrl;
                    link.textContent = '문의 작성하기';
                    emptyState.append(description, link);
                }

                rows.replaceChildren(emptyState);
                renderPagination(totalPages, 0);
                return;
            }

            const startIndex = (currentPage - 1) * pageSize;
            const visibleItems = filteredItems.slice(startIndex, startIndex + pageSize);
            const renderedItems = visibleItems.map(function (item) {
                const row = document.createElement('article');
                row.className = 'mypage-inquiry-item';
                row.dataset.inquiryId = String(item.qnaId);

                const content = document.createElement('div');
                content.className = 'mypage-inquiry-content';
                const title = document.createElement('a');
                title.href = page.dataset.inquiryBoardUrl;
                title.className = 'mypage-inquiry-title';
                title.textContent = item.qnaTitle || '(제목 없음)';
                title.setAttribute('aria-label', title.textContent + ' - 문의 상세 보기');

                const metadata = document.createElement('div');
                metadata.className = 'mypage-inquiry-metadata';

                const category = document.createElement('span');
                category.textContent = item.qnaCategoryName || '-';

                const date = document.createElement('time');
                const createdAt = item.qnaCreatedAt ? String(item.qnaCreatedAt).substring(0, 10) : '';
                date.dateTime = createdAt;
                date.textContent = createdAt ? createdAt.replace(/-/g, '.') : '-';
                metadata.append(category, date);
                content.append(title, metadata);

                const badge = document.createElement('span');
                badge.className = 'mypage-inquiry-status';
                const statusLabels = {
                    WAITING: '답변 대기',
                    ANSWERING: '답변 중',
                    ANSWERED: '답변 완료'
                };
                const status = item.qnaStatus || 'WAITING';
                const statusClassNames = {
                    WAITING: 'waiting',
                    ANSWERING: 'answering',
                    ANSWERED: 'answered'
                };
                badge.classList.add(statusClassNames[status] || 'unknown');
                badge.textContent = statusLabels[status] || status;

                row.append(content, badge);
                return row;
            });

            rows.replaceChildren.apply(rows, renderedItems);
            renderPagination(totalPages, filteredItems.length);
        }

        async function loadInquiries() {
            showMessage('내 문의 내역을 불러오는 중입니다.', false);
            try {
                const response = await fetch(page.dataset.inquiriesApiUrl, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin'
                });

                if (response.status === 401 || response.redirected) {
                    throw new Error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
                }
                if (!response.ok) {
                    throw new Error('내 문의 내역을 불러오지 못했습니다.');
                }

                const result = await response.json();
                if (!Array.isArray(result)) {
                    throw new Error('내 문의 내역 응답 형식이 올바르지 않습니다.');
                }

                inquiryItems = result;
                currentPage = 1;
                render();
            } catch (error) {
                showMessage(error.message || '내 문의 내역을 불러오지 못했습니다.', true);
                if (pagination) pagination.replaceChildren();
                if (totalElement) totalElement.textContent = '총 0건';

                const retry = document.createElement('button');
                retry.type = 'button';
                retry.className = 'btn btn-outline-secondary btn-sm mt-2';
                retry.textContent = '다시 시도';
                retry.addEventListener('click', loadInquiries);
                const errorMessage = rows.querySelector('.mypage-inquiry-message');
                errorMessage.appendChild(document.createElement('br'));
                errorMessage.appendChild(retry);
            }
        }

        async function loadInquiryAnswers(qnaId) {
            const answerSection = document.querySelector('[data-mypage-inquiry-answer-section]');
            const answersList = document.querySelector('[data-mypage-inquiry-answers]');
            if (!answerSection || !answersList || !page.dataset.inquiryAnswersApiUrl) return;

            answerSection.hidden = false;
            const loading = document.createElement('p');
            loading.className = 'mypage-inquiry-answer-message';
            loading.textContent = '답변을 불러오는 중입니다.';
            answersList.replaceChildren(loading);

            try {
                const response = await fetch(page.dataset.inquiryAnswersApiUrl + '/' + encodeURIComponent(qnaId) + '/answers', {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin'
                });
                if (!response.ok) throw new Error('답변을 불러오지 못했습니다.');

                const answers = await response.json();
                if (!Array.isArray(answers) || answers.length === 0) {
                    const empty = document.createElement('p');
                    empty.className = 'mypage-inquiry-answer-message';
                    empty.textContent = '등록된 답변이 없습니다.';
                    answersList.replaceChildren(empty);
                    return;
                }

                const answerCards = answers.map(function (answer) {
                    const card = document.createElement('article');
                    card.className = 'mypage-inquiry-answer';
                    const header = document.createElement('div');
                    header.className = 'mypage-inquiry-answer-heading';
                    const responder = document.createElement('strong');
                    responder.textContent = '해봄 운영팀 (' + (answer.responderName || answer.responderLoginId || '관리자') + ')';
                    const date = document.createElement('time');
                    const answerDate = answer.qnaAnswerCreatedAt ? String(answer.qnaAnswerCreatedAt) : '';
                    date.dateTime = answerDate;
                    date.textContent = answerDate ? answerDate.replace('T', ' ').substring(0, 19).replace(/-/g, '.') : '';
                    header.append(responder, date);

                    const body = document.createElement('p');
                    body.className = 'mypage-inquiry-answer-content';
                    body.textContent = answer.qnaAnswerContent || '';
                    card.append(header, body);
                    return card;
                });
                answersList.replaceChildren.apply(answersList, answerCards);
            } catch (error) {
                const message = document.createElement('p');
                message.className = 'mypage-inquiry-answer-message is-error';
                message.setAttribute('role', 'alert');
                message.textContent = error.message || '답변을 불러오지 못했습니다.';
                answersList.replaceChildren(message);
            }
        }

        rows.addEventListener('click', async function (event) {
            const titleLink = event.target.closest('.mypage-inquiry-title');
            if (!titleLink) return;
            event.preventDefault();

            const row = titleLink.closest('[data-inquiry-id]');
            const selected = row && inquiryItems.find(function (item) {
                return String(item.qnaId) === row.dataset.inquiryId;
            });
            const modal = document.getElementById('mypageInquiryViewModal');
            if (!selected || !modal) return;

            let detail = selected;
            try {
                const response = await fetch(page.dataset.inquiryListApiUrl, {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin'
                });
                if (!response.ok) throw new Error('문의 상세 내용을 불러오지 못했습니다.');
                const inquiryList = await response.json();
                detail = Array.isArray(inquiryList)
                    ? inquiryList.find(function (item) { return String(item.qnaId) === String(selected.qnaId); })
                    : null;
                if (!detail) throw new Error('문의 상세 내용을 찾을 수 없습니다.');
            } catch (error) {
                toast(error.message || '문의 상세 내용을 불러오지 못했습니다.');
                return;
            }

            modal.querySelector('#mypageInquiryViewTitle').textContent = detail.qnaTitle || '(제목 없음)';
            modal.querySelector('[data-mypage-inquiry-category]').textContent = detail.qnaCategoryName || '문의';
            const date = detail.qnaCreatedAt ? String(detail.qnaCreatedAt).substring(0, 10).replace(/-/g, '.') : '-';
            modal.querySelector('[data-mypage-inquiry-date]').textContent = date;
            modal.querySelector('[data-mypage-inquiry-content]').textContent = detail.qnaContent || '';

            const statusBadge = modal.querySelector('[data-mypage-inquiry-status]');
            const statusLabels = { WAITING: '답변 대기', ANSWERING: '답변 중', ANSWERED: '답변 완료' };
            const statusClasses = {
                WAITING: 'text-bg-warning-subtle text-warning-emphasis',
                ANSWERING: 'text-bg-primary-subtle text-primary',
                ANSWERED: 'text-bg-success-subtle text-success'
            };
            const status = detail.qnaStatus || 'WAITING';
            statusBadge.className = 'badge rounded-pill ' + (statusClasses[status] || 'text-bg-secondary-subtle text-secondary');
            statusBadge.textContent = statusLabels[status] || status;

            const answerSection = modal.querySelector('[data-mypage-inquiry-answer-section]');
            const answersList = modal.querySelector('[data-mypage-inquiry-answers]');
            answerSection.hidden = status !== 'ANSWERED';
            answersList.replaceChildren();
            if (status === 'ANSWERED') loadInquiryAnswers(detail.qnaId);
            openModal('#mypageInquiryViewModal');
        });

        if (statusFilter) {
            statusFilter.addEventListener('change', function () {
                currentPage = 1;
                render();
            });
        }
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                currentPage = 1;
                render();
            });
        }

        loadInquiries();
    }

    function handleOpenPasswordChange() {
        openModal('#passwordChangeModal');
    }

    function setPasswordFieldStatus(input, statusId, message, state) {
        const status = document.getElementById(statusId);
        if (!input || !status) return;

        status.textContent = message;
        status.classList.remove('text-success', 'text-danger', 'text-muted');
        status.classList.add(state === 'valid' ? 'text-success'
            : state === 'invalid' ? 'text-danger' : 'text-muted');
        input.setAttribute('aria-invalid', String(state === 'invalid'));
    }

    function showNewPasswordGuidance() {
        const input = document.getElementById('newPassword');
        setPasswordFieldStatus(input, 'newPasswordStatus',
            '비밀번호는 8~20자로 입력해 주세요. 영문 대/소문자를 구분하며, >, <, _, -, ", \'는 사용할 수 없어요.',
            'neutral');
    }

    function validateNewPassword() {
        const input = document.getElementById('newPassword');
        if (!input) return false;

        const password = input.value;
        if (password.length === 0) {
            showNewPasswordGuidance();
            return false;
        }

        const validLength = password.length >= 8 && password.length <= 20;
        const hasForbiddenCharacter = /[><_\-"']/.test(password);
        const valid = validLength && !hasForbiddenCharacter;
        const message = !validLength ? '8~20자로 입력해 주세요.'
            : hasForbiddenCharacter ? '사용할 수 없는 특수문자(>, <, _, -, ", \')가 포함되어 있습니다.'
                : '사용 가능한 비밀번호입니다.';

        setPasswordFieldStatus(input, 'newPasswordStatus', message, valid ? 'valid' : 'invalid');
        return valid;
    }

    function showPasswordConfirmationGuidance() {
        const input = document.getElementById('confirmNewPassword');
        setPasswordFieldStatus(input, 'confirmNewPasswordStatus', '비밀번호를 다시 입력해 주세요.', 'neutral');
    }

    function validatePasswordConfirmation() {
        const passwordInput = document.getElementById('newPassword');
        const confirmInput = document.getElementById('confirmNewPassword');
        if (!passwordInput || !confirmInput) return false;

        const confirmation = confirmInput.value;
        const valid = confirmation.length > 0 && confirmation === passwordInput.value;
        const message = confirmation.length === 0 ? '비밀번호를 다시 입력해 주세요.'
            : valid ? '비밀번호가 일치합니다.' : '입력하신 비밀번호가 일치하지 않습니다. 비밀번호를 확인하세요.';

        setPasswordFieldStatus(confirmInput, 'confirmNewPasswordStatus', message,
            confirmation.length === 0 ? 'neutral' : valid ? 'valid' : 'invalid');
        return valid;
    }

    function resetPasswordFormState(form) {
        if (form) form.reset();
        ['currentPassword', 'newPassword', 'confirmNewPassword'].forEach(function (id) {
            const input = document.getElementById(id);
            if (input) input.type = 'password';
        });
        document.querySelectorAll('[data-mypage-toggle-password] .material-symbols-outlined').forEach(function (icon) {
            icon.textContent = 'visibility_off';
        });
        document.querySelectorAll('[data-mypage-toggle-password]').forEach(function (button) {
            button.setAttribute('aria-label', '비밀번호 표시');
        });
        showNewPasswordGuidance();
        showPasswordConfirmationGuidance();
    }

    function initializePasswordChangeForm() {
        const form = document.getElementById('passwordChangeForm');
        const modal = document.getElementById('passwordChangeModal');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmNewPassword');

        document.querySelectorAll('[data-mypage-toggle-password]').forEach(function (button) {
            button.addEventListener('click', function () {
                const input = document.getElementById(button.dataset.mypageTogglePassword);
                const icon = button.querySelector('.material-symbols-outlined');
                if (!input || !icon) return;

                const showPassword = input.type === 'password';
                input.type = showPassword ? 'text' : 'password';
                icon.textContent = showPassword ? 'visibility' : 'visibility_off';
                button.setAttribute('aria-label', showPassword ? '비밀번호 숨기기' : '비밀번호 표시');
            });
        });

        if (newPasswordInput) {
            newPasswordInput.addEventListener('focus', showNewPasswordGuidance);
            newPasswordInput.addEventListener('blur', validateNewPassword);
            newPasswordInput.addEventListener('input', validatePasswordConfirmation);
        }
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('focus', showPasswordConfirmationGuidance);
            confirmPasswordInput.addEventListener('blur', validatePasswordConfirmation);
        }
        if (modal && form) {
            modal.addEventListener('hidden.bs.modal', function () {
                resetPasswordFormState(form);
            });
        }
    }

    async function handlePasswordChange(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const currentPasswordInput = document.getElementById('currentPassword');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmNewPassword');
        const submitButton = form.querySelector('[data-password-submit]');
        const apiUrl = page && page.dataset.passwordChangeApiUrl;
        const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
        const password = newPasswordInput ? newPasswordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        if (!currentPassword.trim()) {
            toast('현재 비밀번호를 입력해 주세요.');
            if (currentPasswordInput) {
                currentPasswordInput.focus();
            }
            return;
        }

        if (!validateNewPassword()) {
            toast(document.getElementById('newPasswordStatus')?.textContent || '새 비밀번호를 확인해 주세요.');
            if (newPasswordInput) {
                newPasswordInput.focus();
            }
            return;
        }

        if (!validatePasswordConfirmation()) {
            toast(document.getElementById('confirmNewPasswordStatus')?.textContent || '새 비밀번호 확인이 일치하지 않습니다.');
            if (confirmPasswordInput) {
                confirmPasswordInput.focus();
            }
            return;
        }

        if (!apiUrl) {
            toast('비밀번호 변경 요청 주소를 찾을 수 없습니다.');
            return;
        }

        const body = new URLSearchParams();
        body.set('currentPassword', currentPassword);
        body.set('newPassword', password);
        body.set('passwordConfirm', confirmPassword);

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: body.toString()
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || response.redirected) {
                if (response.status === 401 || response.redirected) {
                    throw new Error('로그인이 만료되었습니다. 다시 로그인해 주세요.');
                }
                if (response.status === 400) {
                    throw new Error('현재 비밀번호를 확인하거나 입력값을 다시 확인해 주세요.');
                }
                throw new Error('비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.');
            }

            if (!result || result.changed !== true) {
                throw new Error('비밀번호 변경 결과를 확인하지 못했습니다. 다시 시도해 주세요.');
            }

            closeModal('#passwordChangeModal');
            form.reset();
            toast('비밀번호를 변경했습니다.');
        } catch (error) {
            toast(error.message || '비밀번호 변경 중 오류가 발생했습니다.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }

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
        initializePasswordChangeForm();

        document.addEventListener('click', function (event) {
            if (event.target.closest('[data-retry-completed]')) {
                loadCompletedHistory();
            }
        });
    }

    bindEvents();
    loadProfile();
    loadInProgressScenarios();
    loadCompletedHistory();
    initializeMyInquiries();
}());

