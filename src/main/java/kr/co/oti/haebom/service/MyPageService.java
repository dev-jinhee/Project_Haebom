package kr.co.oti.haebom.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.dto.MyPageProfileResponseDTO;
import kr.co.oti.haebom.mapper.MyPageMapper;
import kr.co.oti.haebom.mapper.SimulationAnswerMapper;
import kr.co.oti.haebom.mapper.SimulationFamilyMapper;
import kr.co.oti.haebom.mapper.SimulationProgressMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyPageService {
	
	private final MyPageMapper myPageMapper;
	private final SimulationAnswerMapper simulationAnswerMapper;
	private final SimulationFamilyMapper simulationFamilyMapper;
	private final SimulationProgressMapper simulationProgressMapper;
	
	public MyPageProfileResponseDTO getProfile(Integer memberId) {
		
		MyPageProfileResponseDTO profile = myPageMapper.selectProfileByMemberId(memberId);
		
		if (profile == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다.");
		}
		
		return profile;
	}
	
	@Transactional
	public void withdraw(Integer memberId) {
	    simulationAnswerMapper.deleteAnswerByMemberId(memberId);
	    simulationFamilyMapper.deleteFamilyByMemberId(memberId);
	    simulationProgressMapper.deleteProgressByMemberId(memberId);
	    
		int updateRows = myPageMapper.withdrawMemberById(memberId);
		
		if (updateRows != 1) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "탈퇴 처리할 수 있는 활성 회원을 찾기 못했습니다.");
		}
	}
}
