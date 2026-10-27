package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.dto.AdminMemberDTO;
import kr.co.oti.haebom.dto.AdminMemberProgressDTO;

@Mapper
public interface AdminMemberMapper {

	// 1. 관리자용 전체 회원 목록 조회
	List<AdminMemberDTO> selectMemberList();
	
	// 2. 관리자용 특정 회원 계정 상태 변경 (ACTIVE / SUSPENDE / WITHDRAWN)
	int updateMemberStatus(@Param("memberId") int memberId, @Param("memberStatus") String memberStatus);

	// 3. 특정 회원의 시뮬레이션 진행/완료 내역 조회
	List<AdminMemberProgressDTO> selectMemberProgressList(@Param("memberId") int memberId);
}
