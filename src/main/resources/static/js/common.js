/**
 * ========================================================
 * [해봄(HaeBom) 통합 공통 스크립트 - common.js]
 * 0. 전역 보안 (CSRF 토큰 자동 주입 Fetch 인터셉터)
 * 1. 피그마 app.js 기능 (토스트 팝업, 글자 크기 설정, 시뮬레이션 세션 관리)
 * 2. 해봄 Bootstrap 5.3 모달 (haebomAlert, haebomWarn, haebomConfirm)
 * ========================================================
 */

// ----------------------------------------------------
// 0. [전역 보안] CSRF 토큰 자동 주입 Fetch 인터셉터
// - POST / PUT / DELETE / PATCH 등 상태 변경 비동기 요청 시
// - Spring Security CSRF 토큰(X-CSRF-TOKEN)을 헤더에 자동 탑재
// ----------------------------------------------------
(() => {
  const originalFetch = window.fetch;
  if (!originalFetch) return;

  window.fetch = function(input, init = {}) {
    const method = (init.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const token = document.querySelector('meta[name="_csrf"]')?.content
                 || window._csrf?.token
                 || document.getElementById('csrfToken')?.value
                 || (document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/) || [])[1];

      const headerName = document.querySelector('meta[name="_csrf_header"]')?.content
                      || window._csrf?.headerName
                      || 'X-CSRF-TOKEN';

      if (token) {
        if (!init.headers) {
          init.headers = {};
        }

        if (init.headers instanceof Headers) {
          if (!init.headers.has(headerName)) {
            init.headers.set(headerName, decodeURIComponent(token));
          }
        } else if (Array.isArray(init.headers)) {
          const exists = init.headers.some(([k]) => k.toLowerCase() === headerName.toLowerCase());
          if (!exists) {
            init.headers.push([headerName, decodeURIComponent(token)]);
          }
        } else {
          // 일반 객체
          const exists = Object.keys(init.headers).some(k => k.toLowerCase() === headerName.toLowerCase());
          if (!exists) {
            init.headers[headerName] = decodeURIComponent(token);
          }
        }
      }
    }
    return originalFetch.call(this, input, init);
  };
})();

