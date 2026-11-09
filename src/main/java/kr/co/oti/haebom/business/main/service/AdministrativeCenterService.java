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
        if (sido == null || sido.isBlank() || sigungu == null || sigungu.isBlank()) {
            return mainPageMapper.selectAllCentersWithCoordinates();
        }
        return mainPageMapper.selectCentersByRegion(sido, sigungu);
    }
}
