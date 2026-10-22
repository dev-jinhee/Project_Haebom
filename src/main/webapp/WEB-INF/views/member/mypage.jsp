<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="해봄 마이페이지에서 회원 정보와 연습 진행 내역을 확인하세요.">
    <title>마이페이지 | 해봄</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/common.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/pages/mypage.css" rel="stylesheet">
</head>
<body class="mypage-page">
    <jsp:include page="/WEB-INF/views/common/header.jsp" />

    <main id="mypage-content"
          class="container subpage-container"
          data-profile-api-url="${pageContext.request.contextPath}/api/mypage/profile"
          data-progress-api-url="${pageContext.request.contextPath}/api/mypage/progress">
        <div class="subpage-heading">
            <div class="breadcrumb-line">
                <a href="${pageContext.request.contextPath}/">홈</a>
                <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                <span>마이페이지</span>
            </div>
            <h1>마이페이지</h1>
            <p>회원 정보와 행정절차 연습 진행 상황을 확인할 수 있어요.</p>
        </div>

        <section class="profile-banner" aria-labelledby="profileName">
            <span class="stat-icon" aria-hidden="true">
                <span class="material-symbols-outlined" aria-hidden="true">person</span>
            </span>
            <div>
                <span class="eyebrow">MY PROFILE</span>
                <h2 id="profileName" data-profile-name>회원 정보를 불러오는 중입니다</h2>
                <p data-profile-email>이메일 정보를 불러오는 중입니다</p>
            </div>
        </section>

        <nav class="mypage-tabs" aria-label="마이페이지 메뉴">
            <button class="active" type="button" data-my-tab="overview" aria-current="page">요약</button>
            <button type="button" data-my-tab="progress">연습 진행</button>
            <button type="button" data-my-tab="inquiries">문의 내역</button>
            <button type="button" data-my-tab="account">계정 정보</button>
        </nav>

        <section data-my-panel="overview" aria-labelledby="overviewTitle">
            <h2 class="visually-hidden" id="overviewTitle">마이페이지 요약</h2>

            <div class="row g-3 mypage-stats mb-4">
                <div class="col-12 col-md-4">
                    <article class="stat-card">
                        <span class="stat-icon"><span class="material-symbols-outlined" aria-hidden="true">play_circle</span></span>
                        <span>진행 중인 연습<strong data-stat-in-progress>불러오는 중</strong></span>
                    </article>
                </div>
                <div class="col-12 col-md-4">
                    <article class="stat-card">
                        <span class="stat-icon success"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span></span>
                        <span>완료한 연습<strong data-stat-completed>불러오는 중</strong></span>
                    </article>
                </div>
                <div class="col-12 col-md-4">
                    <article class="stat-card">
                        <span class="stat-icon violet"><span class="material-symbols-outlined" aria-hidden="true">menu_book</span></span>
                        <span>전체 연습<strong data-stat-total>불러오는 중</strong></span>
                    </article>
                </div>
            </div>

            <section class="content-panel" aria-labelledby="recentProgressTitle">
                <div class="panel-heading">
                    <div>
                        <h2 id="recentProgressTitle">최근 연습</h2>
                        <p>최근에 진행한 행정절차 연습을 확인해 보세요.</p>
                    </div>
                    <button class="btn btn-outline-primary btn-sm rounded-pill" type="button" data-my-tab="progress">
                        전체 진행 내역
                    </button>
                </div>
                <div data-recent-progress>
                    <p class="text-secondary mb-0" role="status">진행 내역을 불러오는 중입니다.</p>
                </div>
            </section>
        </section>

        <section class="d-none" data-my-panel="progress" aria-labelledby="progressTitle">
            <div class="content-panel">
                <div class="panel-heading">
                    <div>
                        <h2 id="progressTitle">연습 진행 내역</h2>
                        <p>시나리오별 진행 상태와 최근 활동을 확인할 수 있어요.</p>
                    </div>
                    <label class="visually-hidden" for="historyFilter">진행 내역 필터</label>
                    <select class="form-select form-select-sm history-filter" id="historyFilter">
                        <option value="ALL">전체 내역</option>
                        <option value="IN_PROGRESS">진행 중</option>
                        <option value="COMPLETED">완료</option>
                    </select>
                </div>
                <div data-progress-list>
                    <p class="text-secondary mb-0" role="status">진행 내역을 불러오는 중입니다.</p>
                </div>
            </div>
        </section>

        <section class="d-none" data-my-panel="inquiries" aria-labelledby="inquiriesTitle">
            <div class="content-panel">
                <div class="panel-heading">
                    <div>
                        <h2 id="inquiriesTitle">문의 내역</h2>
                        <p>문의한 내용과 답변 상태를 확인할 수 있어요.</p>
                    </div>
                    <a class="btn btn-outline-primary btn-sm rounded-pill" href="${pageContext.request.contextPath}/inquiries">
                        문의 게시판
                    </a>
                </div>
                <div class="mypage-inquiry-summary" data-inquiry-summary>
                    <div><span class="inquiry-status-dot"></span><span><strong>답변 대기</strong><small data-inquiry-waiting>불러오는 중</small></span></div>
                    <div><span class="inquiry-status-dot answered"></span><span><strong>답변 완료</strong><small data-inquiry-answered>불러오는 중</small></span></div>
                </div>
                <div class="mypage-inquiry-list mt-3" data-inquiry-list>
                    <p class="text-secondary mb-0 p-3" role="status">문의 내역을 불러오는 중입니다.</p>
                </div>
            </div>
        </section>

        <section class="d-none" data-my-panel="account" aria-labelledby="accountTitle">
            <div class="content-panel">
                <div class="panel-heading">
                    <div>
                        <h2 id="accountTitle">계정 정보</h2>
                        <p>회원 정보와 계정 보안 설정을 관리할 수 있어요.</p>
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
                        <dt>이메일</dt>
                        <dd data-profile-email>불러오는 중</dd>
                    </div>
                    <div>
                        <dt>가입일</dt>
                        <dd data-profile-created-at>불러오는 중</dd>
                    </div>
                </dl>

                <div class="d-flex flex-wrap gap-2 mt-3">
                    <button class="btn btn-outline-primary rounded-pill" type="button" data-open-email-change>
                        이메일 변경
                    </button>
                    <button class="btn btn-outline-primary rounded-pill" type="button" data-open-password-change>
                        비밀번호 변경
                    </button>
                </div>

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

    <div class="modal fade" id="emailChangeModal" tabindex="-1" aria-labelledby="emailChangeTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <form id="emailChangeForm">
                    <div class="modal-header">
                        <h2 class="modal-title fs-5" id="emailChangeTitle">이메일 변경</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
                    </div>
                    <div class="modal-body">
                        <label class="form-label" for="currentEmail">현재 이메일</label>
                        <input class="form-control mb-3" id="currentEmail" type="email" readonly>
                        <label class="form-label" for="newEmail">새 이메일</label>
                        <input class="form-control" id="newEmail" type="email" autocomplete="email" required>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline-secondary rounded-pill" type="button" data-bs-dismiss="modal">취소</button>
                        <button class="btn btn-primary rounded-pill" type="submit">변경</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="modal fade" id="passwordChangeModal" tabindex="-1" aria-labelledby="passwordChangeTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <form id="passwordChangeForm">
                    <div class="modal-header">
                        <h2 class="modal-title fs-5" id="passwordChangeTitle">비밀번호 변경</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
                    </div>
                    <div class="modal-body">
                        <label class="form-label" for="currentPassword">현재 비밀번호</label>
                        <input class="form-control mb-3" id="currentPassword" type="password" autocomplete="current-password" required>
                        <label class="form-label" for="newPassword">새 비밀번호</label>
                        <input class="form-control mb-3" id="newPassword" type="password" autocomplete="new-password" minlength="8" required>
                        <label class="form-label" for="confirmNewPassword">새 비밀번호 확인</label>
                        <input class="form-control" id="confirmNewPassword" type="password" autocomplete="new-password" minlength="8" required>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline-secondary rounded-pill" type="button" data-bs-dismiss="modal">취소</button>
                        <button class="btn btn-primary rounded-pill" type="submit">변경</button>
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
                    탈퇴를 진행하면 계정으로 다시 로그인할 수 없습니다. 정말 탈퇴하시겠어요?
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline-secondary rounded-pill" type="button" data-bs-dismiss="modal">취소</button>
                    <button class="btn btn-danger rounded-pill" type="button" data-confirm-delete>탈퇴하기</button>
                </div>
            </div>
        </div>
    </div>

    <jsp:include page="/WEB-INF/views/common/footer.jsp" />
    <script src="${pageContext.request.contextPath}/js/pages/mypage.js"></script>
</body>
</html>

