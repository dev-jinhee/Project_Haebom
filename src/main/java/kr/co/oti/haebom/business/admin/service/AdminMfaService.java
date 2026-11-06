package kr.co.oti.haebom.business.admin.service;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.util.Utils;
import kr.co.oti.haebom.business.admin.mapper.AdminMfaMapper;
import kr.co.oti.haebom.system.security.MfaSecretCrypto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminMfaService {

    private static final String ENROLLMENT_SECRET_SESSION_KEY = "ADMIN_MFA_ENROLLMENT_SECRET";

    private final AdminMfaMapper adminMfaMapper;
    private final SecretGenerator secretGenerator;
    private final CodeVerifier codeVerifier;
    private final MfaSecretCrypto mfaSecretCrypto;

    /** 등록 비밀키를 세션에 보관하고, 인증 앱이 읽을 QR 이미지 데이터를 반환합니다. */
    public String createEnrollmentQr(String loginId, HttpSession session) {
        if (!StringUtils.hasText(loginId)) {
            throw new IllegalArgumentException("로그인 아이디가 필요합니다.");
        }

        String secret = (String) session.getAttribute(ENROLLMENT_SECRET_SESSION_KEY);
        if (!StringUtils.hasText(secret)) {
            secret = secretGenerator.generate();
            session.setAttribute(ENROLLMENT_SECRET_SESSION_KEY, secret);
        }

        QrData qrData = new QrData.Builder()
                .label(loginId)
                .secret(secret)
                .issuer("해봄 관리자")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        try {
            QrGenerator qrGenerator = new ZxingPngQrGenerator();
            byte[] png = qrGenerator.generate(qrData);
            return Utils.getDataUriForImage(png, qrGenerator.getImageMimeType());
        } catch (Exception e) {
            throw new IllegalStateException("관리자 OTP 등록 QR 생성에 실패했습니다.", e);
        }
    }

    /** 코드가 맞을 때만 비밀키를 암호화해 등록합니다. */
    public boolean completeEnrollment(Integer memberId, String code, HttpSession session) {
        String secret = (String) session.getAttribute(ENROLLMENT_SECRET_SESSION_KEY);
        if (!StringUtils.hasText(secret) || !isValidCode(secret, code)) {
            return false;
        }

        String ciphertext = mfaSecretCrypto.encrypt(secret);
        int savedRows = adminMfaMapper.upsertSecret(memberId, ciphertext);
        if (savedRows < 1) {
            return false;
        }

        session.removeAttribute(ENROLLMENT_SECRET_SESSION_KEY);
        return true;
    }

    /** DB 암호문을 복호화한 뒤 로그인 때 입력한 OTP를 확인합니다. */
    public boolean verifyLoginCode(Integer memberId, String code) {
        String ciphertext = adminMfaMapper.selectSecretByMemberId(memberId);
        if (!StringUtils.hasText(ciphertext)) {
            return false;
        }

        String secret = mfaSecretCrypto.decrypt(ciphertext);
        return isValidCode(secret, code);
    }

    /** 해당 회원의 MFA 설정 행이 존재하는지 확인합니다. */
    public boolean isEnabled(Integer memberId) {
        return StringUtils.hasText(adminMfaMapper.selectSecretByMemberId(memberId));
    }

    /** 등록 취소 또는 대기 만료 시 임시 비밀키를 세션에서 지웁니다. */
    public void clearEnrollment(HttpSession session) {
        session.removeAttribute(ENROLLMENT_SECRET_SESSION_KEY);
    }

    private boolean isValidCode(String secret, String code) {
        if (!StringUtils.hasText(code) || !code.matches("\\d{6}")) {
            return false;
        }
        return codeVerifier.isValidCode(secret, code);
    }
}
