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

	// 갱신 비교를 위한 기존 행정구역 전체 조회
	List<SgisRegionDto> selectAll();

	// 값이 변경된 행정구역만 수정
	int updateRegion(SgisRegionDto region);

	// fullAddr 조회
	SgisRegionDto selectByRegionCode(String regionCode);

}
