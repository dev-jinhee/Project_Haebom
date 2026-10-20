package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.oti.haebom.dto.ScenarioDTO;

@Mapper
public interface ScenarioMapper {
	
	List<ScenarioDTO> selectScenarioList();
	
	List<ScenarioDTO> selectActiveScenarioList();
}
