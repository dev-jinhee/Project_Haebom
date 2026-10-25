export function initIdAvailability(page, showNotice) {
    const idField = document.getElementById('signupId');
    const idStatus = document.getElementById('signupIdCheckStatus');
    const idCheckButton = document.querySelector('[data-check-id]');
    let checkedLoginId = null;

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
                showNotice('아이디는 4~16자의 영문 대소문자와 숫자로 입력해 주세요.');
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
                showNotice(result.available
                    ? '사용할 수 있는 아이디입니다.'
                    : '이미 사용 중인 아이디입니다.');
            } catch (error) {
                checkedLoginId = null;
                if (idStatus !== null) {
                    idStatus.textContent = '';
                    idStatus.classList.remove('text-success', 'text-danger', 'text-muted');
                }
                showNotice(error.message
                    || '중복확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
            } finally {
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
            if (idStatus !== null) {
                idStatus.textContent = '아이디 중복확인을 해주세요.';
                idStatus.classList.remove('text-success', 'text-muted');
                idStatus.classList.add('text-danger');
            }
            if (idField !== null) idField.focus();
        },
        clear: function () {
            checkedLoginId = null;
            if (idStatus !== null) {
                idStatus.textContent = '';
                idStatus.classList.remove('text-success', 'text-danger');
            }
        }
    };
}
