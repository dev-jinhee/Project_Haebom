
package kr.co.oti.haebom.business.scenario.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.business.scenario.dto.AnswerResponseDTO;
import kr.co.oti.haebom.business.scenario.dto.ScenarioStepDTO;
import kr.co.oti.haebom.business.scenario.dto.SimulationProgressDTO;
import kr.co.oti.haebom.business.scenario.exception.SimulationValidationException;
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

    // 특정 단계의 답변 조회
    public List<AnswerResponseDTO> getAnswersByStep(
            Integer progressId, Integer stepId, Integer memberId) {

        // 진행 기록 조회 및 접근 가능 여부 확인
        SimulationProgressDTO progress =
                simulationProgressMapper.selectProgressByIdAndMemberId(
                        progressId, memberId);

        if (progress == null
                || "DELETED".equals(progress.getProgressStatus())
                || "ABANDONED".equals(progress.getProgressStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "진행 기록을 찾을 수 없습니다.");
        }

        // 해당 시나리오에 속하는 단계인지 확인
        ScenarioStepDTO step = scenarioMapper.selectScenarioStepById(
                stepId, progress.getScenarioId());

        if (step == null) {
            throw new SimulationValidationException(
                    "현재 시나리오에 속하지 않는 단계입니다.");
        }

        // 해당 단계 답변 조회
        return answerMapper.findAnswerByProgressIdAndStepId(
                progressId, stepId);
    }
}
