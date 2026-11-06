package kr.co.oti.haebom.business.scenario.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 시뮬레이션 API 공통 예외 처리
 */
@RestControllerAdvice(
    basePackages = "kr.co.oti.haebom.business.scenario.controller"
)
public class SimulationExceptionHandler {

    /**
     * 사용자 입력값 검증 실패 → 400 Bad Request
     */
    @ExceptionHandler(SimulationValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(
            SimulationValidationException e) {

        Map<String, String> response = Map.of(
            "message", e.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }
}