(() => {
  // ----------------------------------------------------
  // 1. 시뮬레이션 임시 저장 데이터 보존 기간(30일) 관리
  // ----------------------------------------------------
  const savedSimulationKey = 'ongyeol-sim-saved';
  const simulationRetentionMs = 30 * 24 * 60 * 60 * 1000;
  try {
    const savedSimulation = JSON.parse(localStorage.getItem(savedSimulationKey) || 'null');
    if (savedSimulation) {
      if (Number.isFinite(savedSimulation.savedAt) && Date.now() - savedSimulation.savedAt >= simulationRetentionMs) {
        localStorage.removeItem(savedSimulationKey);
        localStorage.removeItem('ongyeol-last-scenario-progress');
      } else if (!Number.isFinite(savedSimulation.savedAt)) {
        savedSimulation.savedAt = Date.now();
        localStorage.setItem(savedSimulationKey, JSON.stringify(savedSimulation));
      }
    }
  } catch (_) {
    localStorage.removeItem(savedSimulationKey);
    localStorage.removeItem('ongyeol-last-scenario-progress');
  }

  // ----------------------------------------------------
  // 2. 전역 토스트(Toast) 팝업 알림 (window.Haebom.toast)
  // ----------------------------------------------------
  const toast = (message) => {
    const node = document.getElementById('siteToast');
    const label = document.getElementById('toastMessage');
    if (!node || !window.bootstrap) {
      if (typeof haebomAlert === 'function') {
        haebomAlert(message);
      } else {
        alert(message);
      }
      return;
    }
    if (label) label.textContent = message;
    bootstrap.Toast.getOrCreateInstance(node, { delay: 2800 }).show();
  };

  window.Haebom = window.Haebom || {};
  window.Haebom.toast = toast;

  // ----------------------------------------------------
  // 3. 전역 글자 크기 조절 (보통 / 크게 / 가장 크게)
  // ----------------------------------------------------
  const initTextSize = () => {
    const savedTextSize = localStorage.getItem('ongyeol-text-size');
    let textSize = ['normal', 'large', 'larger', 'largest'].includes(savedTextSize)
      ? savedTextSize
      : (localStorage.getItem('ongyeol-access-mode') === 'on' || localStorage.getItem('ongyeol-mode') === 'easy' || savedTextSize === 'large')
        ? 'large'
        : 'normal';

    const renderTextSize = () => {
      document.documentElement.dataset.textSize = textSize;
      if (document.body) {
        document.body.classList.toggle('large-text-mode', textSize !== 'normal');
      }
      document.querySelectorAll('[data-mode-label]').forEach((label) => {
        const labelMap = {
          'normal': '보통',
          'large': '크게',
          'larger': '더 크게',
          'largest': '가장 크게'
        };
        label.textContent = labelMap[textSize] || '보통';
      });
      document.querySelectorAll('[data-text-size]').forEach((option) => {
        const selected = option.dataset.textSize === textSize;
        option.classList.toggle('active', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
    };

    renderTextSize();

    document.querySelectorAll('[data-text-size]').forEach((button) => {
      button.addEventListener('click', () => {
        textSize = button.dataset.textSize;
        localStorage.setItem('ongyeol-text-size', textSize);
        localStorage.removeItem('ongyeol-access-mode');
        localStorage.removeItem('ongyeol-mode');
        renderTextSize();
      });
    });
  };

  // ----------------------------------------------------
  // 4. 데모 세션 & 이메일 프로필 바인딩
  // ----------------------------------------------------
  const initDemoProfiles = () => {
    const isAdmin = localStorage.getItem('ongyeol-demo-role') === 'admin';
    document.querySelectorAll('[data-admin-entry]').forEach((entry) => entry.classList.toggle('d-none', !isAdmin));
    const savedSignupEmail = localStorage.getItem('ongyeol-demo-email');
    if (savedSignupEmail) {
      document.querySelectorAll('[data-profile-email]').forEach((node) => { node.textContent = savedSignupEmail; });
    }
    const currentEmailInput = document.getElementById('currentEmail');
    if (currentEmailInput) {
      currentEmailInput.value = savedSignupEmail || document.querySelector('[data-profile-email]')?.textContent.trim() || '';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTextSize();
      initDemoProfiles();
    });
  } else {
    initTextSize();
    initDemoProfiles();
  }
})();

// --------------------------------------------------------
// 5. 공통 알림 모달 (haebomAlert) - Bootstrap 5.3
// --------------------------------------------------------
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

  const handleHidden = function () {
    modalEl.removeEventListener("hidden.bs.modal", handleHidden);
    if (typeof callback === "function") {
      callback();
    }
  };

  modalEl.addEventListener("hidden.bs.modal", handleHidden);
  bsModal.show();
}

// --------------------------------------------------------
// 6. 공통 경고 모달 (haebomWarn - 유효성 검사 실패 시 포커스 이동)
// --------------------------------------------------------
function haebomWarn(message, targetSelector, title) {
  haebomAlert(message, title || "입력 확인", function () {
    if (targetSelector) {
      const el = typeof targetSelector === "string" ? document.querySelector(targetSelector) : targetSelector;
      if (el && typeof el.focus === "function") {
        el.focus();
        el.classList.add("is-invalid");
        setTimeout(() => {
          el.classList.remove("is-invalid");
        }, 2000);
      }
    }
  }, "warn");
}

// --------------------------------------------------------
// 7. 공통 확인 모달 (haebomConfirm)
// --------------------------------------------------------
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

// ========================================================
// 8. [공통 유틸리티] 루시(Lucy) 치환 텍스트 디코더 (decodeHtml)
// - 루시 필터에 의해 DB에 &#39;, &lt;, &gt; 등으로 저장된 텍스트를
// - 화면(textContent 등)에 원래 문자(' ', < >) 모양으로 깨끗하게 복원
// ========================================================
function decodeHtml(str) {
	if (!str) return '';
	const txt = document.createElement('textarea');
	txt.innerHTML = str;
	return txt.value;
}

// 전역 등록 (어느 페이지에서나 바로 호출 가능!)
window.decodeHtml = decodeHtml;