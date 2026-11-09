package kr.co.oti.haebom.business.address.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import kr.co.oti.haebom.business.address.service.SgisRegionService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SgisRegionScheduler {

    private final SgisRegionService searchService;

    // 매월 1일 새벽 3시
    @Scheduled(
        cron = "0 0 3 1 * *",
        zone = "Asia/Seoul"
    )
    public void refreshRegions() {
        searchService.refreshRegions();
    }
}