package kr.co.oti.haebom.business.scenario.controller;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import kr.co.oti.haebom.business.scenario.service.IdentityPhotoService;
import kr.co.oti.haebom.business.scenario.service.IdentityPhotoService.PhotoResult;
import kr.co.oti.haebom.business.scenario.service.IdentityPhotoService.UploadResult;
import kr.co.oti.haebom.system.security.MemberPrincipal;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/simulation/identity/{progressId}")
public class IdentityPhotoApiController {

    private final IdentityPhotoService identityPhotoService;

    @PostMapping(
        value = "/photo",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public UploadResult upload(
            @PathVariable Integer progressId,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal MemberPrincipal principal)
            throws IOException {

        return identityPhotoService.upload(
                progressId, principal.getMemberId(), file);
    }

    @GetMapping("/photo/{fileId}")
    public ResponseEntity<byte[]> download(
            @PathVariable Integer progressId,
            @PathVariable String fileId,
            @AuthenticationPrincipal MemberPrincipal principal) {

        PhotoResult result = identityPhotoService.download(
                progressId, principal.getMemberId(), fileId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header("X-Content-Type-Options", "nosniff")
                .contentType(MediaType.parseMediaType(result.contentType()))
                .contentLength(result.bytes().length)
                .body(result.bytes());
    }

    @DeleteMapping("/photo/{fileId}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer progressId,
            @PathVariable String fileId,
            @AuthenticationPrincipal MemberPrincipal principal) {

        identityPhotoService.delete(
                progressId, principal.getMemberId(), fileId);

        return ResponseEntity.noContent().build();
    }
}
