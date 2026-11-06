package kr.co.oti.haebom.business.scenario.service;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Objects;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import kr.co.oti.haebom.business.scenario.dto.AnswerSaveRequestListDTO;
import kr.co.oti.haebom.business.scenario.dto.ScenarioStepDTO;
import kr.co.oti.haebom.business.scenario.dto.SimulationProgressCreateDTO;
import kr.co.oti.haebom.business.scenario.dto.SimulationProgressDTO;
import kr.co.oti.haebom.business.scenario.dto.StepValidationInfoDTO;
import kr.co.oti.haebom.business.scenario.exception.SimulationValidationException;
import kr.co.oti.haebom.business.scenario.mapper.ScenarioMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationAnswerMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationFamilyMapper;
import kr.co.oti.haebom.business.scenario.mapper.SimulationProgressMapper;
import kr.co.oti.haebom.business.scenario.validation.StepValidationManager;
import kr.co.oti.haebom.system.storage.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Slf4j
@RequiredArgsConstructor
@Service
public class SimulationService {
	private final ScenarioMapper scenarioMapper;
	private final SimulationProgressMapper simulationProgressMapper;
	private final SimulationAnswerMapper answerMapper;
	private final SimulationFamilyMapper familyMapper;
	private final ObjectMapper objectMapper;
	private final StepValidationManager stepValidationManager;
	private final S3Client s3Client;
	private final S3Service s3Service;

	@Value("${haebom.s3.bucket}")
	private String bucketName;

	private static final Set<String> JSON_FIELDS = Set.of("previousAddress", "currentAddress", "additionalServices",
			"additionalServiceDetails");

	private void processJsonAnswer(AnswerSaveRequestListDTO.AnswerSaveRequestDTO answer) {

		// 1. 필드 키 검증
		if (answer.getFieldKey() == null) {
			throw new SimulationValidationException("필드 키가 없습니다.");
		}

		if (!JSON_FIELDS.contains(answer.getFieldKey())) {
			return;
		}

		// 2. JSON 입력값 검증
		if (answer.getAnswerValue() == null) {
			throw new SimulationValidationException("JSON 입력값이 없습니다.");
		}

		// 3. URL 디코딩
		String decodedValue;

		try {
			decodedValue = URLDecoder.decode(answer.getAnswerValue(), StandardCharsets.UTF_8);
		} catch (IllegalArgumentException e) {
			throw new SimulationValidationException("JSON 인코딩 형식이 올바르지 않습니다.", e);
		}

		// 4. JSON 형식 검증
		try {
			JsonNode jsonNode = objectMapper.readTree(decodedValue);

			boolean isArray = "additionalServices".equals(answer.getFieldKey());

			if (jsonNode == null || (isArray ? !jsonNode.isArray() : !jsonNode.isObject())) {
				throw new SimulationValidationException("JSON 데이터 형식이 올바르지 않습니다.");
			}

			answer.setAnswerValue(decodedValue);

		} catch (JsonProcessingException e) {
			throw new SimulationValidationException("JSON 파싱에 실패했습니다.", e);
		}
	}

	/**
	 * 현재 진행 단계에 등록된 입력값 검증 실행
	 */
	private void validateStepAnswers(Integer progressId, Integer memberId,
			java.util.List<AnswerSaveRequestListDTO.AnswerSaveRequestDTO> answers) {

		// DB에서 시나리오 코드와 단계 순서 조회
		StepValidationInfoDTO stepInfo = simulationProgressMapper.selectStepValidationInfo(progressId, memberId);

		if (stepInfo == null || stepInfo.getScenarioCode() == null || stepInfo.getStepOrder() == null) {

			throw new IllegalStateException("시뮬레이션 단계 정보를 찾을 수 없습니다.");
		}

		// 현재 단계의 입력값 검증
		stepValidationManager.validate(stepInfo.getScenarioCode(), stepInfo.getStepOrder(), answers);
	}

