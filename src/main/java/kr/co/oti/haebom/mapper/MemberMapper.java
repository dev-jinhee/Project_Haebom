package kr.co.oti.haebom.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.dto.MemberDTO;

@Mapper
public interface MemberMapper {
	
	int countByLoginId(@Param("loginId") String loginId);
	int countByEmail(@Param("email") String email);
	int insertMember(MemberDTO member);
	MemberDTO findByLoginId(@Param("loginId") String loginId);
	
}
