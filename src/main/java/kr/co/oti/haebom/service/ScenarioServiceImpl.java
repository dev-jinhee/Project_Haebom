package kr.co.oti.haebom.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kr.co.oti.haebom.dto.ScenarioDTO;
import kr.co.oti.haebom.dto.ScenarioListItemDTO;
import kr.co.oti.haebom.dto.SimulationProgressDTO;
import kr.co.oti.haebom.mapper.ScenarioMapper;
import kr.co.oti.haebom.mapper.SimulationProgressMapper;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ScenarioServiceImpl implements ScenarioService {
	private final ScenarioMapper scenarioMapper;
	private final SimulationProgressMapper simulationProgressMapper;

	@Override
	public List<ScenarioListItemDTO> getScenarioList(Integer memberId) {
		List<ScenarioListItemDTO> result = new ArrayList<>();
		// 1. 공개 시나리오 목록 조회
		List<ScenarioDTO> scenarios = scenarioMapper.selectActiveScenarioList();
		//만약 공개 시나리오가 없다면 바로 빈 배열 리턴
		if (scenarios.isEmpty()) {
		    return Collections.emptyList();
		}
	    // 2. 회원이면 최신 진행 이력 조회
		//TODO: 회원인지 아닌지 확인하는 로직은 로그인 구현 이후 추가
		List<SimulationProgressDTO> progressList = simulationProgressMapper.selectLatestProgressListByMemberId(memberId);
		Map<Integer, SimulationProgressDTO> progressByScenarioId = new HashMap<>();

		for (SimulationProgressDTO progress : progressList) {
			progressByScenarioId.put(progress.getScenarioId(), progress);
		}
		// 3. scenarioId 기준으로 두 결과 연결
		for(ScenarioDTO scenario :scenarios) {
			ScenarioListItemDTO item = new ScenarioListItemDTO();
			item.setScenario(scenario);
			item.setProgress(progressByScenarioId.get(scenario.getScenarioId()));
			result.add(item);
		}
	    // 4. ScenarioListItemDTO 목록 반환
		return result;
	}

}
