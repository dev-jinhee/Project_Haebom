package kr.co.oti.haebom.business.member.service;

import javax.servlet.http.HttpSession;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.business.common.EmailCodeService;
import kr.co.oti.haebom.business.common.EmailCodeService.Purpose;
import kr.co.oti.haebom.business.common.EmailCodeService.VerificationResult;
import kr.co.oti.haebom.business.member.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountRecoveryService {

    // 계정 찾기 흐름에 필요한 부가 정보만 보관합니다. 인증 코드와 만료 시각은 공통 서비스가 관리합니다.
    private static final String NAME = "accountRecovery.name";
    private static final String LOGIN_ID = "accountRecovery.loginId";
    private static final String VERIFIED_LOGIN_ID = "accountRecovery.verifiedLoginId";
    private static final String VERIFIED_EMAIL = "accountRecovery.verifiedEmail";

    private final PasswordEncoder passwordEncoder;
    private final MemberMapper memberMapper;
    private final EmailCodeService emailCodeService;

    public boolean sendFindIdCode(String memberName, String email, String clientIp, HttpSession session) {
        String normalizedName = memberName.trim();
        String normalizedEmail = emailCodeService.normalize(email);

        if (memberMapper.countActiveByNameAndEmail(normalizedName, normalizedEmail) == 0) {
            return false;
        }

        issueCode(Purpose.FIND_ID, normalizedName, null, normalizedEmail, clientIp, session);
        return true;
    }

    public boolean sendFindPasswordCode(
            String loginId, String memberName, String email, String clientIp, HttpSession session) {
        String normalizedEmail = emailCodeService.normalize(email);
        String normalizedId = loginId.trim();
        String normalizedName = memberName.trim();

        if (memberMapper.countActiveByLoginIdNameAndEmail(normalizedId, normalizedName, normalizedEmail) == 0) {
            return false;
        }

        issueCode(Purpose.FIND_PASSWORD, normalizedName, normalizedId, normalizedEmail, clientIp, session);
        return true;
    }

    public FindIdCodeResult verifyFindIdCode(String email, String code, HttpSession session) {
        String normalizedEmail = emailCodeService.normalize(email);
        VerificationResult result = emailCodeService.verifyCode(
                Purpose.FIND_ID, normalizedEmail, code, session);
        if (result != VerificationResult.VERIFIED) {
            return new FindIdCodeResult(null, result);
        }

        Object savedName = session.getAttribute(NAME);
        String loginId = savedName instanceof String
                ? memberMapper.findActiveLoginIdByNameAndEmail((String) savedName, normalizedEmail)
                : null;

        clearRecoveryMetadata(session);
        return new FindIdCodeResult(loginId, result);
    }

    public VerificationResult verifyFindPasswordCode(String email, String code, HttpSession session) {
        String normalizedEmail = emailCodeService.normalize(email);
        Object savedLoginId = session.getAttribute(LOGIN_ID);

        if (!(savedLoginId instanceof String)) {
            return VerificationResult.INVALID;
        }

        VerificationResult result = emailCodeService.verifyCode(
                Purpose.FIND_PASSWORD, normalizedEmail, code, session);
        if (result != VerificationResult.VERIFIED) {
            return result;
        }

        session.setAttribute(VERIFIED_LOGIN_ID, savedLoginId);
        session.setAttribute(VERIFIED_EMAIL, normalizedEmail);
        clearRecoveryMetadata(session);
        return result;
    }

    @Transactional
    public boolean resetPassword(String loginId, String email, String newPassword,
                                 String passwordConfirm, HttpSession session) {
        String normalizedId = loginId.trim();
        String normalizedEmail = emailCodeService.normalize(email);
        Object verifiedLoginId = session.getAttribute(VERIFIED_LOGIN_ID);
        Object verifiedEmail = session.getAttribute(VERIFIED_EMAIL);
        if (!(verifiedLoginId instanceof String) || !(verifiedEmail instanceof String)
                || !normalizedId.equals(verifiedLoginId)
                || !normalizedEmail.equals(verifiedEmail)
                || !newPassword.equals(passwordConfirm)) {
            return false;
        }

        String encodedPassword = passwordEncoder.encode(newPassword);
        int updated = memberMapper.updatePasswordByLoginIdAndEmail(
                normalizedId, normalizedEmail, encodedPassword);
        if (updated == 1) {
            session.removeAttribute(VERIFIED_LOGIN_ID);
            session.removeAttribute(VERIFIED_EMAIL);
            return true;
        }
        return false;
    }

    private void issueCode(
            Purpose purpose, String name, String loginId, String email, String clientIp, HttpSession session) {
        clearChallenge(session);
        session.removeAttribute(VERIFIED_LOGIN_ID);
        session.removeAttribute(VERIFIED_EMAIL);

        emailCodeService.sendCode(purpose, email, clientIp, session);
        session.setAttribute(NAME, name);
        if (loginId != null) {
            session.setAttribute(LOGIN_ID, loginId);
        }
    }

    private void clearChallenge(HttpSession session) {
        emailCodeService.clear(Purpose.FIND_ID, session);
        emailCodeService.clear(Purpose.FIND_PASSWORD, session);
        clearRecoveryMetadata(session);

        // 이전 구현에서 사용하던 공통 challenge 키도 세션에 남아 있으면 제거합니다.
        session.removeAttribute("accountRecovery.purpose");
        session.removeAttribute("accountRecovery.email");
        session.removeAttribute("accountRecovery.code");
        session.removeAttribute("accountRecovery.expiresAt");
    }

    private void clearRecoveryMetadata(HttpSession session) {
        session.removeAttribute(NAME);
        session.removeAttribute(LOGIN_ID);
    }

    public static class FindIdCodeResult {
        private final String loginId;
        private final VerificationResult verificationResult;

        public FindIdCodeResult(String loginId, VerificationResult verificationResult) {
            this.loginId = loginId;
            this.verificationResult = verificationResult;
        }

        public String getLoginId() {
            return loginId;
        }

        public VerificationResult getVerificationResult() {
            return verificationResult;
        }
    }
}
