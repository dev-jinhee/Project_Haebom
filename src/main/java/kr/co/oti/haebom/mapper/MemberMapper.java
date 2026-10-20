package kr.co.oti.haebom.mapper;

import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.domain.Member;

public interface MemberMapper {
	int countByLoginId(@Param("loginId") String loginId);
	int countByEmail(@Param("email") String email);
	int insertMember(Member member);
}
