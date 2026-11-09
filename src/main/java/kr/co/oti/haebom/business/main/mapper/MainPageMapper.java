package kr.co.oti.haebom.business.main.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import kr.co.oti.haebom.business.main.dto.AdministrativeCenterDTO;
import kr.co.oti.haebom.business.main.dto.PopularScenarioDTO;

@Mapper
public interface MainPageMapper {
    
	@Select("""
        SELECT
          s.scenario_id,
          s.scenario_title,
          s.description,
          s.estimated_minutes,
          c.category_name
        FROM scenario s
        JOIN category c ON c.category_id = s.category_id
        JOIN (
          SELECT scenario_id, COUNT(*) AS start_count
          FROM simulation_progress
          WHERE started_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
            AND started_at < DATE_ADD(DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), INTERVAL 1 MONTH)
            AND progress_status <> 'DELETED'
          GROUP BY scenario_id
        ) popularity ON popularity.scenario_id = s.scenario_id
        WHERE s.is_active = 1
        ORDER BY popularity.start_count DESC, s.scenario_id ASC
        LIMIT 5
        """)
    List<PopularScenarioDTO> selectPopularScenariosThisMonth();
	
	@Select("""
		SELECT center_id AS centerId,
			sido, 
			sigungu,
		    center_name,
		    postal_code,
			address,
			latitude,
			longitude
		FROM administrative_center
		WHERE sido = #{sido}
		AND sigungu = #{sigungu}
		AND latitude IS NOT NULL
		AND longitude IS NOT NULL
		ORDER BY center_name
		""")
	List<AdministrativeCenterDTO> selectCentersByRegion(
			@Param("sido") String sido,
			@Param("sigungu") String sigungu);

	@Select("""
		SELECT center_id AS centerId,
			sido,
			sigungu,
			center_name,
			postal_code,
			address,
			latitude,
			longitude
		FROM administrative_center
		WHERE latitude IS NOT NULL
		AND longitude IS NOT NULL
		ORDER BY sido, sigungu, center_name
		""")
	List<AdministrativeCenterDTO> selectAllCentersWithCoordinates();
}
