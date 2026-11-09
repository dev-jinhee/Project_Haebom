package kr.co.oti.haebom.business.main.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.business.main.dto.PolicySearchPageDTO;
import kr.co.oti.haebom.business.main.service.PublicPolicyService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Tag(name = "메인페이지 공공서비스", description = "분야별 공공서비스 정책 검색 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main/policies")
public class PublicPolicyApiController {
    private final PublicPolicyService publicPolicyService;

    @Operation(
        summary = "분야별 공공서비스 검색",
        description = "검색어와 정책 분야로 공공서비스를 검색하고 페이지당 5건씩 반환합니다."
    )
    @GetMapping
    public Mono<PolicySearchPageDTO> searchPolicies(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "ALL") String category,
            @RequestParam(defaultValue = "1") int page) {
        return publicPolicyService.search(keyword, category, page);
    }
}
