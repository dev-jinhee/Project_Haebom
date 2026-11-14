package kr.co.oti.haebom.business.member.service;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Service;

import kr.co.oti.haebom.business.common.EmailCodeService;
import kr.co.oti.haebom.business.common.EmailCodeService.Purpose;
import kr.co.oti.haebom.business.member.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final String VERIFIED_KEY = "emailVerification.verifiedEmail";

    private final MemberMapper memberMapper;
    private final EmailCodeService emailCodeService;

    public boolean sendCode(String email, String clientIp, HttpSession session) {
        String normalizedEmail = emailCodeService.normalize(email);

        // 새 인증 요청에서는 이전 인증 완료 상태와 코드를 재사용하지 않습니다.
        session.removeAttribute(VERIFIED_KEY);
        emailCodeService.clear(Purpose.SIGNUP, session);

        if (memberMapper.countByEmail(normalizedEmail) > 0) {
            return false;
        }

        emailCodeService.sendCode(Purpose.SIGNUP, normalizedEmail, clientIp, session);
        return true;
    }

    public boolean verifyCode(String email, String code, HttpSession session) {
        String normalizedEmail = emailCodeService.normalize(email);
        boolean verified = emailCodeService.verifyCode(Purpose.SIGNUP, normalizedEmail, code, session);

        if (verified) {
            // 회원가입 API가 기존에 참조하는 세션 키를 유지합니다.
            session.setAttribute(VERIFIED_KEY, normalizedEmail);
        }
        return verified;
    }

    public void clearVerification(HttpSession session) {
        emailCodeService.clear(Purpose.SIGNUP, session);
        session.removeAttribute(VERIFIED_KEY);

        // 세션에 남아 있을 수 있는 이전 구현의 값을 정리합니다.
        session.removeAttribute("emailVerification.email");
        session.removeAttribute("emailVerification.code");
        session.removeAttribute("emailVerification.expiresAt");
    }
}
