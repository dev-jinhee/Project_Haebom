package kr.co.oti.haebom.business.scenario.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Locale;
import java.util.UUID;

import javax.imageio.ImageIO;

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
public class IdentityPhotoService {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    private final SimulationService simulationService;
    private final SimulationProgressMapper progressMapper;
    private final S3Service s3Service;
    private final S3Client s3Client;

    @Value("${haebom.s3.bucket}")
    private String bucketName;

    public record UploadResult(
            String s3Key,
            String fileName,
            long fileSize) {
    }

    public record PhotoResult(
            String contentType,
            byte[] bytes) {
    }

    // ==============================
    // 진행 이력 및 단계 검증
    // ==============================
    private void checkProgress(
            Integer progressId,
            Integer memberId,
            boolean requireWritable) {

        SimulationProgressDTO progress =
                simulationService.getProgress(progressId, memberId);

        if (requireWritable &&
                !"IN_PROGRESS".equals(progress.getProgressStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "완료된 시뮬레이션의 사진은 변경할 수 없습니다.");
        }

        if (requireWritable) {
            StepValidationInfoDTO stepInfo =
                    progressMapper.selectStepValidationInfo(
                            progressId, memberId);

            // 실제 재발급 시나리오 코드 확인 필요
            if (stepInfo == null
                    || !"IDENTITY".equals(stepInfo.getScenarioCode())
                    || !Integer.valueOf(1).equals(
                            stepInfo.getStepOrder())) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "주민등록증 재발급 1단계에서만 사진을 변경할 수 있습니다.");
            }
        }
    }

    // ==============================
    // 증명사진 업로드
    // ==============================
    public UploadResult upload(
            Integer progressId,
            Integer memberId,
            MultipartFile file) throws IOException {

        checkProgress(progressId, memberId, true);

        if (file == null || file.isEmpty()
                || file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "증명사진은 0Byte 초과, 5MB 이하만 가능합니다.");
        }

        String name = file.getOriginalFilename();

        if (name == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "파일명이 없습니다.");
        }

        name = name.replace("\\", "/");
        name = name.substring(name.lastIndexOf('/') + 1)
                .replaceAll("[\\p{Cntrl}]", "").trim();

        if (name.isBlank() || name.length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "파일명이 올바르지 않습니다.");
        }

        int dot = name.lastIndexOf('.');
        String extension = dot >= 0
                ? name.substring(dot + 1).toLowerCase(Locale.ROOT)
                : "";

        byte[] bytes = file.getBytes();
        String contentType;

        // 파일 확장자와 헤더 검증
        switch (extension) {
            case "jpg":
            case "jpeg":
                if (!startsWith(bytes, 0xFF, 0xD8, 0xFF)) {
                    throw invalidPhoto();
                }
                contentType = "image/jpeg";
                break;

            case "png":
                if (!startsWith(bytes,
                        0x89, 0x50, 0x4E, 0x47,
                        0x0D, 0x0A, 0x1A, 0x0A)) {
                    throw invalidPhoto();
                }
                contentType = "image/png";
                break;

            default:
                throw invalidPhoto();
        }

        // 실제 이미지로 디코딩할 수 있는지 확인
        try (ByteArrayInputStream input =
                new ByteArrayInputStream(bytes)) {

            if (ImageIO.read(input) == null) {
                throw invalidPhoto();
            }
        }

        String s3Key = "identity/" + progressId
                + "/photo/" + UUID.randomUUID()
                + "." + extension;

        s3Service.upload(s3Key, bytes, contentType, name);

        return new UploadResult(s3Key, name, bytes.length);
    }

    // ==============================
    // 증명사진 조회
    // ==============================
    public PhotoResult download(
            Integer progressId,
            Integer memberId,
            String fileId) {

        checkProgress(progressId, memberId, false);

        String s3Key = resolveS3Key(progressId, fileId);

        HeadObjectResponse info = findObject(s3Key);

        if (info.contentLength() == null
                || info.contentLength() <= 0
                || info.contentLength() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "조회할 수 없는 증명사진입니다.");
        }

        String contentType = info.contentType();

        if (!"image/jpeg".equals(contentType)
                && !"image/png".equals(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "지원하지 않는 이미지 형식입니다.");
        }

        return new PhotoResult(
                contentType,
                s3Service.download(s3Key));
    }

    // ==============================
    // 증명사진 삭제
    // ==============================
    public void delete(
            Integer progressId,
            Integer memberId,
            String fileId) {

        checkProgress(progressId, memberId, true);

        String s3Key = resolveS3Key(progressId, fileId);

        findObject(s3Key);
        s3Service.delete(s3Key);
    }

    private String resolveS3Key(
            Integer progressId, String fileId) {

        if (fileId == null || !fileId.matches(
                "(?i)[0-9a-f]{8}-[0-9a-f]{4}-"
                + "[0-9a-f]{4}-[0-9a-f]{4}-"
                + "[0-9a-f]{12}\\.(jpg|jpeg|png)")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "증명사진 ID가 올바르지 않습니다.");
        }

        return "identity/" + progressId + "/photo/" + fileId;
    }

    private HeadObjectResponse findObject(String s3Key) {
        try {
            return s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .build());
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "증명사진을 찾을 수 없습니다.");
            }
            throw e;
        }
    }

    private boolean startsWith(byte[] bytes, int... signature) {
        if (bytes.length < signature.length) return false;

        for (int i = 0; i < signature.length; i++) {
            if ((bytes[i] & 0xFF) != signature[i]) return false;
        }

        return true;
    }

    private ResponseStatusException invalidPhoto() {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "JPG, JPEG, PNG 증명사진만 첨부할 수 있습니다.");
    }
}
