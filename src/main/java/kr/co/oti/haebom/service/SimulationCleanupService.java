package kr.co.oti.haebom.service;

public interface SimulationCleanupService {
	// 30일 경과한 진행기록 자동 삭제
    void cleanupExpiredProgress();
}