	// 첨부파일 검증 메서드
	private void validateLeaseFiles(Integer progressId, Integer memberId,
			java.util.List<AnswerSaveRequestListDTO.AnswerSaveRequestDTO> answers) {

		StepValidationInfoDTO stepInfo = simulationProgressMapper.selectStepValidationInfo(progressId, memberId);

		// 전입신고 4단계에서만 실행
		if (stepInfo == null || !"MOVE".equals(stepInfo.getScenarioCode())
				|| !Integer.valueOf(4).equals(stepInfo.getStepOrder())) {
			return;
		}

		for (AnswerSaveRequestListDTO.AnswerSaveRequestDTO answer : answers) {

			if (!"additionalServiceDetails".equals(answer.getFieldKey())) {
				continue;
			}

			try {
				JsonNode details = objectMapper.readTree(answer.getAnswerValue());
				JsonNode attachments = details.path("LEASE_REPORT").path("attachments");

				// 선택하지 않았거나 첨부파일이 없는 경우
				if (attachments.isMissingNode()) {
					continue;
				}

				for (JsonNode file : attachments) {
					String key = file.path("s3Key").asText();
					String name = file.path("fileName").asText();
					long size = file.path("fileSize").asLong();

					// 현재 진행 이력의 첨부파일인지 확인
					String prefix = "move/" + progressId + "/lease/";
					if (!key.startsWith(prefix)
							|| !key.substring(prefix.length()).matches("(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-"
									+ "[0-9a-f]{4}-[0-9a-f]{12}\\.(pdf|jpg|jpeg|bmp)")) {
						throw new SimulationValidationException("현재 진행 이력의 첨부파일이 아닙니다.");
					}

					try {
						var info = s3Client.headObject(r -> r.bucket(bucketName).key(key));

						String encodedName = Base64.getUrlEncoder().withoutPadding()
								.encodeToString(name.getBytes(StandardCharsets.UTF_8));

						if (info.contentLength() == null || info.contentLength() != size
								|| !encodedName.equals(info.metadata().get("original-name-b64"))) {
							throw new SimulationValidationException("첨부파일 정보가 일치하지 않습니다.");
						}

					} catch (S3Exception e) {
						if (e.statusCode() == 404) {
							throw new SimulationValidationException("S3에 존재하지 않는 첨부파일입니다.");
						}
						throw e;
					}
				}

			} catch (JsonProcessingException e) {
				throw new SimulationValidationException("첨부파일 정보를 읽을 수 없습니다.", e);
			}
		}
	}

