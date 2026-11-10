package kr.co.oti.haebom.business.main.service;

import java.util.List;

import org.springframework.stereotype.Service;

import kr.co.oti.haebom.business.main.dto.AdministrativeCenterDTO;
import kr.co.oti.haebom.business.main.mapper.MainPageMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdministrativeCenterService {
    private final MainPageMapper mainPageMapper;

    public List<AdministrativeCenterDTO> getCenters(String sido, String sigungu) {
        if (sido == null || sido.isBlank()) {
            return mainPageMapper.selectAllCentersWithCoordinates();
        }
        if (sigungu == null || sigungu.isBlank()) {
            return mainPageMapper.selectCentersBySido(sido.trim());
        }
        return mainPageMapper.selectCentersByRegion(sido, sigungu);
    }

    public List<String> getSidoOptions() {
        return mainPageMapper.selectDistinctSido();
    }

    public List<String> getSigunguOptions(String sido) {
        if (sido == null || sido.isBlank()) {
            return List.of();
        }
        return mainPageMapper.selectDistinctSigunguBySido(sido.trim());
    }
}
