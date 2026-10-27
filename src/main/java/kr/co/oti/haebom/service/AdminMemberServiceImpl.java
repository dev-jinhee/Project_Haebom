package kr.co.oti.haebom.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.dto.AdminMemberDTO;
import kr.co.oti.haebom.dto.AdminMemberProgressDTO;
import kr.co.oti.haebom.mapper.AdminMemberMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminMemberServiceImpl implements AdminMemberService {
	
	private final AdminMemberMapper adminMemberMapper;
	private final AdminDashboardService adminDashboardService;
	
	// 1. 전체 회원 목록 조회 (읽기 전용)
	@Override
	public List<AdminMemberDTO> getMemberList() {
		return adminMemberMapper.selectMemberList();
	}
	
	// 2. 회원 상태 변경 (DB 수정이므로 @Transactional 적용)
	@Override
	@Transactional
	public void updateMemberStatus(int memberId, String memberStatus) {
		adminMemberMapper.updateMemberStatus(memberId, memberStatus);
		adminDashboardService.recordActivity(1, "MEMBER", "UPDATE", memberId);
	}
	
	// 3. 특정 회원의 시뮬레이션 진행/완료 내역 조회
	@Override
	public List<AdminMemberProgressDTO> getMemberProgressList(int memberId) {
		return adminMemberMapper.selectMemberProgressList(memberId);
	}
}
