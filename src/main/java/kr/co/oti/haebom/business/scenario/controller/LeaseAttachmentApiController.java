package kr.co.oti.haebom.business.scenario.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.business.scenario.service.LeaseAttachmentService;
import kr.co.oti.haebom.business.scenario.service.LeaseAttachmentService.DownloadResult;
import kr.co.oti.haebom.business.scenario.service.LeaseAttachmentService.UploadResult;
import kr.co.oti.haebom.system.security.MemberPrincipal;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/simulation/move/{progressId}")
@Tag(name = "시뮬레이션 첨부파일", description = "임대차계약서 첨부 API")
public class LeaseAttachmentApiController {

	private final LeaseAttachmentService leaseAttachmentService;

	// ==============================
	// 임대차계약서 업로드
	// ==============================
	@PostMapping(value = "/lease-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public UploadResult uploadLeaseFile(@PathVariable("progressId") Integer progressId,
			@RequestPart("file") MultipartFile file, @AuthenticationPrincipal MemberPrincipal memberPrincipal)
			throws IOException {

		return leaseAttachmentService.upload(progressId, memberPrincipal.getMemberId(), file);
	}

	// ==============================
	// 임대차계약서 다운로드
	// ==============================
	@GetMapping("/lease-files/{fileId}")
	public ResponseEntity<byte[]> downloadLeaseFile(@PathVariable("progressId") Integer progressId,
			@PathVariable("fileId") String fileId, @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

		DownloadResult result = leaseAttachmentService.download(progressId, memberPrincipal.getMemberId(), fileId);

		String disposition = ContentDisposition.attachment().filename(result.fileName(), StandardCharsets.UTF_8).build()
				.toString();

		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, disposition)
				.header(HttpHeaders.CACHE_CONTROL, "no-store").header("X-Content-Type-Options", "nosniff")
				.header(HttpHeaders.CONTENT_TYPE, result.contentType()).contentLength(result.bytes().length)
				.body(result.bytes());
	}

	// ==============================
	// 임대차계약서 삭제
	// ==============================
	@DeleteMapping("/lease-files/{fileId}")
	public ResponseEntity<Void> deleteLeaseFile(@PathVariable("progressId") Integer progressId,
			@PathVariable("fileId") String fileId, @AuthenticationPrincipal MemberPrincipal memberPrincipal) {

		leaseAttachmentService.delete(progressId, memberPrincipal.getMemberId(), fileId);

		return ResponseEntity.noContent().build();
	}

}
