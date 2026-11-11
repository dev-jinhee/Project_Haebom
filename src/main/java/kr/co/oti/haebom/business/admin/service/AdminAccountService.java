package kr.co.oti.haebom.business.admin.service;

import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.business.admin.dto.AdminAccountDTO;
import kr.co.oti.haebom.business.admin.mapper.AdminAccountMapper;
import lombok.RequiredArgsConstructor;

/*
 * 관리자 계정 관리 서비스 (예외 상태코드 세분화 적용: 409 Conflict, 403 Forbidden)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AdminAccountService {

	private static final Set<String> ALLOWED_ADMIN_STATUSES = Set.of("ACTIVE", "SUSPENDED");

	private final AdminAccountMapper adminAccountMapper;
	private final AdminDashboardService adminDashboardService;
	private final PasswordEncoder passwordEncoder;
	
	// 1. 관리자 계정 전체 목록 조회
	@Transactional(readOnly = true)
	public List<AdminAccountDTO> getAdminList() {
		return adminAccountMapper.selectAdminList();
	}
	
	// 2. 새 관리자 계정 등록
	public void createAdmin(AdminAccountDTO dto, int currentAdminId) {
		if (currentAdminId <= 0) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "관리자 인증 정보가 유효하지 않습니다.");
		}
		if (dto == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자 계정 정보가 올바르지 않습니다.");
		}
		if (dto.getLoginId() == null || dto.getLoginId().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자 아이디를 입력해주세요.");
		}
		if (dto.getPassword() == null || dto.getPassword().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호를 입력해주세요.");
		}
		if (dto.getMemberName() == null || dto.getMemberName().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "관리자 이름을 입력해주세요.");
		}
		if (dto.getEmail() == null || dto.getEmail().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이메일을 입력해주세요.");
		}

		dto.setLoginId(dto.getLoginId().trim());
		dto.setMemberName(dto.getMemberName().trim());
		dto.setEmail(dto.getEmail().trim());

		// 1) 아이디 중복 검사 (409 Conflict)
		if (adminAccountMapper.countByLoginId(dto.getLoginId()) > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 관리자 아이디입니다.");
		}
		// 1-1) 이메일 중복 검사 (409 Conflict)
		if (adminAccountMapper.countByEmail(dto.getEmail()) > 0) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 등록된 이메일 주소입니다.");
		}
		
		// 2) 비밀번호 BCrypt 암호화 (보안 표준)
		dto.setPassword(passwordEncoder.encode(dto.getPassword()));
		
		// 3) DB 저장
		adminAccountMapper.insertAdmin(dto);
		
		// 4) 관리자 활동 로그 기록
		adminDashboardService.recordActivity(currentAdminId, "ADMIN", "CREATE", dto.getMemberId());
	}
	
	// 3. 관리자 계정 상태 변경 (ACTIVE: 정상 / SUSPENDED: 이용 정지)
	public void updateAdminStatus(int targetAdminId, String status, int currentAdminId) {
		if (currentAdminId <= 0) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "관리자 인증 정보가 유효하지 않습니다.");
		}
		if (targetAdminId <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 관리자 번호가 아닙니다.");
		}
		if (status == null || status.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "변경할 계정 상태를 입력해주세요.");
		}
		String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
		if (!ALLOWED_ADMIN_STATUSES.contains(normalizedStatus)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "허용되지 않은 관리자 계정 상태입니다.");
		}

		// [보안 방어 1] 1번 최고 관리자(admin) 계정은 비활성화/정지 불가! (403 Forbidden)
		if (targetAdminId == 1) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "최고 관리자(admin) 계정은 상태를 변경할 수 없습니다.");
		}
		
		// [보안 방어 2] 현재 로그인한 관리자 본인 계정 비활성화 불가! (403 Forbidden)
		if (targetAdminId == currentAdminId && !"ACTIVE".equals(normalizedStatus)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "현재 로그인 중인 본인 계정은 정지할 수 없습니다.");
		}
		
		int updatedRows = adminAccountMapper.updateAdminStatus(targetAdminId, normalizedStatus);
		if (updatedRows != 1) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 관리자 계정입니다.");
		}
		adminDashboardService.recordActivity(currentAdminId, "ADMIN", "UPDATE", targetAdminId);
	}
}
