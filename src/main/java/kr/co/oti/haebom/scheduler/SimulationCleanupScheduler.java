package kr.co.oti.haebom.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import kr.co.oti.haebom.service.SimulationCleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SimulationCleanupScheduler {
	private final SimulationCleanupService cleanupService;

	// 매일 새벽 3시, 30일 경과한 진행기록 자동 삭제
	@Scheduled(cron = "0 0 3 * * *", zone = "Asia/Seoul")
	public void cleanupExpiredProgress() {

		log.info("30일 경과 시뮬레이션 진행기록 자동 삭제 시작");

		try {
			cleanupService.cleanupExpiredProgress();

			log.info("30일 경과 시뮬레이션 진행기록 자동 삭제 완료");

		} catch (Exception e) {
			log.error("30일 경과 시뮬레이션 진행기록 자동 삭제 실패", e);
		}
	}
}
