package kr.co.oti.haebom.service;

import javax.servlet.http.HttpSession;

public interface EmailVerificationService {

	boolean sendCode(String email, HttpSession session);
	boolean verifyCode(String email, String code, HttpSession session);
	void clearVerification(HttpSession session);
	
}
