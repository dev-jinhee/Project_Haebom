package kr.co.oti.haebom.business.member.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Locale;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import kr.co.oti.haebom.business.member.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
	
    private static final String EMAIL_KEY = "emailVerification.email";
    private static final String CODE_KEY = "emailVerification.code";
    private static final String EXPIRES_KEY = "emailVerification.expiresAt";
    private static final String VERIFIED_KEY = "emailVerification.verifiedEmail";
    private static final long VALID_MILLIS = 5 * 60 * 1000L;

    private final MemberMapper memberMapper;
    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();

    @Value("${spring.mail.username}")
    private String senderAddress;
    
    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
    public boolean sendCode(String email, HttpSession session) {
        
    	String normalizedEmail = normalize(email);
        if (memberMapper.countByEmail(normalizedEmail) > 0) return false;

        String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(normalizedEmail);
        message.setSubject("[해봄] 회원가입 인증번호");
        message.setText("인증번호는 [" + code + "] 입니다.");

        mailSender.send(message);

        session.setAttribute(EMAIL_KEY, normalizedEmail);
        session.setAttribute(CODE_KEY, code);
        session.setAttribute(EXPIRES_KEY, Instant.now().toEpochMilli() + VALID_MILLIS);
        session.removeAttribute(VERIFIED_KEY);
        return true;
    }
    public boolean verifyCode(String email, String code, HttpSession session) {
        String normalizedEmail = normalize(email);
        Object savedEmail = session.getAttribute(EMAIL_KEY);
        Object savedCode = session.getAttribute(CODE_KEY);
        Object expiresAt = session.getAttribute(EXPIRES_KEY);

        if (!(savedEmail instanceof String)
                || !(savedCode instanceof String)
                || !(expiresAt instanceof Long)
                || !normalizedEmail.equals(savedEmail)
                || !code.equals(savedCode)
                || Instant.now().toEpochMilli() > (Long) expiresAt) {
            return false;
        }

        session.setAttribute(VERIFIED_KEY, normalizedEmail);
        session.removeAttribute(CODE_KEY);
        session.removeAttribute(EXPIRES_KEY);
        return true;
    }
    public void clearVerification(HttpSession session) {
        session.removeAttribute(EMAIL_KEY);
        session.removeAttribute(CODE_KEY);
        session.removeAttribute(EXPIRES_KEY);
        session.removeAttribute(VERIFIED_KEY);
    }
}
