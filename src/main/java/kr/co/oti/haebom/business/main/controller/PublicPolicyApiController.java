package kr.co.oti.haebom.business.main.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.business.main.dto.Gov24PolicyResponseDTO.Policy;
import kr.co.oti.haebom.business.main.service.PublicPolicyService;
import lombok.RequiredArgsConstructor;

@Tag(name = "메인페이지 공공서비스", description = "정부24 공공서비스 검색 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main/policies")
public class PublicPolicyApiController {
    private final PublicPolicyService publicPolicyService;

    @Operation(summary = "공공서비스 정책 검색", description = "검색어와 분야·연령대·가구 유형 조건으로 공공서비스를 조회합니다.")
    @GetMapping
    public List<Policy> searchPolicies(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) String serviceField,
            @RequestParam(required = false) String ageGroup,
            @RequestParam(required = false) String householdType) {
        return publicPolicyService.search(keyword, serviceField, ageGroup, householdType);
    }
}
