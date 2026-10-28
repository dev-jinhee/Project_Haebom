package kr.co.oti.haebom.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import kr.co.oti.haebom.dto.MyPageProfileResponseDTO;

@Mapper
public interface MyPageMapper {
	
	MyPageProfileResponseDTO selectProfileByMemberId(@Param("memberId") Integer memberId);
	
	@Update("""
		UPDATE member
		SET login_id = NULL,
			password = NULL,
			email = NULL,
			member_name = NULL,
			birth_date = NULL,
			gender = NULL,
			member_status = 'WITHDRAWN',
			withdrawn_at = CURRENT_TIMESTAMP
		WHERE member_id = #{memberId}
		AND member_status = 'ACTIVE'
		AND role = 'USER'
		""")
	int withdrawMemberById(@Param("memberId") Integer memberId);
}
