package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.oti.haebom.domain.ScenarioStep;
import kr.co.oti.haebom.dto.ScenarioDTO;

@Mapper
public interface ScenarioMapper {
	// 시나리오 목록 조회
	List<ScenarioDTO> selectScenarioList();

	// 공개 시나리오 목록 조회
	List<ScenarioDTO> selectActiveScenarioList();
	
	//시나리오 단일 조회
	ScenarioDTO selectScenarioById(Integer scenarioId);
	
	//시나리오 존재 여부 확인
	boolean existsActiveScenarioById(Integer scenarioId);

	// 시나리오 전체 단계 조회
	List<ScenarioStep> selectScenarioStep(Integer scenarioId);

	// 시나리오 특정 단계 조회
	ScenarioStep selectScenarioStepById(Integer stepId);
}
