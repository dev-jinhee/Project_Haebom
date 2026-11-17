package kr.co.oti.haebom.business.main.dto;

import java.util.List;

public record KakaoLocalSearchResultDto(
        List<KakaoLocalPlaceDto> places,
        int incompleteQueryCount,
        int failedQueryCount,
        boolean rateLimited) {
}
