/* 해봄 공통 로딩 컴포넌트: 다른 페이지에서도 재사용 */
(() => {
    "use strict";

    const DEFAULT_TITLE = "잠시만 기다려 주세요";
    const DEFAULT_DESCRIPTION = "요청하신 작업을 처리하고 있습니다.";
    const SHOW_DELAY_MS = 180;

    let activeCount = 0;
    let showTimer = null;
    let overlay = null;
    let titleElement = null;
    let descriptionElement = null;
    let busyMain = null;
    let previousBusy = null;

    function ensureOverlay() {
        if (overlay && document.body.contains(overlay)) return;

        overlay = document.createElement("div");
        overlay.id = "hbGlobalLoading";
        overlay.className = "hb-loading-overlay";
        overlay.hidden = true;
        overlay.setAttribute("role", "status");
        overlay.setAttribute("aria-live", "polite");
        overlay.setAttribute("aria-atomic", "true");

        // 정적인 마크업만 생성하고, 전달받은 문구는 textContent로 삽입합니다.
        overlay.innerHTML = `
            <div class="hb-loading-card">
                <span class="hb-loading-spinner" aria-hidden="true"></span>
                <strong class="hb-loading-title"></strong>
                <p class="hb-loading-description"></p>
            </div>
        `;

        titleElement = overlay.querySelector(".hb-loading-title");
        descriptionElement = overlay.querySelector(".hb-loading-description");
        document.body.appendChild(overlay);
    }

    function show(title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION) {
        ensureOverlay();
        activeCount += 1;

        titleElement.textContent = title;
        descriptionElement.textContent = description;

        if (activeCount !== 1) return;

        busyMain = document.querySelector("main");
        if (busyMain) {
            previousBusy = busyMain.getAttribute("aria-busy");
            busyMain.setAttribute("aria-busy", "true");
        }

        // 빠른 요청에 대한 불필요한 로딩 깜빡임 방지
        showTimer = window.setTimeout(() => {
            if (activeCount > 0) overlay.hidden = false;
            showTimer = null;
        }, SHOW_DELAY_MS);
    }

    function hide() {
        if (activeCount === 0) return;
        activeCount -= 1;
        if (activeCount > 0) return;

        if (showTimer !== null) {
            window.clearTimeout(showTimer);
            showTimer = null;
        }
        if (overlay) overlay.hidden = true;

        if (busyMain) {
            if (previousBusy === null) busyMain.removeAttribute("aria-busy");
            else busyMain.setAttribute("aria-busy", previousBusy);
        }
        busyMain = null;
        previousBusy = null;
    }

    async function run(operation, title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION) {
        if (typeof operation !== "function") {
            throw new TypeError("로딩을 적용할 작업은 함수여야 합니다.");
        }
        show(title, description);
        try {
            return await operation();
        } finally {
            hide();
        }
    }

    window.HaebomLoading = Object.freeze({ show, hide, run });
})();
