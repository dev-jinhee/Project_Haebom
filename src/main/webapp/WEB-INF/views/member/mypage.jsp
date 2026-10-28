<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="해봄 마이페이지에서 완료한 연습과 회원 정보를 확인하세요.">
    <title>마이페이지 | 해봄</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/common.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/pages/mypage.css?v=mypage-completed-history-1" rel="stylesheet">
</head>
<body class="mypage-page">
    <jsp:include page="/WEB-INF/views/common/header.jsp" />

    <main id="mypage-content"
          class="container subpage-container"
          data-profile-api-url="${pageContext.request.contextPath}/api/mypage/profile"
          data-withdraw-api-url="${pageContext.request.contextPath}/api/mypage/withdraw"
          data-home-url="${pageContext.request.contextPath}/"
          data-scenarios-api-url="${pageContext.request.contextPath}/api/scenario"
          data-scenario-list-url="${pageContext.request.contextPath}/scenario"
          data-simulation-url="${pageContext.request.contextPath}/simulation">
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
            <button type="button" data-my-tab="inquiries">문의 내역</button>
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
                <div class="panel-heading">
                    <div>
                        <h2 id="completedTitle">완료 내역</h2>
                    </div>
                </div>
                <div class="completed-history-list" data-completed-list>
                    <p class="text-secondary mb-0" role="status">완료 내역을 불러오는 중입니다.</p>
                </div>
            </div>
        </section>

        <section class="d-none" data-my-panel="inquiries" aria-labelledby="inquiriesTitle">
            <div class="content-panel">
                <div class="panel-heading">
                    <div>
                        <h2 id="inquiriesTitle">문의 내역</h2>
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
                    <p class="text-secondary mb-0 py-3" role="status">문의 내역을 불러오는 중입니다.</p>
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
    <script src="${pageContext.request.contextPath}/js/pages/mypage.js?v=mypage-withdraw-confirm-1"></script>
</body>
</html>

