package kr.co.oti.haebom.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.dto.MyPageProfileResponseDTO;
import kr.co.oti.haebom.mapper.MyPageMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {

	private final MyPageMapper myPageMapper;
	
	@Override
	public MyPageProfileResponseDTO getProfile(Integer memberId) {
		
		MyPageProfileResponseDTO profile = myPageMapper.selectProfileByMemberId(memberId);

		if (profile == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다.");
        }

        return profile;
    }
}
