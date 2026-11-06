package kr.co.oti.haebom.business.scenario.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.business.scenario.dto.SimulationProgressDTO;
import kr.co.oti.haebom.business.scenario.dto.StepValidationInfoDTO;
import kr.co.oti.haebom.business.scenario.mapper.SimulationProgressMapper;
import kr.co.oti.haebom.system.storage.S3Service;
import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
@RequiredArgsConstructor
public class LeaseAttachmentService {

	private static final long MAX_FILE_SIZE = 2L * 1024 * 1024;
	private static final int MAX_FILES = 2;

	private final SimulationService simulationService;
	private final SimulationProgressMapper progressMapper;
	private final S3Service s3Service;
	private final S3Client s3Client;

	@Value("${haebom.s3.bucket}")
	private String bucketName;

	public record UploadResult(String s3Key, String fileName, long fileSize) {
	}

	// ==============================
	// 파일 업로드
	// ==============================
	public UploadResult upload(Integer progressId, Integer memberId, MultipartFile file) throws IOException {

		// 1. 로그인 회원의 진행 이력 확인
		SimulationProgressDTO progress = simulationService.getProgress(progressId, memberId);

		if (!"IN_PROGRESS".equals(progress.getProgressStatus())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "완료된 시뮬레이션에는 첨부할 수 없습니다.");
		}

		// 2. 전입신고 4단계인지 확인
		StepValidationInfoDTO stepInfo = progressMapper.selectStepValidationInfo(progressId, memberId);

		if (stepInfo == null || !"MOVE".equals(stepInfo.getScenarioCode())
				|| !Integer.valueOf(4).equals(stepInfo.getStepOrder())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "전입신고 4단계에서만 첨부할 수 있습니다.");
		}

		// 3. 파일 존재 및 크기 검증
		if (file == null || file.isEmpty() || file.getSize() > MAX_FILE_SIZE) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일은 0Byte 초과, 2MB 이하만 가능합니다.");
		}

		// 4. 파일명 및 확장자 확인
		String name = file.getOriginalFilename();

		if (name == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일명이 없습니다.");
		}

		name = name.replace("\\", "/");
		name = name.substring(name.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}]", "").trim();

		if (name.isBlank() || name.length() > 150) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일명이 올바르지 않습니다.");
		}

		int dot = name.lastIndexOf('.');
		String extension = dot >= 0 ? name.substring(dot + 1).toLowerCase(Locale.ROOT) : "";

		byte[] bytes = file.getBytes();

		// 5. 실제 파일 헤더 검증
		String contentType;

		switch (extension) {
		case "pdf":
			if (!startsWith(bytes, 0x25, 0x50, 0x44, 0x46, 0x2D))
				throw invalidFile();
			contentType = "application/pdf";
			break;

		case "jpg":
		case "jpeg":
			if (!startsWith(bytes, 0xFF, 0xD8, 0xFF))
				throw invalidFile();
			contentType = "image/jpeg";
			break;

		case "bmp":
			if (!startsWith(bytes, 0x42, 0x4D))
				throw invalidFile();
			contentType = "image/bmp";
			break;

		default:
			throw invalidFile();
		}

		// 6. 해당 진행 이력의 S3 첨부파일 개수 확인
		String prefix = "move/" + progressId + "/lease/";

		int count = s3Client.listObjectsV2(request -> request.bucket(bucketName).prefix(prefix).maxKeys(MAX_FILES))
				.contents().size();

		if (count >= MAX_FILES) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "첨부파일은 최대 2개까지 가능합니다.");
		}

		// 7. 서버가 S3 객체 키 생성
		String s3Key = prefix + UUID.randomUUID() + "." + extension;

		// 8. 실제 S3 업로드
		s3Service.upload(s3Key, bytes, contentType, name);

		// 9. 업로드 성공 정보 반환
		return new UploadResult(s3Key, name, bytes.length);
	}

	private boolean startsWith(byte[] bytes, int... signature) {
		if (bytes.length < signature.length)
			return false;

		for (int i = 0; i < signature.length; i++) {
			if ((bytes[i] & 0xFF) != signature[i])
				return false;
		}
		return true;
	}

	private ResponseStatusException invalidFile() {
		return new ResponseStatusException(HttpStatus.BAD_REQUEST, "JPG, JPEG, BMP, PDF 형식의 파일만 첨부할 수 있습니다.");
	}

	// 다운로드 결과
	public record DownloadResult(String fileName, String contentType, byte[] bytes) {
	}

	// 파일 ID 검증 및 S3 키 생성
	private String resolveS3Key(Integer progressId, String fileId) {

		if (fileId == null || !fileId.matches(
				"(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-" + "[0-9a-f]{4}-[0-9a-f]{12}\\.(pdf|jpg|jpeg|bmp)")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "첨부파일 ID가 올바르지 않습니다.");
		}

		return "move/" + progressId + "/lease/" + fileId;
	}

	// S3 파일 존재 확인
	private HeadObjectResponse findObject(String s3Key) {
		try {
			return s3Client.headObject(HeadObjectRequest.builder().bucket(bucketName).key(s3Key).build());
		} catch (S3Exception e) {
			if (e.statusCode() == 404) {
				throw new ResponseStatusException(HttpStatus.NOT_FOUND, "첨부파일을 찾을 수 없습니다.");
			}
			throw e;
		}
	}

	// ==============================
	// 파일 다운로드
	// ==============================
	public DownloadResult download(Integer progressId, Integer memberId, String fileId) {

		// 본인 진행 이력인지 확인
		simulationService.getProgress(progressId, memberId);

		String s3Key = resolveS3Key(progressId, fileId);
		HeadObjectResponse info = findObject(s3Key);

		if (info.contentLength() == null || info.contentLength() > MAX_FILE_SIZE) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "다운로드할 수 없는 파일 크기입니다.");
		}

		String fileName = fileId;

		// 저장된 원본 파일명 복원
		String encodedName = info.metadata().get("original-name-b64");

		if (encodedName != null) {
			try {
				String decoded = new String(Base64.getUrlDecoder().decode(encodedName), StandardCharsets.UTF_8);

				decoded = decoded.replaceAll("[\\\\/\\p{Cntrl}]", "_");

				if (!decoded.isBlank() && decoded.length() <= 150) {
					fileName = decoded;
				}
			} catch (IllegalArgumentException ignored) {
				// 메타데이터가 올바르지 않으면 파일 ID 사용
			}
		}

		byte[] bytes = s3Service.download(s3Key);

		return new DownloadResult(fileName,
				info.contentType() == null ? "application/octet-stream" : info.contentType(), bytes);
	}

	// ==============================
	// 파일 삭제
	// ==============================
	public void delete(Integer progressId, Integer memberId, String fileId) {

		// 본인 진행 이력인지 확인
		SimulationProgressDTO progress = simulationService.getProgress(progressId, memberId);

		// 완료된 시뮬레이션은 수정 불가
		if (!"IN_PROGRESS".equals(progress.getProgressStatus())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "완료된 시뮬레이션의 파일은 삭제할 수 없습니다.");
		}

		// 전입신고 4단계 확인
		StepValidationInfoDTO stepInfo = progressMapper.selectStepValidationInfo(progressId, memberId);

		if (stepInfo == null || !"MOVE".equals(stepInfo.getScenarioCode())
				|| !Integer.valueOf(4).equals(stepInfo.getStepOrder())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "전입신고 4단계에서만 첨부파일을 삭제할 수 있습니다.");
		}

		String s3Key = resolveS3Key(progressId, fileId);

		findObject(s3Key);
		s3Service.delete(s3Key);
	}

}
