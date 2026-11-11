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

		sgisRegionService.refreshRegions().subscribe(unused -> {
		}, error -> log.error("[SGIS] 최초 행정구역 데이터 수집 실패", error), () -> log.info("[SGIS] 최초 행정구역 데이터 수집 완료"));
	}
}