<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<spring:message code="signup.validation.consentRequired" var="consentRequiredMessage" />
<spring:message code="signup.validation.passwordMismatch" var="passwordMismatchMessage" />
<spring:message code="signup.idCheck.pending" var="idCheckPendingMessage" />

<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="해봄 회원가입">
    <title>회원가입 | 해봄</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/common.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/pages/signup.css?v=signup-layout-9" rel="stylesheet">
</head>
<body class="member-signup-page"
      data-context-path="${pageContext.request.contextPath}"
      data-consent-error="${consentRequiredMessage}"
      data-password-error="${passwordMismatchMessage}"
      data-id-check-message="${idCheckPendingMessage}">
<header class="member-signup-header">
    <div class="container member-signup-header-inner">
        <a class="member-signup-brand" href="${pageContext.request.contextPath}/" aria-label="해봄 홈">
            <span class="member-signup-brand-mark" aria-hidden="true"></span>
            <span><strong>해봄</strong><small>생활 행정절차 미리연습</small></span>
        </a>

        <div class="member-signup-header-actions">
            <div class="dropdown">
                <button class="member-signup-size-button dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="글씨 크기 설정">
                    <span class="material-symbols-outlined" aria-hidden="true">text_fields</span>
                    <span data-mode-label>보통</span>
                    <span class="material-symbols-outlined member-signup-size-caret" aria-hidden="true">arrow_drop_down</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-label="글씨 크기 선택">
                    <li><button class="dropdown-item active" type="button" data-text-size="normal" aria-pressed="true">보통</button></li>
                    <li><button class="dropdown-item" type="button" data-text-size="large" aria-pressed="false">크게</button></li>
                    <li><button class="dropdown-item" type="button" data-text-size="largest" aria-pressed="false">가장 크게</button></li>
                </ul>
            </div>
            <a class="member-signup-login-link" href="${pageContext.request.contextPath}/login">로그인</a>
        </div>
    </div>
</header>

