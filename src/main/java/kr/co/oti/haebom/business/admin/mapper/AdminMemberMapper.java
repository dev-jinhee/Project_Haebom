package kr.co.oti.haebom.business.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.business.admin.dto.AdminMemberDTO;
import kr.co.oti.haebom.business.admin.dto.AdminMemberProgressDTO;

@Mapper
public interface AdminMemberMapper {

	// 1. 관리자용 전체 회원 목록 조회
	List<AdminMemberDTO> selectMemberList();

	// 1-1. 상태 변경 전 대상 회원 현재 상태 조회 (관리자 제외)
	String selectMemberStatusById(@Param("memberId") int memberId);

	// 2. 관리자용 특정 회원 계정 상태 변경 (ACTIVE / SUSPENDED)
	int updateMemberStatus(@Param("memberId") int memberId, @Param("memberStatus") String memberStatus);

	// 2-1. 관리자용 회원 탈퇴 처리 (개인정보 NULL 파기 + WITHDRAWN + withdrawn_at)
	int withdrawMemberById(@Param("memberId") int memberId);

	// 3. 특정 회원의 시뮬레이션 진행/완료 내역 조회
	List<AdminMemberProgressDTO> selectMemberProgressList(@Param("memberId") int memberId);
}
