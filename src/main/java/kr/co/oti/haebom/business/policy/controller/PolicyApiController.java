package kr.co.oti.haebom.business.policy.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.oti.haebom.business.policy.dto.PolicyDTO;
import kr.co.oti.haebom.business.policy.service.PolicyService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyApiController {

    private final PolicyService policyService;

    /*
     * 시나리오 및 주소(지역) 맞춤 공공서비스 정책 추천 API
     * GET /api/policies/recommend?scenario=move&progressId=123
     * GET /api/policies/recommend?scenario=move&region=수영구
     * GET /api/policies/recommend?scenario=identity_reissue
     */
    @GetMapping("/recommend")
    public ResponseEntity<List<PolicyDTO>> getRecommendedPolicies(
            @RequestParam(name = "scenario", defaultValue = "move") String scenario,
            @RequestParam(name = "progressId", required = false) Integer progressId,
            @RequestParam(name = "region", required = false) String region) {

        List<PolicyDTO> policies = policyService.getRecommendedPolicies(scenario, progressId, region);
        return ResponseEntity.ok(policies);
    }
}
