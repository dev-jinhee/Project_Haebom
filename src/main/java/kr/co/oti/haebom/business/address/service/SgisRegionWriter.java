package kr.co.oti.haebom.business.address.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.business.address.dto.SgisRegionDto;
import kr.co.oti.haebom.business.address.mapper.SgisRegionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SgisRegionWriter {

    private final SgisRegionMapper regionMapper;

    private static final int BATCH_SIZE = 300;

    @Transactional(rollbackFor = Exception.class)
    public void syncRegions(List<SgisRegionDto> regions) {

        if (regions == null || regions.isEmpty()) {
            throw new IllegalArgumentException("저장할 행정구역 데이터가 없습니다.");
        }

        // 기존 DB 데이터를 유지한 채 행정구역 코드로 비교한다.
        List<SgisRegionDto> savedRegions = regionMapper.selectAll();
        Map<String, SgisRegionDto> savedByCode = new HashMap<>();

        for (SgisRegionDto saved : savedRegions) {
            if (savedByCode.putIfAbsent(saved.getRegionCode(), saved) != null) {
                throw new IllegalStateException("DB 행정구역 코드 중복: " + saved.getRegionCode());
            }
        }

        List<SgisRegionDto> toInsert = new ArrayList<>();
        List<SgisRegionDto> toUpdate = new ArrayList<>();

        for (SgisRegionDto latest : regions) {
            SgisRegionDto saved = savedByCode.get(latest.getRegionCode());

            if (saved == null) {
                toInsert.add(latest);
            } else if (isChanged(saved, latest)) {
                toUpdate.add(latest);
            }
            // 변경되지 않은 데이터는 INSERT/UPDATE 하지 않는다.
        }

        // 신규 지역만 300개씩 INSERT
        for (int i = 0; i < toInsert.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, toInsert.size());
            List<SgisRegionDto> batch = toInsert.subList(i, end);

            int inserted = regionMapper.insertRegions(batch);
            if (inserted != batch.size()) {
                throw new IllegalStateException("신규 행정구역 저장 건수 불일치");
            }
        }

        // 변경된 지역만 UPDATE
        for (SgisRegionDto changed : toUpdate) {
            int updated = regionMapper.updateRegion(changed);
            if (updated != 1) {
                throw new IllegalStateException("행정구역 수정 실패: " + changed.getRegionCode());
            }
        }

        // 원본 SGIS 응답에서 누락된 기존 데이터는 별도 정책 없이 삭제하지 않는다.
        int expectedCount = savedRegions.size() + toInsert.size();
        if (regionMapper.countRegions() != expectedCount) {
            throw new IllegalStateException("행정구역 갱신 후 전체 건수 불일치");
        }

        log.info("[SGIS] 갱신 결과 - 신규: {}건, 변경: {}건, 유지: {}건",
                toInsert.size(), toUpdate.size(),
                regions.size() - toInsert.size() - toUpdate.size());
    }

    private boolean isChanged(SgisRegionDto saved, SgisRegionDto latest) {
        return !Objects.equals(saved.getParentCode(), latest.getParentCode())
                || !Objects.equals(saved.getRegionName(), latest.getRegionName())
                || !Objects.equals(saved.getFullAddr(), latest.getFullAddr())
                || !Objects.equals(saved.getRegionLevel(), latest.getRegionLevel());
    }
}
