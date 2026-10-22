package kr.co.oti.haebom.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.oti.haebom.dto.AdminScenarioDTO;
import kr.co.oti.haebom.dto.AdminScenarioDetailStatsDTO;
import kr.co.oti.haebom.service.AdminScenarioService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/scenarios")
@RequiredArgsConstructor
public class AdminScenarioApiController {

    // 주방장 호출!
    private final AdminScenarioService adminScenarioService;

    // 1. 관리자용 전체 시나리오 목록 조회 (GET /api/admin/scenarios)
    @GetMapping
    public ResponseEntity<List<AdminScenarioDTO>> getScenarioList() {
        List<AdminScenarioDTO> scenarios = adminScenarioService.getScenarioList();
        return ResponseEntity.ok(scenarios);
    }

    // 2. 관리자용 시나리오 정보 및 운영 상태 수정 (PUT /api/admin/scenarios/{scenarioId})
    @PutMapping("/{scenarioId}")
    public ResponseEntity<String> updateScenario(
            @PathVariable Integer scenarioId,
            @RequestBody AdminScenarioDTO scenarioDTO) {
        
        scenarioDTO.setScenarioId(scenarioId);
        adminScenarioService.updateScenario(scenarioDTO);
        
        return ResponseEntity.ok("시나리오 정보가 성공적으로 수정되었습니다.");
    }
    
    // 3. 관리자용 시나리오 상세 통계 조회 (GET /api/admin/scenarios/{scenarioId}/stats)
    @GetMapping("/{scenarioId}/stats")
    public ResponseEntity<AdminScenarioDetailStatsDTO> getScenarioDetailStats(
            @PathVariable Integer scenarioId) {
        AdminScenarioDetailStatsDTO stats = adminScenarioService.getScenarioDetailStats(scenarioId);
        return ResponseEntity.ok(stats);
    }
}