
package kr.co.oti.haebom.business.address.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.business.address.dto.SgisRegionDto;
import kr.co.oti.haebom.business.address.mapper.SgisRegionMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SgisRegionWriter {

    private final SgisRegionMapper regionMapper;

    private static final int BATCH_SIZE = 300;

    @Transactional(rollbackFor = Exception.class)
    public void replaceRegions(List<SgisRegionDto> regions) {

        if (regions == null || regions.isEmpty()) {
            throw new IllegalArgumentException(
                "저장할 행정구역 데이터가 없습니다."
            );
        }

        // 새로운 데이터 수집 완료 후 기존 데이터 삭제
        regionMapper.deleteAll();

        // 300개씩 나누어 INSERT
        for (int i = 0; i < regions.size(); i += BATCH_SIZE) {

            int end = Math.min(
                i + BATCH_SIZE,
                regions.size()
            );

            List<SgisRegionDto> batch =
                    regions.subList(i, end);

            int inserted = regionMapper.insertRegions(batch);

            if (inserted != batch.size()) {
                throw new IllegalStateException(
                    "행정구역 저장 건수 불일치"
                );
            }
        }

        // 최종 저장 건수 확인
        int savedCount = regionMapper.countRegions();

        if (savedCount != regions.size()) {
            throw new IllegalStateException(
                "행정구역 전체 저장 건수 불일치"
            );
        }
    }
}
