package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.dto.SimulationProgressCreateDTO;
import kr.co.oti.haebom.dto.SimulationProgressDTO;

@Mapper
public interface SimulationProgressMapper {
	// 사용자가 가장 최근에 진행한 기록 시나리오별로 조회
	List<SimulationProgressDTO> selectLatestProgressListByMemberId(Integer memberId);

	// 진행 이력 단건 조회
	SimulationProgressDTO selectProgressByIdAndMemberId(@Param("progressId") Integer progressId,
			@Param("memberId") Integer memberId);

	// 진행 기록 삽입
	int insertProgress(SimulationProgressCreateDTO simulationProgressCreateDTO);

	// 최신 진행 이력 조회
	Integer selectLatestProgressId(@Param("memberId") Integer memberId, @Param("scenarioId") Integer scenarioId);

	// 진행 단계 변경
	int updateProgressStep(@Param("progressId") Integer progressId, @Param("memberId") Integer memberId,
			@Param("currentStepId") Integer currentStepId, @Param("nextStepId") Integer nextStepId);

	// 시뮬레이션 완료 상태 변경
	int completeSimulationProgress(@Param("progressId") Integer progressId, @Param("memberId") Integer memberId,
			@Param("currentStepId") Integer currentStepId);
	
	//시뮬레이션 진행 상태 변경
	int updateProgressAbandoned(@Param("progressId") Integer progressId, @Param("memberId") Integer memberId);

	// 시뮬레이션 진행기록 논리 삭제
	int markProgressDeleted(@Param("progressId") Integer progressId, @Param("memberId") Integer memberId);

	// 이전 단계 이동 가능 여부 확인
	boolean isPreviousStep(@Param("scenarioId") Integer scenarioId, @Param("currentStepId") Integer currentStepId,
			@Param("targetStepId") Integer targetStepId);

	// 다음 단계 이동 가능 여부 확인
	boolean isNextStep(@Param("scenarioId") Integer scenarioId, @Param("currentStepId") Integer currentStepId,
			@Param("targetStepId") Integer targetStepId);

	// 0단계 확인 및 다음 단계 ID 조회
	Integer selectNextStepId(@Param("scenarioId") Integer scenarioId, @Param("currentStepId") Integer currentStepId);
	
	// 마지막 저장일로부터 30일이 지난 진행기록 조회
	List<SimulationProgressDTO> selectExpiredProgress();
	
	// 자동 삭제 대상 재확인 및 행 잠금
	SimulationProgressDTO selectExpiredProgressForUpdate(Integer progressId);

	// 사용자의 진행 기록 전부 논리 삭제
	int deleteProgressByMemberId(Integer memberId);
}
