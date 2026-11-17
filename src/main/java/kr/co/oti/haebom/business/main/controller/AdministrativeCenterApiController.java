package kr.co.oti.haebom.business.main.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.business.main.dto.KakaoLocalSearchResultDto;
import kr.co.oti.haebom.business.main.service.KakaoLocalSearchService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Tag(name = "메인페이지 행정기관 지도", description = "전체 또는 지역별 행정복지센터 조회 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main/institutions")
public class AdministrativeCenterApiController {

    private final KakaoLocalSearchService kakaoLocalSearchService;

    @Operation(summary = "선택 지역의 행정기관 검색", description = "11개 키워드의 Kakao Local 검색 결과 중 장소명에 키워드가 포함된 항목을 Kakao 장소 ID로 중복 제거합니다. 무인발급 장소는 제외하며, PO3 또는 지정 행정기관 카테고리 경로는 핀 색 구분에 사용합니다.")
    @GetMapping("/search")
    public Mono<KakaoLocalSearchResultDto> searchCenters(
            @RequestParam("sidoCode") String sidoCode,
            @RequestParam(value = "sigunguCode", required = false) String sigunguCode) {
        return kakaoLocalSearchService.search(sidoCode, sigunguCode);
    }

}
