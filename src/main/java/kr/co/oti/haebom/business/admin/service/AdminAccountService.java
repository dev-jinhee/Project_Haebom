package kr.co.oti.haebom.business.admin.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.business.admin.dto.AdminAccountDTO;
import kr.co.oti.haebom.business.admin.mapper.AdminAccountMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminAccountService {

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
		// 1) 아이디 중복 검사
		if (adminAccountMapper.countByLoginId(dto.getLoginId()) > 0) {
			throw new IllegalArgumentException("이미 사용 중인 관리자 아이디입니다.");
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
		// [보안 방어 1] 1번 최고 관리자(admin) 계정은 비활성화/정지 불가!
		if (targetAdminId == 1) {
			throw new IllegalArgumentException("최고 관리자(admin) 계정은 상태를 변경할 수 없습니다.");
		}
		
		// [보안 방어 2] 현재 로그인한 관리자 본인 계정 비활성화 불가!
		if (targetAdminId == currentAdminId && !"ACTIVE".equals(status)) {
			throw new IllegalArgumentException("현재 로그인 중인 본인 계정은 정지할 수 없습니다.");
		}
		
		adminAccountMapper.updateAdminStatus(targetAdminId, status);
		adminDashboardService.recordActivity(currentAdminId, "ADMIN", "UPDATE", targetAdminId);
	}
}
