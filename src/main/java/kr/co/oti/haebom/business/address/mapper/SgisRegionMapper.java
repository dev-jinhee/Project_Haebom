package kr.co.oti.haebom.business.address.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.business.address.dto.SgisRegionDto;

@Mapper
public interface SgisRegionMapper {
	// 전체 행정구역 데이터 건수
	int countRegions();

	// 최상위 시도 조회
	List<SgisRegionDto> selectSido();

	// 상위 코드 기준 하위 행정구역 조회
	List<SgisRegionDto> selectByParentCode(String parentCode);

	// 읍면동 전체 주소 검색
	List<SgisRegionDto> searchRegions(String keyword);

	// 수집 데이터 일괄 저장
	int insertRegions(@Param("regions") List<SgisRegionDto> regions);

	// 전체 데이터 삭제 (갱신 시 사용)
	int deleteAll();

	// fullAddr 조회
	SgisRegionDto selectByRegionCode(String regionCode);

}
