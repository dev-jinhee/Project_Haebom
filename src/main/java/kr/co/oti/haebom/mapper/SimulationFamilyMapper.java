package kr.co.oti.haebom.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.domain.SimulationFamily;

@Mapper
public interface SimulationFamilyMapper {
	// 가족 구성원 정보 저장
	int insertFamily(SimulationFamily family);

	// 신청인 정보 조회
	SimulationFamily selectApplicant(Integer progressId);

	// 신청인 전화번호 수정
	int updateApplicantPhone(@Param("progressId") Integer progressId, @Param("phoneNum") String phoneNum);
}
