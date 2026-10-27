package kr.co.oti.haebom.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import kr.co.oti.haebom.dto.MemberDTO;

@Mapper
public interface MemberMapper {
	
	int countByLoginId(@Param("loginId") String loginId);
	int countByEmail(@Param("email") String email);
	int insertMember(MemberDTO member);
	MemberDTO findByLoginId(@Param("loginId") String loginId);
	
	@Select("""
		SELECT COUNT(*)
		FROM member
		WHERE member_name = #{memberName}
			AND email = #{email}
			AND member_status = 'ACTIVE'
		""")
	int countActiveByNameAndEmail(
			@Param("memberName") String memberName,
			@Param("email") String email);
	
	@Select("""
		SELECT login_id
		FROM member
		WHERE member_name = #{memberName}
			AND email = #{email}
			AND member_status = 'ACTIVE'
		""")
	String findActiveLoginIdByNameAndEmail(
			@Param("memberName") String memberName,
			@Param("email") String email);
	
	@Select("""
		SELECT COUNT(*)
		FROM member
		WHERE login_id = #{loginId}
			AND member_name = #{memberName}
			AND email = #{email}
			AND member_status = 'ACTIVE'
		""")
	int countActiveByLoginIdNameAndEmail(
			@Param("loginId") String loginId,
	        @Param("memberName") String memberName,
	        @Param("email") String email);
	
	@Update("""
		UPDATE member
		SET password = #{password}
		WHERE login_id = #{loginId}
			AND email = #{email}
			AND member_status = 'ACTIVE'
		""")
	int updatePasswordByLoginIdAndEmail(
			@Param("loginId") String loginId,
			@Param("email") String email,
			@Param("password") String password);
}
