package kr.co.oti.haebom.system.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.business.admin.controller.AdminAccountApiController;
import kr.co.oti.haebom.business.admin.controller.AdminDashboardApiController;
import kr.co.oti.haebom.business.admin.controller.AdminMemberApiController;
import kr.co.oti.haebom.business.admin.controller.AdminScenarioApiController;
import kr.co.oti.haebom.business.inquiry.controller.InquiryApiController;

/**
 * 관리자/문의 REST API에서 발생하는 비즈니스 상태 예외 및 유효성 검증 예외를
 * 프론트엔드가 기대하는 HTTP 상태 코드와 텍스트 메시지로 일관되게 응답합니다.
 */
@RestControllerAdvice(assignableTypes = {
		AdminAccountApiController.class,
		AdminMemberApiController.class,
		AdminScenarioApiController.class,
		AdminDashboardApiController.class,
		InquiryApiController.class
})
public class AdminInquiryExceptionHandler {

	/**
	 * 서비스 계층의 {@link ResponseStatusException}(401, 403, 404, 409 등)을 상태 코드와 메시지로 변환합니다.
	 */
	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<String> handleResponseStatus(ResponseStatusException e) {
		String message = (e.getReason() != null) ? e.getReason() : e.getStatus().getReasonPhrase();
		return ResponseEntity.status(e.getStatus()).body(message);
	}

	/**
	 * 입력값 검증 실패({@link IllegalArgumentException}) 시 400 Bad Request와 사유를 반환합니다.
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
		String message = (e.getMessage() != null && !e.getMessage().isBlank())
				? e.getMessage()
				: "요청 값이 올바르지 않습니다.";
		return ResponseEntity.badRequest().body(message);
	}
}
