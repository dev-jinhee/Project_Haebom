package kr.co.oti.haebom.service;

import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.dto.AnswerSaveRequestListDTO;
import kr.co.oti.haebom.dto.ScenarioStepDTO;
import kr.co.oti.haebom.dto.SimulationProgressCreateDTO;
import kr.co.oti.haebom.dto.SimulationProgressDTO;
import kr.co.oti.haebom.mapper.ScenarioMapper;
import kr.co.oti.haebom.mapper.SimulationAnswerMapper;
import kr.co.oti.haebom.mapper.SimulationProgressMapper;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class SimulationServiceImpl implements SimulationService {
	private final ScenarioMapper scenarioMapper;
	private final SimulationProgressMapper simulationProgressMapper;
	private final SimulationAnswerMapper answerMapper;

	// 시뮬레이션 시작
	@Override
	@Transactional
	public Integer startSimulation(Integer scenarioId, Integer memberId) {
		// 활성 시나리오 검증
		if (!scenarioMapper.existsActiveScenarioById(scenarioId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "시나리오를 찾을 수 없습니다.");
		}
		// 시나리오의 첫 단계 조회
		ScenarioStepDTO scenarioStep = scenarioMapper.selectFirstStepByScenarioId(scenarioId);
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
		SimulationProgressDTO progressDTO = simulationProgressMapper.selectProgressByIdAndMemberId(progressId,
				memberId);
		if (progressDTO == null || "DELETED".equals(progressDTO.getProgressStatus())) {
			throw new ResponseStatusException(// 404ERROR
					HttpStatus.NOT_FOUND, "진행 이력을 찾을 수 없습니다.");
		}
		// 진행 단계 존재 검증 -> COMPLETED 상태일 경우 null값일 수 있어 제외
		if ("IN_PROGRESS".equals(progressDTO.getProgressStatus()) && progressDTO.getStepId() == null) {
			throw new ResponseStatusException( // 409ERROR
					HttpStatus.CONFLICT, "진행 중인 단계가 존재하지 않습니다.");
		}
		// 최근 진행 이력인지 확인
		if (!progressDTO.getProgressId()
				.equals(simulationProgressMapper.selectLatestProgressId(memberId, progressDTO.getScenarioId()))) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "최신 기록이 아닙니다.");
		}
		return progressDTO;
	}

	// 이전 단계 이동
	@Override
	public void moveToStep(Integer progressId, Integer memberId, Integer targetStepId) {
		// 현재 단계 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null || !"IN_PROGRESS".equals(progress.getProgressStatus())) {
			throw new IllegalStateException("진행 중인 시뮬레이션이 아닙니다.");
		}
		// 이동 가능한 이전/다음 단계인지 검증
		if (!simulationProgressMapper.isPreviousStep(progress.getScenarioId(), progress.getStepId(), targetStepId)) {
			throw new IllegalArgumentException("이전 단계로 이동할 수 없습니다.");
		}
		// updateProgressStep() 호출
		int updatedRows = simulationProgressMapper.updateProgressStep(progressId, memberId, progress.getStepId(),
				targetStepId);
		// UPDATE 결과 확인
		if (updatedRows != 1) {
			throw new IllegalStateException("진행 단계가 변경되었거나 수정할 수 없는 상태입니다.");
		}
	}

	// 다음 단계 이동
	@Override
	@Transactional
	public void saveAndMoveToStep(Integer progressId, Integer memberId, Integer targetStepId,
			AnswerSaveRequestListDTO request) {
		// 현재 단계 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null || !"IN_PROGRESS".equals(progress.getProgressStatus())) {
			throw new IllegalStateException("진행 중인 시뮬레이션이 아닙니다.");
		}
		if (!simulationProgressMapper.isNextStep(progress.getScenarioId(), progress.getStepId(), targetStepId)) {
			throw new IllegalArgumentException("다음 단계로 이동할 수 없습니다.");
		}

		// 현재 단계 입력값 저장
		for (AnswerSaveRequestListDTO.AnswerSaveRequestDTO answer : request.getAnswers()) {

			if (!Objects.equals(progress.getStepId(), answer.getStepId())) {
				throw new IllegalArgumentException("현재 진행 단계의 입력값만 저장할 수 있습니다.");
			}

			answerMapper.upsertAnswer(progressId, answer);
		}

		// 다음 단계 이동
		int updatedRows = simulationProgressMapper.updateProgressStep(progressId, memberId, progress.getStepId(),
				targetStepId);
		// UPDATE 결과 확인
		if (updatedRows != 1) {
			throw new IllegalStateException("진행 단계가 변경되었거나 수정할 수 없는 상태입니다.");
		}
	}

	// 시뮬레이션 완료
	@Override
	@Transactional
	public void completeSimulation(Integer progressId, Integer memberId, AnswerSaveRequestListDTO request) {
		// 현재 단계 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null || !"IN_PROGRESS".equals(progress.getProgressStatus())) {
			throw new IllegalStateException("진행 중인 시뮬레이션이 아닙니다.");
		}

		// 마지막 단계 입력값 저장
		for (AnswerSaveRequestListDTO.AnswerSaveRequestDTO answer : request.getAnswers()) {

			if (!Objects.equals(progress.getStepId(), answer.getStepId())) {
				throw new IllegalArgumentException("현재 진행 단계의 입력값만 저장할 수 있습니다.");
			}

			answerMapper.upsertAnswer(progressId, answer);
		}

		// completeSimulationProgress() 호출
		int updatedRows = simulationProgressMapper.completeSimulationProgress(progressId, memberId,
				progress.getStepId());
		// UPDATE 결과 확인
		if (updatedRows != 1) {
			throw new IllegalStateException("마지막 단계가 아니거나 완료 처리할 수 없는 상태입니다.");
		}
	}

}
