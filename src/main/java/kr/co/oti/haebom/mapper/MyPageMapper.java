package kr.co.oti.haebom.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.dto.MyPageProfileResponseDTO;

@Mapper
public interface MyPageMapper {
	
	MyPageProfileResponseDTO selectProfileByMemberId(@Param("memberId") Integer memberId);
}
