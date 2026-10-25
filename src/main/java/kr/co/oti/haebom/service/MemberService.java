package kr.co.oti.haebom.service;

import kr.co.oti.haebom.dto.MemberJoinRequestDTO;

public interface MemberService {
	
	void join(MemberJoinRequestDTO request, String verifiedEmail);
	
	boolean isLoginIdAvailable(String loginId);
	
}
