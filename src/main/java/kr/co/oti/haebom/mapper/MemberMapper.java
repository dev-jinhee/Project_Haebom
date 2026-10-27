package kr.co.oti.haebom.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import kr.co.oti.haebom.domain.Member;

@Mapper
public interface MemberMapper {
	
	int countByLoginId(@Param("loginId") String loginId);
	int countByEmail(@Param("email") String email);
	int insertMember(Member member);
	Member findByLoginId(@Param("loginId") String loginId);
	
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
}
