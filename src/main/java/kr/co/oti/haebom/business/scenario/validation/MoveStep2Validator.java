package kr.co.oti.haebom.business.scenario.validation;

import java.util.Map;

import org.springframework.stereotype.Component;

import kr.co.oti.haebom.business.scenario.exception.SimulationValidationException;

@Component
public class MoveStep2Validator implements StepValidator {

	@Override
	public boolean supports(String scenarioCode, Integer stepOrder) {
		// 현재 시나리오와 단계가 validator의 담당인지 확인
		// 현재 시나리오가 MOVE시나리오의 2단계인지 확인
		return "MOVE".equals(scenarioCode) && Integer.valueOf(2).equals(stepOrder);
	}

	@Override
	public void validate(Map<String, String> answers) {
		// moveReson이 other인 경우 moveReasonDetail필수
		String moveReason = answers.get("moveReason");
	    String moveReasonDetail = answers.get("moveReasonDetail");
	    
	    if("OTHER".equals(moveReason) && (moveReasonDetail == null || moveReasonDetail.isBlank())) {
	    	throw new SimulationValidationException(
	    		    "기타 전입 사유를 입력하지 않았습니다."
	    		);
	    }
	   if(!"OTHER".equals(moveReason) && moveReasonDetail != null) {
		   throw new SimulationValidationException(
	    		    "기타 전입 사유는 기타를 선택하였을 때만 입력가능합니다."
	    		);
	   }
	}
}
