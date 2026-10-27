package kr.co.oti.haebom.service;

import java.util.List;

import kr.co.oti.haebom.dto.AdminMemberDTO;
import kr.co.oti.haebom.dto.AdminMemberProgressDTO;

public interface AdminMemberService {

	// 1. 전체 회원 목록 조회
	List<AdminMemberDTO> getMemberList();
	
	// 2. 회원 상태 변경 (정상, 이용정지, 탈퇴)
	void updateMemberStatus(int memberId, String memberStatus);

	// 3. 특정 회원의 시뮬레이션 진행/완료 내역 조회
	List<AdminMemberProgressDTO> getMemberProgressList(int memberId);
}