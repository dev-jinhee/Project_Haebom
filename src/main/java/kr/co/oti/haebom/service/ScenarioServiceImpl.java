package kr.co.oti.haebom.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.domain.ScenarioStep;
import kr.co.oti.haebom.dto.ScenarioDTO;
import kr.co.oti.haebom.dto.ScenarioListItemDTO;
import kr.co.oti.haebom.dto.SimulationProgressDTO;
import kr.co.oti.haebom.mapper.ScenarioMapper;
import kr.co.oti.haebom.mapper.SimulationProgressMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScenarioServiceImpl implements ScenarioService {
	private final ScenarioMapper scenarioMapper;
	private final SimulationProgressMapper simulationProgressMapper;
	private final MessageSource messageSource;

	@Override
	public List<ScenarioListItemDTO> getScenarioList(Integer memberId) {
		List<ScenarioListItemDTO> result = new ArrayList<>();
		// 1. 공개 시나리오 목록 조회
		List<ScenarioDTO> scenarios = scenarioMapper.selectActiveScenarioList();
		// 만약 공개 시나리오가 없다면 바로 빈 배열 리턴
		if (scenarios.isEmpty()) {
			return Collections.emptyList();
		}
		// 2. 회원이면 최신 진행 이력 조회
		// TODO: 회원인지 아닌지 확인하는 로직은 로그인 구현 이후 추가
		List<SimulationProgressDTO> progressList = simulationProgressMapper
				.selectLatestProgressListByMemberId(memberId);
		Map<Integer, SimulationProgressDTO> progressByScenarioId = new HashMap<>();

		for (SimulationProgressDTO progress : progressList) {
			String statusLabel = messageSource.getMessage("simulation.status." + progress.getProgressStatus(), null,
					progress.getProgressStatus(), LocaleContextHolder.getLocale());

			progress.setProgressStatusLabel(statusLabel);
			progressByScenarioId.put(progress.getScenarioId(), progress);
		}
		// 3. scenarioId 기준으로 두 결과 연결
		for (ScenarioDTO scenario : scenarios) {
			ScenarioListItemDTO item = new ScenarioListItemDTO();
			String categoryLabel = messageSource.getMessage("category." + scenario.getCategoryName(), null,
					scenario.getCategoryName(), LocaleContextHolder.getLocale());

			scenario.setCategoryLabel(categoryLabel);
			
			item.setScenario(scenario);
			item.setProgress(progressByScenarioId.get(scenario.getScenarioId()));
			result.add(item);
		}
		// 4. ScenarioListItemDTO 목록 반환
		return result;
	}

	@Override
	public List<ScenarioStep> getScenarioStep(Integer scenarioId) {
		// 1.해당 시나리오가 존재하는지 확인
		if (!scenarioMapper.existsActiveScenarioById(scenarioId)){
			throw new ResponseStatusException(
		            HttpStatus.NOT_FOUND,
		            "존재하지 않거나 비활성화된 시나리오입니다."
		        );
		}
		// 전체 단계 조회
	    List<ScenarioStep> steps =
	        scenarioMapper.selectScenarioStep(scenarioId);

	    if (steps.isEmpty()) {
	        throw new ResponseStatusException(
	            HttpStatus.NOT_FOUND,
	            "등록된 단계가 없습니다."
	        );
	    }

	    return steps;
	}

}
