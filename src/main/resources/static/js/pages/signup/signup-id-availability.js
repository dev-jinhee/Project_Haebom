export function initIdAvailability(page, showNotice) {
    const idField = document.getElementById('signupId');
    const idStatus = document.getElementById('signupIdCheckStatus');
    const idCheckButton = document.querySelector('[data-check-id]');
    const idFieldGroup = idField === null ? null : idField.closest('.member-signup-field');
    const csrfInput = document.getElementById('csrfToken');
    let checkedLoginId = null;
    let statusKind = null;
    let isChecking = false;
    let preserveErrorOnNextFocus = false;

    function clearStatus() {
        if (idStatus !== null) {
            idStatus.textContent = '';
            idStatus.classList.remove('text-success', 'text-danger', 'text-muted');
        }
        statusKind = null;
        if (idField !== null) idField.removeAttribute('aria-invalid');
    }

    function showStatus(message, state) {
        if (idStatus === null) return;
        idStatus.textContent = message;
        idStatus.classList.remove('text-success', 'text-danger', 'text-muted');
        idStatus.classList.add(state === 'success' ? 'text-success' : 'text-danger');
        statusKind = state;
        if (idField !== null) {
            idField.setAttribute('aria-invalid', String(state !== 'success'));
        }
    }

    function showGuidance() {
        if (idStatus === null || statusKind === 'success') return;
        if (statusKind === 'error' && preserveErrorOnNextFocus) {
            preserveErrorOnNextFocus = false;
            return;
        }

        idStatus.textContent = '아이디는 4~16자로 입력해 주세요.';
        idStatus.classList.remove('text-success', 'text-danger');
        idStatus.classList.add('text-muted');
        if (statusKind !== 'error') statusKind = 'guidance';
        if (idField !== null) idField.setAttribute('aria-invalid', 'false');
    }

    function focusIdPreservingError() {
        if (idField === null || document.activeElement === idField) return;
        preserveErrorOnNextFocus = true;
        idField.focus();
    }

    showGuidance();

    if (idField !== null) {
        idField.addEventListener('focus', showGuidance);
        idField.addEventListener('input', function () {
            checkedLoginId = null;
            clearStatus();
            if (document.activeElement === idField) showGuidance();
        });
    }

    if (idFieldGroup !== null && idField !== null) {
        idFieldGroup.addEventListener('focusout', function () {
            window.setTimeout(function () {
                if (idFieldGroup.contains(document.activeElement) || isChecking) return;

                const loginId = idField.value.trim();
                if (loginId === '') {
                    return;
                }
                if (checkedLoginId === loginId) return;

                showStatus(/^[A-Za-z0-9]{4,16}$/.test(loginId)
                    ? '아이디 중복확인을 해주세요.'
                    : '아이디는 4~16자의 영문 대소문자와 숫자로 입력해 주세요.', 'error');
            }, 0);
        });
    }

    if (idCheckButton !== null && idField !== null) {
        idCheckButton.addEventListener('click', async function () {
            const loginId = idField.value.trim();

            if (!/^[A-Za-z0-9]{4,16}$/.test(loginId)) {
                checkedLoginId = null;
                clearStatus();
                showStatus('아이디는 4~16자의 영문 대소문자와 숫자로 입력해 주세요.', 'error');
                focusIdPreservingError();
                return;
            }

            if (csrfInput === null) {
                showNotice('보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.');
                return;
            }

            isChecking = true;
            idCheckButton.disabled = true;
            checkedLoginId = null;
            clearStatus();
            try {
                const params = new URLSearchParams();
                params.append('loginId', loginId);
                const response = await fetch(page.dataset.contextPath + '/api/members/id-availability', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfInput.value
                    },
                    body: params.toString()
                });
                const result = await response.json().catch(function () {
                    return null;
                });

                if (!response.ok || result === null
                        || typeof result.available !== 'boolean') {
                    throw new Error('중복확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                }

                // 입력 중에 응답이 도착한 경우, 이전 아이디 결과를 현재 입력란에 표시하지 않습니다.
                if (idField.value.trim() !== loginId) return;

                checkedLoginId = result.available ? loginId : null;
                if (result.available) {
                    showStatus('사용 가능한 아이디입니다.', 'success');
                } else {
                    showStatus('이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.', 'error');
                }
            } catch (error) {
                checkedLoginId = null;
                showNotice(error.message
                    || '중복확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
            } finally {
                isChecking = false;
                idCheckButton.disabled = false;
            }
        });
    }

    return {
        getValue: function () {
            return idField === null ? '' : idField.value.trim();
        },
        isChecked: function (loginId) {
            return checkedLoginId === loginId;
        },
        showRequiredMessage: function () {
            showStatus('아이디 중복확인을 해주세요.', 'error');
            focusIdPreservingError();
        },
        clear: function () {
            checkedLoginId = null;
            clearStatus();
        }
    };
}
