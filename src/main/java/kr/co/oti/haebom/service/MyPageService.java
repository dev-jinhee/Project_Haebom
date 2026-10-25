package kr.co.oti.haebom.service;

import kr.co.oti.haebom.dto.MyPageProfileResponseDTO;

public interface MyPageService {
	
	MyPageProfileResponseDTO getProfile(Integer memberId);
}
