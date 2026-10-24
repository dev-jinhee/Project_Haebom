package kr.co.oti.haebom.service;

import kr.co.oti.haebom.dto.MemberJoinRequestDTO;

public interface MemberService {
	
	void join(MemberJoinRequestDTO  request);
	
	boolean isLoginIdAvailable(String loginId);
	
}
