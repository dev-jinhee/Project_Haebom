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
     * 시나리오 맞춤 공공서비스 정책 추천 API
     * GET /api/policies/recommend?scenario=move
     * GET /api/policies/recommend?scenario=id-card
     */
    @GetMapping("/recommend")
    public ResponseEntity<List<PolicyDTO>> getRecommendedPolicies(
            @RequestParam(name = "scenario", defaultValue = "move") String scenario) {
        
        List<PolicyDTO> policies = policyService.getRecommendedPolicies(scenario);
        return ResponseEntity.ok(policies);
    }
}
