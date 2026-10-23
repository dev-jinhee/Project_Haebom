<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<!-- [해봄 공통 Bootstrap 5.3 모달 (modal.jsp)] -->

<!-- 1. 알림/경고 모달 (Alert / Warn - 확인 버튼 1개) -->
<div class="modal fade" id="hbAlertModal" tabindex="-1" aria-labelledby="hbAlertTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header border-bottom-0 pt-4 px-4 pb-2">
                <div class="d-flex align-items-center gap-2">
                    <span id="hbAlertIconWrap">
                        <i id="hbAlertIcon" class="bi bi-exclamation-triangle-fill text-warning fs-3"></i>
                    </span>
                    <h5 class="modal-title fw-bold text-dark mb-0" id="hbAlertTitle">입력 확인</h5>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
            </div>
            <div class="modal-body px-4 py-2 text-secondary" id="hbAlertMessage" style="font-size: 15px; line-height: 1.6; white-space: pre-line;">
                <!-- 메시지 내용 -->
            </div>
            <div class="modal-footer border-top-0 pb-4 px-4 pt-3">
                <button type="button" class="btn btn-primary px-4 rounded-pill fw-semibold" id="hbAlertOkBtn" data-bs-dismiss="modal">확인</button>
            </div>
        </div>
    </div>
</div>

<!-- 2. 확인 모달 (Confirm - 취소/확인 버튼 2개) -->
<div class="modal fade" id="hbConfirmModal" tabindex="-1" aria-labelledby="hbConfirmTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header border-bottom-0 pt-4 px-4 pb-2">
                <div class="d-flex align-items-center gap-2">
                    <span id="hbConfirmIconWrap">
                        <i class="bi bi-question-circle-fill text-primary fs-3"></i>
                    </span>
                    <h5 class="modal-title fw-bold text-dark mb-0" id="hbConfirmTitle">확인</h5>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
            </div>
            <div class="modal-body px-4 py-2 text-secondary" id="hbConfirmMessage" style="font-size: 15px; line-height: 1.6; white-space: pre-line;">
                <!-- 확인 내용 -->
            </div>
            <div class="modal-footer border-top-0 pb-4 px-4 pt-3 d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary px-3 rounded-pill" id="hbConfirmCancelBtn" data-bs-dismiss="modal">취소</button>
                <button type="button" class="btn btn-primary px-4 rounded-pill fw-semibold" id="hbConfirmOkBtn" data-bs-dismiss="modal">확인</button>
            </div>
        </div>
    </div>
</div>

<!-- 3. 공통 토스트 알림 (Toast - window.Haebom.toast 연동) -->
<div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;">
    <div id="siteToast" class="toast align-items-center text-bg-dark border-0 shadow-lg rounded-3" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body py-2 px-3 fs-6 d-flex align-items-center gap-2">
                <i class="bi bi-info-circle-fill text-info"></i>
                <span id="toastMessage"></span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="닫기"></button>
        </div>
    </div>
</div>
