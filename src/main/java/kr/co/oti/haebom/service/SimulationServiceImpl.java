package kr.co.oti.haebom.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.domain.ScenarioStep;
import kr.co.oti.haebom.dto.SimulationProgressCreateDTO;
import kr.co.oti.haebom.dto.SimulationProgressDTO;
import kr.co.oti.haebom.mapper.ScenarioMapper;
import kr.co.oti.haebom.mapper.SimulationProgressMapper;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class SimulationServiceImpl implements SimulationService {
	private final ScenarioMapper scenarioMapper;
	private final SimulationProgressMapper simulationProgressMapper;

	// 시뮬레이션 시작
	@Override
	@Transactional
	public Integer startSimulation(Integer scenarioId, Integer memberId) {
		// 활성 시나리오 검증
		if (!scenarioMapper.existsActiveScenarioById(scenarioId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "시나리오를 찾을 수 없습니다.");
		}
		// 시나리오의 첫 단계 조회
		ScenarioStep scenarioStep = scenarioMapper.selectFirstStepByScenarioId(scenarioId);
		if (scenarioStep == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "시나리오의 단계가 존재하지 않습니다.");
		}
		// createDTO 생성
		SimulationProgressCreateDTO progressCreateDTO = new SimulationProgressCreateDTO(memberId, scenarioId,
				scenarioStep.getStepId());
		// insert
		simulationProgressMapper.insertProgress(progressCreateDTO);
		// 생성된 progressId 반환
		return progressCreateDTO.getProgressId();
	}

	// 진행이력 조회
	@Override
	public SimulationProgressDTO getProgress(Integer progressId, Integer memberId) {
		// 진행 이력이 존재 검증
		SimulationProgressDTO progressDTO = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if(progressDTO == null || "DELETED".equals(progressDTO.getProgressStatus())) {
			throw new ResponseStatusException(//404ERROR
	                HttpStatus.NOT_FOUND,
	                "진행 이력을 찾을 수 없습니다."
	        );
		}
		// 진행 단계 존재 검증 -> COMPLETED 상태일 경우 null값일 수 있어 제외
		if ("IN_PROGRESS".equals(progressDTO.getProgressStatus())
		        && progressDTO.getStepId() == null) {
		    throw new ResponseStatusException( //409ERROR
		        HttpStatus.CONFLICT,
		        "진행 중인 단계가 존재하지 않습니다."
		    );
		}
		// 최근 진행 이력인지 확인
		if(!progressDTO.getProgressId().equals(simulationProgressMapper.selectLatestProgressId(
                memberId, progressDTO.getScenarioId()))) {
			throw new ResponseStatusException(
			        HttpStatus.CONFLICT,
			        "최신 기록이 아닙니다."
			    );
		}
		return progressDTO;
	}

}
