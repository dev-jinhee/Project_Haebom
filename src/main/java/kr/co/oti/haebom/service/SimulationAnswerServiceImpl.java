package kr.co.oti.haebom.service;

import java.util.List;

import org.springframework.stereotype.Service;

import kr.co.oti.haebom.dto.AnswerResponseDTO;
import kr.co.oti.haebom.dto.ScenarioStepDTO;
import kr.co.oti.haebom.dto.SimulationProgressDTO;
import kr.co.oti.haebom.mapper.ScenarioMapper;
import kr.co.oti.haebom.mapper.SimulationAnswerMapper;
import kr.co.oti.haebom.mapper.SimulationProgressMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SimulationAnswerServiceImpl implements SimulationAnswerService {
	private final SimulationAnswerMapper answerMapper;
	private final SimulationProgressMapper simulationProgressMapper;
	private final ScenarioMapper scenarioMapper;

	@Override
	public List<AnswerResponseDTO> getAnswersByStep(Integer progressId, Integer stepId, Integer memberId) {
		// 현재 단계 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null || "DELETED".equals(progress.getProgressStatus()) || "ABANDONED".equals(progress.getProgressStatus())) {
			throw new IllegalStateException("진행 사항이 존재하지 않습니다.");
		}
		// 현재 시나리오에 속하는 단계인지 확인
		ScenarioStepDTO step = scenarioMapper.selectScenarioStepById(stepId, progress.getScenarioId());

		if (step == null) {
			throw new IllegalArgumentException("현재 시나리오에 속하지 않는 단계입니다.");
		}
		return answerMapper.findAnswerByProgressIdAndStepId(progressId, stepId);
	}

	@Override
	public List<AnswerResponseDTO> getAnswersByProgress(Integer progressId, Integer memberId) {
		// 현재 단계 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null || "DELETED".equals(progress.getProgressStatus()) || "ABANDONED".equals(progress.getProgressStatus())) {
			throw new IllegalStateException("진행 사항이 존재하지 않습니다.");
		}
		return answerMapper.findAnswerByProgressId(progressId);
	}

}
