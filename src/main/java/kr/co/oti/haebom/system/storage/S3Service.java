package kr.co.oti.haebom.system.storage;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class S3Service {

	private final S3Client s3Client;

	@Value("${haebom.s3.bucket}")
	private String bucketName;

	// ==============================
	// 파일 업로드
	// ==============================
	public void upload(String s3Key, byte[] fileBytes, String contentType, String fileName) {

		String encodedName = Base64.getUrlEncoder().withoutPadding()
				.encodeToString(fileName.getBytes(StandardCharsets.UTF_8));

		PutObjectRequest request = PutObjectRequest.builder().bucket(bucketName).key(s3Key).contentType(contentType)
				.metadata(Map.of("original-name-b64", encodedName)).build();

		s3Client.putObject(request, RequestBody.fromBytes(fileBytes));
	}

	// ==============================
	// 파일 다운로드
	// ==============================
	public byte[] download(String s3Key) {

		GetObjectRequest request = GetObjectRequest.builder().bucket(bucketName).key(s3Key).build();

		return s3Client.getObjectAsBytes(request).asByteArray();
	}

	// ==============================
	// 파일 삭제
	// ==============================
	public void delete(String s3Key) {

		DeleteObjectRequest request = DeleteObjectRequest.builder().bucket(bucketName).key(s3Key).build();

		s3Client.deleteObject(request);
	}

	// 진행 이력의 임대차 첨부파일 전체 삭제
	public void deleteLeaseFiles(Integer progressId) {
		String prefix = "move/" + progressId + "/lease/";

		s3Client.listObjectsV2Paginator(r -> r.bucket(bucketName).prefix(prefix)).contents()
				.forEach(file -> delete(file.key()));
	}
}
