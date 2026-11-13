package kr.co.oti.haebom.business.address.scheduler;

import java.time.Duration;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.business.address.service.SgisRegionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.util.retry.Retry;

@Slf4j
@Component
@RequiredArgsConstructor
public class SgisRegionScheduler {

    private final SgisRegionService sgisRegionService;

    private static final int MAX_RETRIES = 3;
    private static final Duration RETRY_DELAY = Duration.ofSeconds(30);

    // 매월 1일 새벽 3시
    @Scheduled(cron = "0 0 3 1 * *", zone = "Asia/Seoul")
    public void refreshRegions() {

        log.info("[SGIS] 정기 행정구역 갱신 시작");

        sgisRegionService.refreshRegions()
                .retryWhen(Retry.fixedDelay(MAX_RETRIES, RETRY_DELAY)
                        .filter(this::isRetryable)
                        .doBeforeRetry(signal -> log.warn(
                                "[SGIS] 일시적 조회 오류 - 30초 후 재시도 ({}/{}): {}",
                                signal.totalRetries() + 1,
                                MAX_RETRIES,
                                signal.failure().toString()
                        ))
                        // 최종 실패 로그에는 실제 원인 예외를 그대로 남긴다.
                        .onRetryExhaustedThrow((spec, signal) -> signal.failure()))
                .subscribe(
                        unused -> {},
                        error -> log.error("[SGIS] 정기 행정구역 갱신 최종 실패", error),
                        () -> log.info("[SGIS] 정기 행정구역 갱신 완료")
                );
    }

    private boolean isRetryable(Throwable error) {
        // SGIS JSON 응답 자체가 오류인 경우: 알려진 잘못된 요청/검색결과 없음 코드는 제외.
        if (error instanceof ResponseStatusException) {
            String reason = ((ResponseStatusException) error).getReason();
            if (reason != null) {
                if (reason.startsWith("SGIS 행정구역 조회에 실패했습니다.")) {
                    return !reason.contains("errCd=-401,") && !reason.contains("errCd=-100,");
                }
                if (reason.equals("SGIS 행정구역 응답이 비어 있습니다.")) {
                    return true;
                }
            }
        }

        // HTTP 연결 실패, 429(요청 제한), 5xx(서버 오류)만 재시도.
        // 인증키 오류, 데이터 형식 오류, DB 저장 오류는 재시도하지 않는다.
        Throwable cause = error;
        while (cause != null) {
            if (cause instanceof WebClientRequestException) {
                return true;
            }
            if (cause instanceof WebClientResponseException) {
                int status = ((WebClientResponseException) cause).getRawStatusCode();
                return status == 429 || status >= 500;
            }
            cause = cause.getCause();
        }
        return false;
    }
}
