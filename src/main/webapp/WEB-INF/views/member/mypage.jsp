<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="해봄 마이페이지에서 완료한 연습과 회원 정보를 확인하세요.">
    <title>마이페이지 | 해봄</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/common.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/pages/scenario/scenario-list.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/pages/mypage.css?v=mypage-scenario-card-layout-1" rel="stylesheet">
</head>
<body class="mypage-page">
    <jsp:include page="/WEB-INF/views/common/header.jsp" />

    <main id="mypage-content"
          class="container subpage-container"
          data-profile-api-url="${pageContext.request.contextPath}/api/mypage/profile"
          data-withdraw-api-url="${pageContext.request.contextPath}/api/mypage/withdraw"
          data-password-change-api-url="${pageContext.request.contextPath}/api/mypage/password"
          data-home-url="${pageContext.request.contextPath}/"
          data-scenarios-api-url="${pageContext.request.contextPath}/api/scenario"
          data-simulation-api-url="${pageContext.request.contextPath}/api/simulation/progress"
          data-completed-history-api-url="${pageContext.request.contextPath}/api/mypage/completed-scenarios"
          data-scenario-list-url="${pageContext.request.contextPath}/scenario"
          data-simulation-url="${pageContext.request.contextPath}/simulation"
          data-inquiries-api-url="${pageContext.request.contextPath}/api/mypage/inquiries"
          data-inquiry-list-api-url="${pageContext.request.contextPath}/api/inquiries"
          data-inquiry-answers-api-url="${pageContext.request.contextPath}/api/inquiries"
          data-inquiry-board-url="${pageContext.request.contextPath}/inquiries">
        <div class="subpage-heading">
            <div class="breadcrumb-line">
                <a href="${pageContext.request.contextPath}/">홈</a>
                <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                <span>마이페이지</span>
            </div>
            <h1>마이페이지</h1>
        </div>

        <nav class="mypage-tabs" aria-label="마이페이지 메뉴">
            <button class="active" type="button" data-my-tab="overview" aria-current="page">요약</button>
            <button type="button" data-my-tab="completed">완료 내역</button>
            <button type="button" data-my-tab="inquiries">내 문의 내역</button>
            <button type="button" data-my-tab="account">계정 정보</button>
        </nav>

        <section data-my-panel="overview" aria-labelledby="overviewTitle">
            <h2 class="visually-hidden" id="overviewTitle">마이페이지 요약</h2>
            <section class="content-panel mypage-overview-placeholder" aria-label="요약 안내">
                <p>요약 정보는 준비 중입니다.</p>
            </section>
        </section>

        <section class="d-none" data-my-panel="completed" aria-labelledby="completedTitle">
            <div class="content-panel">
                <h2 class="visually-hidden" id="completedTitle">완료 내역</h2>
                <section class="mypage-completed-section" aria-labelledby="inProgressScenariosTitle">
                    <div class="mypage-completed-section-heading">
                        <h3 id="inProgressScenariosTitle">진행 중인 시나리오</h3>
                    </div>
                    <div class="scenario-catalog mypage-progress-list" data-in-progress-list>
                        <p class="scenario-empty" role="status">진행 중인 연습을 불러오는 중입니다.</p>
                    </div>
                </section>

                <section class="mypage-completed-section" aria-labelledby="completedScenariosTitle">
                    <div class="mypage-completed-section-heading">
                        <h3 id="completedScenariosTitle">완료한 시나리오</h3>
                    </div>
                    <div class="completed-history-list" data-completed-list>
                        <p class="text-secondary mb-0" role="status">완료 내역을 불러오는 중입니다.</p>
                    </div>
                </section>
            </div>
        </section>

        <section class="d-none" data-my-panel="inquiries" aria-labelledby="inquiriesTitle">
            <div class="content-panel mypage-inquiries-panel">
                <div class="panel-heading mypage-inquiries-toolbar">
                    <h2 id="inquiriesTitle">내 문의 내역</h2>
                    <div class="mypage-inquiry-controls">
                        <label class="visually-hidden" for="mypageInquiryStatus">문의 상태</label>
                        <select class="form-select form-select-sm" id="mypageInquiryStatus">
                            <option value="">전체 상태</option>
                            <option value="WAITING">답변 대기</option>
                            <option value="ANSWERING">답변 중</option>
                            <option value="ANSWERED">답변 완료</option>
                        </select>
                        <label class="visually-hidden" for="mypageInquirySearch">문의 검색</label>
                        <div class="input-group input-group-sm">
                            <span class="input-group-text" aria-hidden="true">
                                <span class="material-symbols-outlined">search</span>
                            </span>
                            <input class="form-control" id="mypageInquirySearch"
                                   type="search" placeholder="문의 검색">
                        </div>
                    </div>
                </div>

                <div class="mypage-inquiry-list" data-mypage-inquiry-rows aria-live="polite">
                    <p class="mypage-inquiry-message" role="status">내 문의 내역을 불러오는 중입니다.</p>
                </div>

                <div class="table-footer mypage-inquiry-footer">
                    <span data-mypage-inquiry-total>총 0건</span>
                    <nav aria-label="내 문의 페이지">
                        <ul class="pagination pagination-sm mb-0" data-mypage-inquiry-pagination></ul>
                    </nav>
                </div>
            </div>
        </section>

        <section class="d-none" data-my-panel="account" aria-labelledby="accountTitle">
            <div class="content-panel">
                <div class="panel-heading">
                    <div>
                        <h2 id="accountTitle">계정 정보</h2>
                    </div>
                </div>

                <dl class="account-list">
                    <div>
                        <dt>이름</dt>
                        <dd data-profile-name>불러오는 중</dd>
                    </div>
                    <div>
                        <dt>아이디</dt>
                        <dd data-profile-login-id>불러오는 중</dd>
                    </div>
                    <div>
                        <dt>비밀번호</dt>
                        <dd>
                            <button class="btn btn-outline-primary btn-sm rounded-pill" type="button" data-open-password-change>
                                비밀번호 수정
                            </button>
                        </dd>
                    </div>
                    <div>
                        <dt>이메일</dt>
                        <dd data-profile-email>불러오는 중</dd>
                    </div>
                    <div>
                        <dt>생년월일</dt>
                        <dd data-profile-birth-date>불러오는 중</dd>
                    </div>
                    <div>
                        <dt>성별</dt>
                        <dd data-profile-gender>불러오는 중</dd>
                    </div>
                    <div>
                        <dt>가입일</dt>
                        <dd data-profile-created-at>불러오는 중</dd>
                    </div>
                </dl>

                <div class="account-actions">
                    <div>
                        <strong>회원 탈퇴</strong>
                        <p>탈퇴하면 계정과 서비스 이용이 제한됩니다.</p>
                    </div>
                    <button class="btn btn-outline-danger rounded-pill" type="button" data-delete-account>
                        회원 탈퇴
                    </button>
                </div>
            </div>
        </section>

        <p class="small text-secondary mt-3" data-mypage-status role="status" aria-live="polite"></p>
    </main>

    <div class="modal" id="passwordChangeModal" tabindex="-1" aria-labelledby="passwordChangeTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <form id="passwordChangeForm">
                    <div class="modal-header">
                        <h2 class="modal-title fs-5" id="passwordChangeTitle">비밀번호 변경</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
                    </div>
                    <div class="modal-body">
                        <label class="form-label" for="currentPassword">현재 비밀번호</label>
                        <input class="form-control mb-3" id="currentPassword" name="currentPassword" type="password" autocomplete="current-password" required>
                        <label class="form-label" for="newPassword">새 비밀번호</label>
                        <input class="form-control mb-3" id="newPassword" name="newPassword" type="password" autocomplete="new-password" minlength="8" maxlength="20" required>
                        <label class="form-label" for="confirmNewPassword">새 비밀번호 확인</label>
                        <input class="form-control" id="confirmNewPassword" name="passwordConfirm" type="password" autocomplete="new-password" minlength="8" maxlength="20" required>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline-secondary rounded-pill" type="button" data-bs-dismiss="modal">취소</button>
                        <button class="btn btn-primary rounded-pill" type="submit" data-password-submit>변경</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="deleteAccountTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title fs-5" id="deleteAccountTitle">회원 탈퇴</h2>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning" role="alert">
                        탈퇴하면 기존 계정을 복구할 수 없습니다.
                    </div>
                    <label class="form-label" for="withdrawConfirmText">
                        계속하려면 <strong>회원 탈퇴</strong>를 입력해 주세요.
                    </label>
                    <input class="form-control" id="withdrawConfirmText" type="text"
                           autocomplete="off" aria-describedby="withdrawConfirmHelp">
                    <div class="form-text" id="withdrawConfirmHelp">
                        입력값이 정확히 일치해야 회원 탈퇴 버튼이 활성화됩니다.
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline-secondary rounded-pill" type="button" data-bs-dismiss="modal">취소</button>
                    <button class="btn btn-danger rounded-pill" type="button" data-confirm-delete disabled>회원 탈퇴</button>
                </div>
            </div>
        </div>
    </div>

    <jsp:include page="/WEB-INF/views/common/footer.jsp" />
    <template id="mypageProgressScenarioTemplate">
        <article class="scenario-card scenario-item">
            <div class="scenario-card-icon" aria-hidden="true">
                <i class="bi bi-house-door"></i>
            </div>
            <div class="scenario-card-content">
                <div class="scenario-card-labels">
                    <span class="badge rounded-pill text-bg-primary-subtle text-primary" data-progress-category></span>
                    <span class="scenario-state" data-progress-status></span>
                </div>
                <h3 data-progress-title></h3>
                <p data-progress-description></p>
                <div class="scenario-meta">
                    <span data-progress-step-count></span>
                    <span data-progress-estimated-time></span>
                    <span>연습용 · 실제 접수되지 않아요</span>
                </div>
                <div class="scenario-progress">
                    <div class="d-flex justify-content-between small">
                        <span data-progress-caption>진행 중인 연습</span>
                        <strong data-progress-percent></strong>
                    </div>
                    <div class="progress mt-2" role="progressbar" aria-label="시나리오 진행률"
                         aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                        <div class="progress-bar" data-progress-bar></div>
                    </div>
                </div>
            </div>
            <div class="scenario-actions">
                <button class="btn btn-primary rounded-pill" type="button" data-progress-continue>이어하기</button>
                <button class="btn btn-outline-primary rounded-pill" type="button" data-progress-restart>처음부터 하기</button>
                <button class="btn btn-outline-danger rounded-pill" type="button" data-progress-delete>진행 내용 삭제</button>
            </div>
        </article>
    </template>
    <div class="modal fade" id="mypageInquiryViewModal" tabindex="-1"
         aria-labelledby="mypageInquiryViewTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div class="modal-header pt-4 px-4 pb-2 border-bottom-0">
                    <div>
                        <span class="badge text-bg-primary-subtle text-primary mb-1" data-mypage-inquiry-category></span>
                        <h2 class="modal-title fs-5 fw-bold" id="mypageInquiryViewTitle"></h2>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
                </div>
                <div class="modal-body px-4 py-3">
                    <div class="d-flex align-items-center gap-3 text-secondary small pb-3 border-bottom mb-3">
                        <span>등록일: <strong data-mypage-inquiry-date></strong></span>
                        <span>답변 상태: <span class="badge rounded-pill" data-mypage-inquiry-status></span></span>
                    </div>
                    <div class="mb-4">
                        <h3 class="h6 fw-bold text-dark mb-2"><i class="bi bi-question-circle-fill text-primary me-1"></i>내 문의 내용</h3>
                        <div class="p-3 bg-light rounded-3 text-secondary mypage-inquiry-detail-content"
                             data-mypage-inquiry-content></div>
                    </div>
                    <section data-mypage-inquiry-answer-section hidden>
                        <h3 class="h6 fw-bold text-dark mb-2"><i class="bi bi-reply-fill text-success me-1"></i>관리자 답변</h3>
                        <div class="d-flex flex-column gap-2" data-mypage-inquiry-answers></div>
                    </section>
                </div>
                <div class="modal-footer px-4 pb-4 pt-2 border-top-0 justify-content-end">
                    <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">닫기</button>
                </div>
            </div>
        </div>
    </div>

    <script src="${pageContext.request.contextPath}/js/pages/mypage.js?v=mypage-completed-review-basic-info-1"></script>
</body>
</html>

