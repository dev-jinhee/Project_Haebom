package kr.co.oti.haebom.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.oti.haebom.dto.SimulationProgressDTO;

@Mapper
public interface SimulationProgressMapper {
	List<SimulationProgressDTO> selectLatestProgressListByMemberId(Integer memberId);
}
