package kr.co.oti.haebom.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.dto.AdminScenarioDTO;
import kr.co.oti.haebom.dto.AdminScenarioStepStatsDTO;

@Mapper
public interface AdminScenarioMapper {
	
	// 1. 관리자용 전체 시나리오 목록 조회 (공개 / 비공개 모두 포함)
	List<AdminScenarioDTO> selectScenarioList();
	
	// 2. 시나리오 정보 및 운영 상태 (is_active) 수정
	int updateScenario(AdminScenarioDTO scenarioDTO);
	
	// 3. 특정 시나리오의 전체 시작 및 완료 건수 집계 조회
	Map<String , Object> selectScenarioProgressCounts(@Param("scenarioId") Integer scenarioId);
	
	// 4. 특정 시나리오의 단계별 미완료 및 중도 이탈(IN_PROGRESS, ABANDONED) 건수 목록 조회
	List<AdminScenarioStepStatsDTO> selectScenarioStepStats(@Param("scenarioId") Integer scenarioId);
}
