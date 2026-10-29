package kr.co.oti.haebom.business.scenario.service;

import java.util.List;

import org.springframework.stereotype.Service;

import kr.co.oti.haebom.business.scenario.dto.AnswerResponseDTO;
import kr.co.oti.haebom.business.scenario.dto.ScenarioStepDTO;
import kr.co.oti.haebom.business.scenario.dto.SimulationProgressDTO;
import kr.co.oti.haebom.business.scenario.mapper.ScenarioMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationAnswerMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationProgressMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SimulationAnswerService {
	private final SimulationAnswerMapper answerMapper;
	private final SimulationProgressMapper simulationProgressMapper;
	private final ScenarioMapper scenarioMapper;
	public List<AnswerResponseDTO> getAnswersByStep(Integer progressId, Integer stepId, Integer memberId) {
		// 현재 단계 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null || "DELETED".equals(progress.getProgressStatus())
				|| "ABANDONED".equals(progress.getProgressStatus())) {
			throw new IllegalStateException("진행 사항이 존재하지 않습니다.");
		}
		// 현재 시나리오에 속하는 단계인지 확인
		ScenarioStepDTO step = scenarioMapper.selectScenarioStepById(stepId, progress.getScenarioId());

		if (step == null) {
			throw new IllegalArgumentException("현재 시나리오에 속하지 않는 단계입니다.");
		}
		List<AnswerResponseDTO> answers = answerMapper.findAnswerByProgressIdAndStepId(progressId, stepId);

		return answers;
	}
	public List<AnswerResponseDTO> getAnswersByProgress(Integer progressId, Integer memberId) {
		// 현재 단계 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null || "DELETED".equals(progress.getProgressStatus())
				|| "ABANDONED".equals(progress.getProgressStatus())) {
			throw new IllegalStateException("진행 사항이 존재하지 않습니다.");
		}
		return answerMapper.findAnswerByProgressId(progressId);
	}

}