	// 시뮬레이션 시작
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
	public SimulationProgressDTO getProgress(Integer progressId, Integer memberId) {
		// 진행 이력이 존재 검증
		SimulationProgressDTO progressDTO = simulationProgressMapper.selectProgressByIdAndMemberId(progressId,
				memberId);
		if (progressDTO == null || "DELETED".equals(progressDTO.getProgressStatus())
				|| "ABANDONED".equals(progressDTO.getProgressStatus())) {
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
	public void moveToStep(Integer progressId, Integer memberId, Integer targetStepId) {
		// 현재 단계 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "진행 기록을 찾을 수 없습니다.");
		}
		if (!"IN_PROGRESS".equals(progress.getProgressStatus())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "진행 중인 시뮬레이션이 아닙니다.");
		}
		// 이동 가능한 이전/다음 단계인지 검증
		if (!simulationProgressMapper.isPreviousStep(progress.getScenarioId(), progress.getStepId(), targetStepId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "이전 단계로 이동할 수 없습니다.");
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
	@Transactional
	public void saveAndMoveToStep(Integer progressId, Integer memberId, Integer targetStepId,
			AnswerSaveRequestListDTO request) {
		// 현재 단계 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "진행 기록을 찾을 수 없습니다.");
		}
		if (!"IN_PROGRESS".equals(progress.getProgressStatus())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "진행 중인 시뮬레이션이 아닙니다.");
		}
		if (!simulationProgressMapper.isNextStep(progress.getScenarioId(), progress.getStepId(), targetStepId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "다음 단계로 이동할 수 없습니다.");
		}

		if (request == null || request.getAnswers() == null) {
			throw new SimulationValidationException("답변 정보가 없습니다.");
		}

		// 요청 전체의 단계/JSON을 먼저 확인한다.
		for (AnswerSaveRequestListDTO.AnswerSaveRequestDTO answer : request.getAnswers()) {
			if (answer == null || !Objects.equals(progress.getStepId(), answer.getStepId())) {
				throw new SimulationValidationException("현재 진행 단계의 입력값만 저장할 수 있습니다.");
			}
			processJsonAnswer(answer);
		}

		// 저장 전에 현재 단계의 입력값 검증
		validateStepAnswers(progressId, memberId, request.getAnswers());

		// 전부 통과한 경우에만 기존 Mapper에 저장한다.
		for (AnswerSaveRequestListDTO.AnswerSaveRequestDTO answer : request.getAnswers()) {
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
	@Transactional
	public void completeSimulation(Integer progressId, Integer memberId, AnswerSaveRequestListDTO request) {
		// 현재 단계 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);
		if (progress == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "진행 기록을 찾을 수 없습니다.");
		}
		if (!"IN_PROGRESS".equals(progress.getProgressStatus())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "진행 중인 시뮬레이션이 아닙니다.");
		}

		if (request == null || request.getAnswers() == null) {
			throw new SimulationValidationException("답변 정보가 없습니다.");
		}

		// 요청 전체의 단계/JSON을 먼저 확인한다.
		for (AnswerSaveRequestListDTO.AnswerSaveRequestDTO answer : request.getAnswers()) {
			if (answer == null || !Objects.equals(progress.getStepId(), answer.getStepId())) {
				throw new SimulationValidationException("현재 진행 단계의 입력값만 저장할 수 있습니다.");
			}
			processJsonAnswer(answer);
		}

		// 저장 전에 현재 단계의 입력값 검증
		validateStepAnswers(progressId, memberId, request.getAnswers());

		// S3 첨부파일 참조 검증
		validateLeaseFiles(progressId, memberId, request.getAnswers());

		// 전부 통과한 경우에만 기존 Mapper에 저장한다.
		for (AnswerSaveRequestListDTO.AnswerSaveRequestDTO answer : request.getAnswers()) {
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

	// 시뮬레이션 삭제
	@Transactional
	public void deleteProgress(Integer progressId, Integer memberId) {

		// 1. 현재 진행 이력 조회
		SimulationProgressDTO progress = simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);

		if (progress == null || "DELETED".equals(progress.getProgressStatus())
				|| "ABANDONED".equals(progress.getProgressStatus())) {

			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "진행 기록을 찾을 수 없습니다.");
		}

		// 2. 답변 삭제 전에 첨부파일 존재 여부 확인
		boolean hasLeaseFile = hasLeaseAttachments(progressId);

		// 3. 시뮬레이션 가족 삭제
		familyMapper.deleteByProgressId(progressId);

		// 4. 시뮬레이션 입력값 삭제
		answerMapper.deleteSimulationAnswer(progressId);

		// 5. 시뮬레이션 상태 DELETED 변경
		int updateRow = simulationProgressMapper.markProgressDeleted(progressId, memberId);

		if (updateRow != 1) {
			throw new IllegalStateException("진행 기록 삭제가 실패하였습니다.");
		}

		// 6. 첨부파일이 있을 때만 DB 커밋 후 S3 삭제
		if (hasLeaseFile) {

			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {

				@Override
				public void afterCommit() {
					try {
						s3Service.deleteLeaseFiles(progressId);

					} catch (Exception e) {
						log.error("시뮬레이션 삭제 후 S3 파일 삭제 실패. progressId={}", progressId, e);
					}
				}
			});
		}
	}
	
	//마이페이지 이력 조회
	public SimulationProgressDTO getProgressForHistory(Integer progressId, Integer memberId) {
	    SimulationProgressDTO progress =
	            simulationProgressMapper.selectProgressByIdAndMemberId(progressId, memberId);

	    if (progress == null
	            || "DELETED".equals(progress.getProgressStatus())
	            || "ABANDONED".equals(progress.getProgressStatus())) {
	        throw new ResponseStatusException(
	                HttpStatus.NOT_FOUND, "진행 이력을 찾을 수 없습니다.");
	    }

	    if ("IN_PROGRESS".equals(progress.getProgressStatus())
	            && progress.getStepId() == null) {
	        throw new ResponseStatusException(
	                HttpStatus.CONFLICT, "진행 중인 단계가 존재하지 않습니다.");
	    }

	    return progress;
	}

	// 임대차계약서 첨부파일 존재 여부 확인
	private boolean hasLeaseAttachments(Integer progressId) {

		String json = answerMapper.selectLeaseAttachmentJson(progressId);

		if (json == null || json.isBlank()) {
			return false;
		}

		try {
			JsonNode details = objectMapper.readTree(json);

			JsonNode attachments = details.path("LEASE_REPORT").path("attachments");

			return attachments.isArray() && !attachments.isEmpty();

		} catch (JsonProcessingException e) {
			log.warn("첨부파일 JSON 파싱 실패. progressId={}", progressId, e);

			// 파싱 실패 시 파일이 있을 가능성을 고려해 정리 시도
			return true;
		}
	}
}
