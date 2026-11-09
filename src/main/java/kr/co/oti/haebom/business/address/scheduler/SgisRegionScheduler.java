
package kr.co.oti.haebom.business.address.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import kr.co.oti.haebom.business.address.service.SgisRegionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SgisRegionScheduler {

    private final SgisRegionService sgisRegionService;

    // 매월 1일 새벽 3시
    @Scheduled(cron = "0 0 3 1 * *", zone = "Asia/Seoul")
    public void refreshRegions() {

        log.info("[SGIS] 정기 행정구역 갱신 시작");

        sgisRegionService.refreshRegions()
                .subscribe(
                        unused -> {},
                        error -> log.error(
                                "[SGIS] 정기 행정구역 갱신 실패",
                                error
                        ),
                        () -> log.info(
                                "[SGIS] 정기 행정구역 갱신 완료"
                        )
                );
    }
}
