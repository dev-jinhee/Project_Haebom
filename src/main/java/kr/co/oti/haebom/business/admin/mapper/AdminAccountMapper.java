package kr.co.oti.haebom.business.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.business.admin.dto.AdminAccountDTO;

@Mapper
public interface AdminAccountMapper {
	
	// 1. 관리자 계정 목록 조회 (role = 'ADMIN')
	List<AdminAccountDTO> selectAdminList();
	
	// 2. 새 관리자 등록 시 아이디 중복 검사
	int countByLoginId(@Param("loginId") String loginId);
	// 2-1. 새 관리자 등록 시 이메일 중복 검사
	int countByEmail(@Param("email") String email);
	
	// 3. 새 관리자 계정 등록 (INSERT)
	int insertAdmin(AdminAccountDTO adminAccountDTO);
	
	// 4. 관리자 계정 상태 변경 (ACTIVE / SUSPENDED)
	int updateAdminStatus(@Param("memberId") int memberId, @Param("memberStatus") String memberStatus);
}
