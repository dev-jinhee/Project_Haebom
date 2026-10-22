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
	
	// 시나리오 코드별 JSP 폴더
    private static final Map<String, String> SCENARIO_VIEWS = Map.of(
        "MOVE", "move",
        "IDENTITY_REISSUE", "identity"
    );
    
	@GetMapping
    public String simulationPage() {
        return "scenario/simulation";
    }

	// 단계별 JSP 반환
	@GetMapping("/fragment/{scenarioCode}/{stepOrder}")
	public String getStepFragment(
	        @PathVariable("scenarioCode") String scenarioCode,
	        @PathVariable("stepOrder") Integer stepOrder) {

		// 시나리오에 맞는 JSP 폴더 확인
        String viewFolder = SCENARIO_VIEWS.get(scenarioCode);
        
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
	@GetMapping("/fragment/{scenarioCode}/complete")
	public String getCompleteFragment(
	        @PathVariable("scenarioCode") String scenarioCode) {

	    if (!SCENARIO_VIEWS.containsKey(scenarioCode)) {
	        throw new ResponseStatusException(
	            HttpStatus.NOT_FOUND,
	            "지원하지 않는 시나리오입니다."
	        );
	    }

	    return "scenario/common/step-complete";
	}
}