<main class="container member-signup-container">
    <nav class="member-signup-breadcrumb" aria-label="현재 위치">
        <a href="${pageContext.request.contextPath}/">홈</a>
        <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        <a href="${pageContext.request.contextPath}/login">로그인</a>
        <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        <span aria-current="page">회원가입</span>
    </nav>

    <section class="member-signup-heading" aria-labelledby="signupTitle">
        <h1 id="signupTitle">회원가입</h1>
        <p>해봄 서비스를 이용하기 위한 정보를 입력해 주세요.</p>
    </section>

    <ol class="member-signup-stepper" aria-label="회원가입 진행 단계">
        <li class="is-active" data-signup-step-label="0" aria-current="step">
            <span class="member-signup-step-number">1</span>
            <span><small>1단계</small><strong>약관동의</strong></span>
        </li>
        <li data-signup-step-label="1">
            <span class="member-signup-step-number">2</span>
            <span><small>2단계</small><strong>회원정보입력</strong></span>
        </li>
        <li data-signup-step-label="2">
            <span class="member-signup-step-number">3</span>
            <span><small>3단계</small><strong>회원가입완료</strong></span>
        </li>
    </ol>

    <section class="member-signup-step" id="signupStep0" aria-labelledby="signupConsentTitle">
        <div class="member-signup-stage-title">
            <span><strong>1단계</strong> / 3단계</span>
            <h2 id="signupConsentTitle" tabindex="-1">약관동의</h2>
        </div>
        <div class="member-signup-card">
            <p class="member-signup-intro">회원가입에 필요한 안내를 확인하고 동의해 주세요.</p>

            <div class="member-signup-consent-row">
                <input class="form-check-input" type="checkbox" id="signupRequiredConsent" aria-describedby="signupConsentDescription signupConsentError">
                <label for="signupRequiredConsent">해봄 서비스 이용 및 개인정보 처리 안내에 동의합니다 <em>(필수)</em></label>
            </div>
            <p class="member-signup-consent-description" id="signupConsentDescription">필수 동의에 체크해야 다음 단계로 진행할 수 있습니다.</p>
            <p class="member-signup-error" id="signupConsentError" role="alert" hidden></p>

            <div class="member-signup-actions">
                <a class="btn btn-light rounded-pill" href="${pageContext.request.contextPath}/login"><spring:message code="common.cancel" /></a>
                <button class="btn btn-primary rounded-pill px-4" type="button" data-signup-next="1">
                    <spring:message code="common.next" />
                    <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </button>
            </div>
        </div>
    </section>

    <section class="member-signup-account-step d-none" id="signupStep1" aria-labelledby="signupAccountTitle" aria-hidden="true">
        <div class="member-signup-stage-title">
            <span><strong>2단계</strong> / 3단계</span>
            <h2 id="signupAccountTitle" tabindex="-1">회원정보입력</h2>
        </div>

        <form id="signupAccountForm" class="member-signup-fields" novalidate>
            <input type="hidden" id="csrfToken" value="${_csrf.token}">
            <h3>기본정보</h3>

            <div class="member-signup-field">
                <label class="form-label" for="signupName">이름 <em>(필수)</em></label>
                    <input class="form-control" id="signupName" autocomplete="name" maxlength="20" required>
                <p class="member-signup-field-help text-muted" id="signupNameStatus" aria-live="polite">이름을 입력해 주세요.</p>
            </div>

            <div class="member-signup-field">
                <label class="form-label" for="signupId">아이디 <em>(필수)</em></label>
                <div class="input-group">
                    <input class="form-control" id="signupId" autocomplete="username" minlength="4" maxlength="16" pattern="[A-Za-z0-9]+" required>
                    <button class="btn btn-outline-primary" type="button" data-check-id>중복확인</button>
                </div>
                <p class="member-signup-field-help">아이디는 4~16자로 입력해 주세요.</p>
                <p class="member-signup-field-help" id="signupIdCheckStatus" aria-live="polite"></p>
            </div>

            <div class="member-signup-field">
                <label class="form-label" for="signupPassword">비밀번호 <em>(필수)</em></label>
                <div class="member-signup-password-wrap">
                    <input class="form-control" type="password" id="signupPassword" autocomplete="new-password" minlength="8" maxlength="20" required>
                    <button class="member-signup-password-toggle" type="button" data-toggle-password="signupPassword" aria-label="비밀번호 표시">
                        <span class="material-symbols-outlined" aria-hidden="true">visibility_off</span>
                    </button>
                </div>
                <p class="member-signup-field-help member-signup-password-status text-muted" id="signupPasswordStatus" aria-live="polite">비밀번호는 8~20자로 입력해 주세요. 영문 대/소문자를 구분하며, &gt;, &lt;, _, -, &quot;, '는 사용할 수 없어요.</p>
            </div>

            <div class="member-signup-field">
                <label class="form-label" for="signupPasswordConfirm">비밀번호 확인 <em>(필수)</em></label>
                <div class="member-signup-password-wrap">
                    <input class="form-control" type="password" id="signupPasswordConfirm" autocomplete="new-password" minlength="8" maxlength="20" required>
                    <button class="member-signup-password-toggle" type="button" data-toggle-password="signupPasswordConfirm" aria-label="비밀번호 표시">
                        <span class="material-symbols-outlined" aria-hidden="true">visibility_off</span>
                    </button>
                </div>
                <p class="member-signup-field-help text-muted" id="signupPasswordConfirmStatus" aria-live="polite">비밀번호를 다시 입력해 주세요.</p>
            </div>

            <div class="member-signup-field">
                <label class="form-label" for="signupEmail">이메일 <em>(필수)</em></label>
                <input class="form-control" type="email" id="signupEmail" autocomplete="email" maxlength="50" required>
                <p class="member-signup-field-help">아이디·비밀번호 찾기에 사용할 이메일을 입력해 주세요.</p>
            </div>

            <div class="member-signup-field">
                <label class="form-label" for="signupBirthDate">생년월일 <em class="member-signup-optional">(선택)</em></label>
                <input class="form-control" type="date" id="signupBirthDate" autocomplete="bday">
            </div>

            <fieldset class="member-signup-field member-signup-radio-field" aria-describedby="signupDemographicNote">
                <legend class="form-label">성별 <em class="member-signup-optional">(선택)</em></legend>
                <div class="member-signup-gender-options">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" id="signupGenderMale" name="gender" value="M">
                        <label class="form-check-label" for="signupGenderMale">남성</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" id="signupGenderFemale" name="gender" value="F">
                        <label class="form-check-label" for="signupGenderFemale">여성</label>
                    </div>
                </div>
            </fieldset>

            <p class="member-signup-demographic-note" id="signupDemographicNote">생년월일과 성별은 서비스 이용 통계에 활용됩니다. 입력하지 않아도 가입할 수 있습니다.</p>

            <p class="member-signup-error" id="signupAccountError" role="alert" hidden></p>
            <div class="member-signup-actions">
                <button class="btn btn-light rounded-pill" type="button" data-signup-back="0"><spring:message code="common.previous" /></button>
                <button class="btn btn-primary rounded-pill px-4" type="submit">
                    가입하기
                    <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </button>
            </div>
        </form>
    </section>

    <section class="member-signup-step d-none" id="signupStep2" aria-labelledby="signupCompleteTitle" aria-hidden="true">
        <div class="member-signup-stage-title">
            <span><strong>3단계</strong> / 3단계</span>
            <h2 id="signupCompleteTitle" tabindex="-1">회원가입완료</h2>
        </div>
        <div class="member-signup-card member-signup-complete">
            <span class="material-symbols-outlined member-signup-complete-icon" aria-hidden="true">check_circle</span>
            <h3>회원가입이 완료되었어요</h3>
            <p>회원가입이 완료되었어요. 가입한 아이디로 로그인해 주세요.</p>
            <a class="btn btn-primary rounded-pill px-4" href="${pageContext.request.contextPath}/login">로그인 화면으로 이동</a>
        </div>
    </section>
</main>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script src="${pageContext.request.contextPath}/js/common.js"></script>
<script src="${pageContext.request.contextPath}/js/pages/signup.js?v=signup-validation-10"></script>
</body>
</html>
