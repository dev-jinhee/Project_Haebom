package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.dto.MoveFamilyRequestDTO;
import kr.co.oti.haebom.dto.SimulationFamilyDTO;

@Mapper
public interface SimulationFamilyMapper {
	// 가족 구성원 정보 저장
	int insertFamily(SimulationFamilyDTO familyDTO);

	// 가족 구성원 조회
	List<SimulationFamilyDTO> selectFamily(Integer progressId);

	// 신청인 정보 조회
	SimulationFamilyDTO selectApplicant(Integer progressId);

	// 신청인 전화번호 수정
	int updateApplicantPhone(@Param("progressId") Integer progressId, @Param("phoneNum") String phoneNum);

	// 가족별 이사정보 및 현재 세대정보 변경
	void updateFamilyMoveState(@Param("progressId") Integer progressId, @Param("familyId") Integer familyId,
			@Param("moveStatus") String moveStatus, @Param("relationship") String relationship,
			@Param("isHouseholdHead") boolean isHouseholdHead);

	// 새 세대주 연락처 변경
	void updateFamilyPhone(@Param("progressId") Integer progressId, @Param("familyId") Integer familyId,
			@Param("phoneNum") String phoneNum);

	// 이사 가족의 세대주 및 연락처 변경
	int updateMovingFamilyHousehold(@Param("progressId") Integer progressId,
			@Param("member") MoveFamilyRequestDTO.FamilyMember member);
	
	//해당 진행사항의 가족정보 삭제
	int deleteByProgressId(@Param("progressId") Integer progressId);
}
