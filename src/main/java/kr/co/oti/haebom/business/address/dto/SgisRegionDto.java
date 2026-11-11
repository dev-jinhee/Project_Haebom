package kr.co.oti.haebom.business.address.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SgisRegionDto {
	// SGIS 행정구역 코드 (PK)
    private String regionCode;

    // 상위 행정구역 코드
    private String parentCode;

    // 행정구역명
    private String regionName;

    // 전체 행정구역명
    private String fullAddr;

    // 1: 시도, 2: 시군구, 3: 읍면동
    private Integer regionLevel;

    // 갱신 일시
    private LocalDateTime updatedAt;
}
