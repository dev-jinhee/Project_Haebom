package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.oti.haebom.dto.SimulationProgressCreateDTO;
import kr.co.oti.haebom.dto.SimulationProgressDTO;

@Mapper
public interface SimulationProgressMapper {
	//사용자가 가장 최근에 진행한 기록 시나리오별로 조회
	List<SimulationProgressDTO> selectLatestProgressListByMemberId(Integer memberId);
	//진행 이력 단건 조회
	SimulationProgressDTO selectProgressByIdAndMemberId(@Param("progressId") Integer progressId, @Param("memberId") Integer memberId);
	//진행 기록 삽입
	int insertProgress(SimulationProgressCreateDTO simulationProgressCreateDTO);
}
