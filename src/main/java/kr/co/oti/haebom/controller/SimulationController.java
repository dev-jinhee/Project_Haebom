package kr.co.oti.haebom.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;

@Controller
@RequestMapping("/simulation")
public class SimulationController {
	
	 // 시나리오 ID별 JSP 폴더
    private static final Map<Integer, String> SCENARIO_VIEWS = Map.of(
        1, "move"
        // 주민등록증 재발급 추가 시 실제 ID와 "identity" 등록
    );
    
	@GetMapping
    public String simulationPage() {
        return "scenario/simulation";
    }

	// 단계별 JSP 반환
	@GetMapping("/fragment/{scenarioId}/{stepOrder}")
	public String getStepFragment(
	        @PathVariable Integer scenarioId,
	        @PathVariable Integer stepOrder) {

		// 시나리오에 맞는 JSP 폴더 확인
        String viewFolder = SCENARIO_VIEWS.get(scenarioId);
        
        if (viewFolder == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "지원하지 않는 시나리오입니다."
            );
        }
     // 단계별 JSP 반환
        return "scenario/" + viewFolder
                + "/step-" + stepOrder;
	}
	// 시뮬레이션 완료 화면 반환
	@GetMapping("/fragment/{scenarioId}/complete")
	public String getCompleteFragment(
	        @PathVariable("scenarioId") Integer scenarioId) {

	    if (!SCENARIO_VIEWS.containsKey(scenarioId)) {
	        throw new ResponseStatusException(
	            HttpStatus.NOT_FOUND,
	            "지원하지 않는 시나리오입니다."
	        );
	    }

	    return "scenario/common/step-complete";
	}
}