package kr.co.oti.haebom.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Locale;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import kr.co.oti.haebom.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountRecoveryService {

	private static final String PURPOSE = "accountRecovery.purpose";
	private static final String EMAIL = "accountRecovery.email";
	private static final String NAME = "accountRecovery.name";
	private static final String CODE = "accountRecovery.code";
	private static final String EXPIRES_AT = "accountRecovery.expiresAt";
	private static final long VALID_MILLIS = 5 * 60 * 1000L;
	
	private final MemberMapper memberMapper;
	private final JavaMailSender mailSender;
	private final SecureRandom random = new SecureRandom();
	
	@Value("${spring.mail.username}")
	private String senderAddress;
	
	public boolean sendFindIdCode(String memberName, String email, HttpSession session) {
		String normalizedName = memberName.trim();
		String normalizedEmail = normalize(email);
		
		if (memberMapper.countActiveByNameAndEmail(normalizedName, normalizedEmail) == 0) {
			return false;
		}
		
		issueCode("FIND_ID", normalizedName, normalizedEmail, session);
		return true;
	}
	
	public String verifyFindIdCode(String email, String code, HttpSession session) {
		
		if(!isValidCode("FIND_ID", email, code, session)) return null;
		
		String savedName = (String) session.getAttribute(NAME);
		String loginId = memberMapper.findActiveLoginIdByNameAndEmail(savedName, normalize(email));
		clearChallenge(session);
		return loginId;
	}
	
	private void issueCode(String purpose, String name, String email, HttpSession session) {
		clearChallenge(session);
		String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
		
		SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(email);
        message.setSubject("[해봄] 아이디 찾기 인증번호");
        message.setText("인증번호는 " + code + " 입니다. 5분 안에 입력해 주세요.");
        mailSender.send(message);
        
        session.setAttribute(PURPOSE, purpose);
        session.setAttribute(EMAIL, email);
        session.setAttribute(NAME, name);
        session.setAttribute(CODE, code);
        session.setAttribute(EXPIRES_AT, Instant.now().toEpochMilli() + VALID_MILLIS);
	}
	
	private boolean isValidCode(String purpose, String email, String code, HttpSession session) {
		Object savedPurpose = session.getAttribute(PURPOSE);
        Object savedEmail = session.getAttribute(EMAIL);
        Object savedCode = session.getAttribute(CODE);
        Object expiresAt = session.getAttribute(EXPIRES_AT);

        return purpose.equals(savedPurpose)
                && normalize(email).equals(savedEmail)
                && code.equals(savedCode)
                && expiresAt instanceof Long
                && Instant.now().toEpochMilli() <= (Long) expiresAt;
	}
	
	private void clearChallenge(HttpSession session) {
        session.removeAttribute(PURPOSE);
        session.removeAttribute(EMAIL);
        session.removeAttribute(NAME);
        session.removeAttribute(CODE);
        session.removeAttribute(EXPIRES_AT);
    }
	
	private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
