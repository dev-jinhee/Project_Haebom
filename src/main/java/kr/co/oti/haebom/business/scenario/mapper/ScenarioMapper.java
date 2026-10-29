package kr.co.oti.haebom.business.scenario.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.business.scenario.dto.ScenarioDTO;
import kr.co.oti.haebom.business.scenario.dto.ScenarioStepDTO;

@Mapper
public interface ScenarioMapper {
	// 공개 시나리오 목록 조회
	List<ScenarioDTO> selectActiveScenarioList();
	
	//시나리오 단일 조회
	ScenarioDTO selectScenarioById(Integer scenarioId);
	
	//시나리오 존재 여부 확인
	boolean existsActiveScenarioById(Integer scenarioId);

	// 시나리오 전체 단계 조회
	List<ScenarioStepDTO> selectScenarioStep(Integer scenarioId);

	// 시나리오 특정 단계 조회
	ScenarioStepDTO selectScenarioStepById(@Param("stepId") Integer stepId, @Param("scenarioId") Integer scenarioId);
	
	//시나리오의 첫 단계 조회
	ScenarioStepDTO selectFirstStepByScenarioId(Integer scenarioId);
}
