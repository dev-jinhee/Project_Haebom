package kr.co.oti.haebom.business.scenario.exception;

public class SimulationValidationException extends IllegalArgumentException {
	// 오류 메시지만 전달
	public SimulationValidationException(String message) {
		super(message);
	}

	// 오류 메시지와 원인이 된 예외를 함께 전달
	public SimulationValidationException(String message, Throwable cause) {
		super(message, cause);
	}
}
