package kr.co.oti.haebom.business.address.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import kr.co.oti.haebom.business.address.mapper.SgisRegionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SgisRegionInitializer implements ApplicationRunner {

    private final SgisRegionService sgisRegionService;
    private final SgisRegionMapper regionMapper;

    @Override
    public void run(ApplicationArguments args) {

        // DB에 이미 데이터가 있으면 수집하지 않음
        if (regionMapper.countRegions() > 0) {
            log.info("[SGIS] 기존 행정구역 데이터 사용");
            return;
        }

        log.info("[SGIS] 최초 행정구역 데이터 수집 시작");

        // 서버 시작을 막지 않도록 별도 스레드에서 실행
        Thread worker = new Thread(() -> {
            try {
                sgisRegionService.refreshRegions();
                log.info("[SGIS] 최초 행정구역 데이터 수집 완료");
            } catch (Exception e) {
                log.error("[SGIS] 최초 행정구역 데이터 수집 실패", e);
            }
        }, "sgis-initializer");

        worker.setDaemon(true);
        worker.start();
    }
}