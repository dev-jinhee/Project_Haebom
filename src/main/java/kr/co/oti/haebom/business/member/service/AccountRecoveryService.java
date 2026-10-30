package kr.co.oti.haebom.business.member.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Locale;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.business.member.mapper.MemberMapper;
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
	private static final String LOGIN_ID = "accountRecovery.loginId";
	private static final String VERIFIED_LOGIN_ID = "accountRecovery.verifiedLoginId";
	private static final String VERIFIED_EMAIL = "accountRecovery.verifiedEmail";

	private final PasswordEncoder passwordEncoder;
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
		
		issueCode("FIND_ID", normalizedName, null, normalizedEmail, session);
		
		return true;
	}
	
	public boolean sendFindPasswordCode(String loginId, String memberName, String email, HttpSession session) {
		
		String normalizedEmail = normalize(email);
		String normalizedId = loginId.trim();
		String normalizedName = memberName.trim();
		
		if(memberMapper.countActiveByLoginIdNameAndEmail(normalizedId, normalizedName, normalizedEmail) == 0) {
			return false;
		}
		
		issueCode("FIND_PASSWORD", normalizedName, normalizedId, normalizedEmail, session);
		
		return true;
	}
	
	public String verifyFindIdCode(String email, String code, HttpSession session) {
		
		if(!isValidCode("FIND_ID", email, code, session)) return null;
		
		String savedName = (String) session.getAttribute(NAME);
		String loginId = memberMapper.findActiveLoginIdByNameAndEmail(savedName, normalize(email));
		
		clearChallenge(session);
		
		return loginId;
	}
	
	public boolean verifyFindPasswordCode(String email, String code, HttpSession session) {
		
		if(!isValidCode("FIND_PASSWORD", email, code, session)) return false;
		
		session.setAttribute(VERIFIED_LOGIN_ID, session.getAttribute(LOGIN_ID));
		session.setAttribute(VERIFIED_EMAIL, normalize(email));
		
		clearChallenge(session);
		
		return true;
	}
	
	@Transactional
	public boolean resetPassword(String loginId, String email, String newPassword,
	                             String passwordConfirm, HttpSession session) {
	    String normalizedId = loginId.trim();
	    String normalizedEmail = normalize(email);
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
	
	private void issueCode(String purpose, String name, String loginId, String email, HttpSession session) {
		
		clearChallenge(session);
		session.removeAttribute(VERIFIED_LOGIN_ID);
		session.removeAttribute(VERIFIED_EMAIL);
		
		String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
		
		SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(email);
        
        String subject = "FIND_PASSWORD".equals(purpose)
                ? "[해봄] 비밀번호 찾기 인증번호"
                : "[해봄] 아이디 찾기 인증번호";
        
        message.setSubject(subject);
        message.setText("인증번호는 " + code + " 입니다.");
        mailSender.send(message);
        
        session.setAttribute(PURPOSE, purpose);
        session.setAttribute(EMAIL, email);
        session.setAttribute(NAME, name);
        session.setAttribute(CODE, code);
        session.setAttribute(EXPIRES_AT, Instant.now().toEpochMilli() + VALID_MILLIS);
        
        if (loginId != null) {
        	session.setAttribute(LOGIN_ID, loginId);
        }
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
        session.removeAttribute(LOGIN_ID);
    }
	
	private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
