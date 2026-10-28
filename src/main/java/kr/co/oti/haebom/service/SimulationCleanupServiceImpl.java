package kr.co.oti.haebom.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.dto.SimulationProgressDTO;
import kr.co.oti.haebom.mapper.SimulationAnswerMapper;
import kr.co.oti.haebom.mapper.SimulationFamilyMapper;
import kr.co.oti.haebom.mapper.SimulationProgressMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SimulationCleanupServiceImpl implements SimulationCleanupService {
	private final SimulationProgressMapper progressMapper;
	private final SimulationAnswerMapper answerMapper;
	private final SimulationFamilyMapper familyMapper;

	@Override
	@Transactional
	// 30일 경과한 진행기록 자동 삭제
	public void cleanupExpiredProgress() {
		List<SimulationProgressDTO> progressList = progressMapper.selectExpiredProgress();
		progressList.forEach((progress) -> {
			Integer progressId = progress.getProgressId();
			Integer memberId = progress.getMemberId();
			// 삭제 대상 재확인 및 행 잠금
			if (progressMapper.selectExpiredProgressForUpdate(progressId) == null) {
				throw new IllegalStateException("삭제 대상이 아닙니다.");
			}
			// 시뮬레이션가족 삭제
			familyMapper.deleteByProgressId(progressId);
			// 시물레이션 입력값 삭제
			answerMapper.deleteSimulationAnswer(progressId);
			// 시물레이션 상태 DELETED 변경
			int updateRow = progressMapper.markProgressDeleted(progressId, memberId);
			if (updateRow != 1) {
				throw new IllegalStateException("진행 기록 삭제가 실패하였습니다.");
			}
		});
	}

}
