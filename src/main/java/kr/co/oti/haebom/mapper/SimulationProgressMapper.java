package kr.co.oti.haebom.mapper;

import java.util.List;

import kr.co.oti.haebom.dto.SimulationProgressDTO;

public interface SimulationProgressMapper {
	List<SimulationProgressDTO> selectLatestProgressListByMemberId(Integer memberId);
}
