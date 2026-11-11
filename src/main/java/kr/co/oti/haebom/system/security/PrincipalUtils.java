package kr.co.oti.haebom.system.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

/**
 * 인증 주체({@link MemberPrincipal})에서 로그인 사용자 ID와 권한을 안전하게 검증하는 유틸리티입니다.
 */
public final class PrincipalUtils {

	private static final String ROLE_ADMIN = "ROLE_ADMIN";

	private PrincipalUtils() {
	}

	/**
	 * 인증된 사용자의 회원 ID를 반환합니다. 미인증 상태면 401 UNAUTHORIZED를 던집니다.
	 */
	public static int requireMemberId(MemberPrincipal principal) {
		if (principal == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요한 서비스입니다.");
		}
		Integer memberId = principal.getMemberId();
		if (memberId == null || memberId <= 0) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요한 서비스입니다.");
		}
		return memberId;
	}

	/**
	 * 현재 인증 사용자가 관리자 권한(ROLE_ADMIN)을 보유했는지 확인합니다.
	 */
	public static boolean isAdmin(MemberPrincipal principal) {
		if (principal == null || principal.getAuthorities() == null) {
			return false;
		}
		for (GrantedAuthority authority : principal.getAuthorities()) {
			if (authority != null && ROLE_ADMIN.equals(authority.getAuthority())) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 인증된 관리자의 회원 ID를 반환합니다. 미인증이면 401, 관리자 권한이 없으면 403을 던집니다.
	 */
	public static int requireAdminId(MemberPrincipal principal) {
		int memberId = requireMemberId(principal);
		if (!isAdmin(principal)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 필요합니다.");
		}
		return memberId;
	}
}
