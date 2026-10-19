/**
 * ========================================================
 * [해봄(HaeBom) 공통 자바스크립트 - common.js]
 * Bootstrap 5.3 기반 통합 유틸리티 및 모달 함수
 * ========================================================
 */

/**
 * 1. 공통 알림 모달 (haebomAlert)
 * Bootstrap 5.3 Modal API를 사용하여 알림 모달을 띄웁니다.
 * 
 * @param {string} message 알림 내용 (줄바꿈 \n 지원)
 * @param {string} [title="알림"] 모달 제목
 * @param {function} [callback] 모달이 닫힌 후 실행할 함수
 * @param {string} [type="info"] 아이콘 유형 ('warn' | 'info' | 'success')
 */
function haebomAlert(message, title, callback, type) {
    const modalEl = document.getElementById("hbAlertModal");
    if (!modalEl || typeof bootstrap === "undefined") {
        alert(message);
        if (typeof callback === "function") callback();
        return;
    }

    const titleEl = document.getElementById("hbAlertTitle");
    const messageEl = document.getElementById("hbAlertMessage");
    const iconEl = document.getElementById("hbAlertIcon");

    const iconType = type || (title && (title.includes("경고") || title.includes("확인") || title.includes("오류") || title.includes("누락")) ? "warn" : "info");

    if (titleEl) titleEl.textContent = title || "알림";
    if (messageEl) messageEl.textContent = message || "";

    if (iconEl) {
        if (iconType === "warn") {
            iconEl.className = "bi bi-exclamation-triangle-fill text-warning fs-3";
        } else if (iconType === "success") {
            iconEl.className = "bi bi-check-circle-fill text-success fs-3";
        } else {
            iconEl.className = "bi bi-info-circle-fill text-primary fs-3";
        }
    }

    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);

    // 모달이 완전히 닫힌 후 콜백 실행
    const handleHidden = function () {
        modalEl.removeEventListener("hidden.bs.modal", handleHidden);
        if (typeof callback === "function") {
            callback();
        }
    };

    modalEl.addEventListener("hidden.bs.modal", handleHidden);
    bsModal.show();
}

/**
 * 2. 공통 경고 모달 (haebomWarn - 입력 누락, 유효성 검사 실패 시 사용)
 * 모달 확인 후 해당 입력 필드로 자동 포커스 이동 및 강조 효과 적용
 * 
 * @param {string} message 경고 내용
 * @param {string|HTMLElement} [targetSelector] 포커스할 입력 요소 (#inputId 또는 element)
 * @param {string} [title="입력 확인"] 모달 제목
 */
function haebomWarn(message, targetSelector, title) {
    haebomAlert(message, title || "입력 확인", function () {
        if (targetSelector) {
            const el = typeof targetSelector === "string" ? document.querySelector(targetSelector) : targetSelector;
            if (el && typeof el.focus === "function") {
                el.focus();
                // 일시적인 포커스 강조 효과
                el.classList.add("is-invalid");
                setTimeout(() => {
                    el.classList.remove("is-invalid");
                }, 2000);
            }
        }
    }, "warn");
}

/**
 * 3. 공통 확인 모달 (haebomConfirm)
 * [확인]을 누르면 onConfirm, [취소/닫기]를 누르면 onCancel 실행
 * 
 * @param {string} message 질문 내용
 * @param {function} onConfirm [확인] 클릭 시 실행할 함수
 * @param {function} [onCancel] [취소/닫기] 시 실행할 함수
 * @param {string} [title="확인"] 모달 제목
 */
function haebomConfirm(message, onConfirm, onCancel, title) {
    const modalEl = document.getElementById("hbConfirmModal");
    if (!modalEl || typeof bootstrap === "undefined") {
        if (confirm(message)) {
            if (typeof onConfirm === "function") onConfirm();
        } else {
            if (typeof onCancel === "function") onCancel();
        }
        return;
    }

    const titleEl = document.getElementById("hbConfirmTitle");
    const messageEl = document.getElementById("hbConfirmMessage");
    const okBtn = document.getElementById("hbConfirmOkBtn");

    if (titleEl) titleEl.textContent = title || "확인";
    if (messageEl) messageEl.textContent = message || "";

    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    let isConfirmed = false;

    const handleOk = function () {
        isConfirmed = true;
    };

    const handleHidden = function () {
        okBtn.removeEventListener("click", handleOk);
        modalEl.removeEventListener("hidden.bs.modal", handleHidden);

        if (isConfirmed) {
            if (typeof onConfirm === "function") onConfirm();
        } else {
            if (typeof onCancel === "function") onCancel();
        }
    };

    okBtn.addEventListener("click", handleOk);
    modalEl.addEventListener("hidden.bs.modal", handleHidden);
    bsModal.show();
}
