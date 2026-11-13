<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<spring:message code="signup.validation.consentRequired" var="consentRequiredMessage" />
<spring:message code="signup.validation.passwordMismatch" var="passwordMismatchMessage" />

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
    <link href="${pageContext.request.contextPath}/css/pages/signup.css?v=signup-layout-16" rel="stylesheet">
</head>
<body class="member-signup-page"
      data-context-path="${pageContext.request.contextPath}"
      data-consent-error="${consentRequiredMessage}"
      data-password-error="${passwordMismatchMessage}">
<jsp:include page="/WEB-INF/views/header-signup.jsp" />

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
            <span class="member-signup-step-number" aria-hidden="true"></span>
            <span><small>1단계</small><strong>약관동의</strong></span>
        </li>
        <li data-signup-step-label="1">
            <span class="member-signup-step-number" aria-hidden="true"></span>
            <span><small>2단계</small><strong>회원정보입력</strong></span>
        </li>
        <li data-signup-step-label="2">
            <span class="member-signup-step-number" aria-hidden="true"></span>
            <span><small>3단계</small><strong>회원가입완료</strong></span>
        </li>
    </ol>

    <section class="member-signup-step" id="signupStep0" aria-labelledby="signupConsentTitle">
        <div class="member-signup-stage-title">
            <span><strong>1단계</strong> / 3단계</span>
            <h2 id="signupConsentTitle" tabindex="-1">약관동의</h2>
        </div>
        <div class="member-signup-card">
            <div class="member-signup-consent-list" aria-label="회원가입 약관 동의 항목">
                <div class="member-signup-consent-all">
                    <input class="form-check-input" type="checkbox" id="signupAgreeAll">
                    <label for="signupAgreeAll">모두 동의</label>
                </div>

                <section class="member-signup-consent-item" aria-labelledby="signupTermsLabel">
                    <div class="member-signup-consent-item-heading">
                        <div class="member-signup-consent-row">
                            <input class="form-check-input" type="checkbox" id="signupTermsConsent" aria-describedby="signupConsentError">
                            <label id="signupTermsLabel" for="signupTermsConsent">[필수] 해봄 서비스 이용약관 동의</label>
                        </div>
                        <button class="member-signup-consent-toggle" type="button" aria-expanded="false" aria-controls="signupTermsDetails" data-consent-details="signupTermsDetails">내용 보기</button>
                    </div>
                    <div class="member-signup-consent-details" id="signupTermsDetails" hidden>
                        <p>해봄은 행정절차를 미리 연습하고 공공서비스 정책 및 행정복지센터 정보를 찾아보는 체험 서비스입니다. 실제 민원 신청, 접수, 자격 판정 또는 기관의 공식 답변을 제공하지 않습니다.</p>
                        <p>정책·기관 정보는 참고용으로 제공되며, 실제 신청 요건과 최신 내용은 해당 기관의 공식 안내를 확인해야 합니다. 회원은 타인의 권리를 침해하거나 서비스 운영을 방해하는 방식으로 서비스를 이용하지 않아야 합니다.</p>
                    </div>
                </section>

                <section class="member-signup-consent-item" aria-labelledby="signupPrivacyLabel">
                    <div class="member-signup-consent-item-heading">
                        <div class="member-signup-consent-row">
                            <input class="form-check-input" type="checkbox" id="signupRequiredConsent" aria-describedby="signupConsentError">
                            <label id="signupPrivacyLabel" for="signupRequiredConsent">[필수] 개인정보 수집·이용 동의</label>
                        </div>
                        <button class="member-signup-consent-toggle" type="button" aria-expanded="false" aria-controls="signupPrivacyDetails" data-consent-details="signupPrivacyDetails">내용 보기</button>
                    </div>
                    <div class="member-signup-consent-details" id="signupPrivacyDetails" hidden>
                        <dl>
                            <dt>수집 항목</dt>
                            <dd>필수: 이름, 아이디, 비밀번호, 이메일 / 선택: 생년월일, 성별(직접 입력한 경우에만 수집)</dd>
                            <dt>이용 목적</dt>
                            <dd>회원 계정 생성 및 관리, 로그인, 이메일 인증, 아이디·비밀번호 찾기, 회원별 시나리오 연습 기록과 문의 내역 제공</dd>
                            <dt>보유 및 이용 기간</dt>
                            <dd>계정 정보는 회원 탈퇴 시까지 이용합니다. 탈퇴 시 이름·아이디·비밀번호·이메일·선택정보는 삭제 처리되고, 시나리오 연습 데이터도 탈퇴 처리 과정에서 삭제됩니다. 문의글·답변 등 기록은 회원 식별정보와 분리되어 남을 수 있습니다.</dd>
                            <dt>동의 거부 권리 및 제한</dt>
                            <dd>동의를 거부할 수 있으나, 필수 항목에 동의하지 않으면 회원가입 및 로그인 기반 기능을 이용할 수 없습니다. 선택 항목은 입력하지 않아도 가입할 수 있습니다.</dd>
                        </dl>
                    </div>
                </section>
            </div>
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
                    <input class="form-control" id="signupId" autocomplete="username" minlength="4" maxlength="16" pattern="[A-Za-z0-9]+" aria-describedby="signupIdCheckStatus" required>
                    <button class="btn btn-outline-primary" type="button" data-check-id>중복확인</button>
                </div>
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
                <div class="input-group">
                    <input class="form-control" type="email" id="signupEmail"
                           autocomplete="email" maxlength="50" required>
                    <button class="btn btn-outline-primary" type="button"
                            data-send-email-code>인증번호 받기</button>
                </div>
                <p class="member-signup-field-help">아이디·비밀번호 찾기에 사용할 이메일을 입력해 주세요.</p>
                <p class="member-signup-field-help" id="signupEmailSendStatus" aria-live="polite"></p>
                <div class="input-group mt-2">
                    <input class="form-control" id="signupEmailCode" inputmode="numeric"
                           maxlength="6" placeholder="인증번호 6자리">
                    <button class="btn btn-outline-primary" type="button"
                            data-verify-email-code>인증 확인</button>
                </div>
                <p class="member-signup-field-help" id="signupEmailExpiryStatus" aria-live="polite"></p>
                <p class="member-signup-field-help" id="signupEmailVerifyStatus" aria-live="polite"></p>
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

<div class="modal" id="signupNoticeModal" tabindex="-1"
     aria-labelledby="signupNoticeTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered signup-notice-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="signupNoticeTitle">안내</h2>
                <button type="button" class="btn-close" data-bs-dismiss="modal"
                        aria-label="닫기"></button>
            </div>
            <div class="modal-body" id="signupNoticeMessage"></div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary"
                        data-bs-dismiss="modal">닫기</button>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script src="${pageContext.request.contextPath}/js/common.js"></script>
<script type="module" src="${pageContext.request.contextPath}/js/pages/signup/signup-page.js?v=signup-modules-4"></script>
</body>
</html>
