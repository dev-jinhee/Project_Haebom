package kr.co.oti.haebom.business.admin.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAccountDTO {
	
	private Integer memberId; // 관리자 고유 번호 (PK)
	private String loginId; // 관리자 로그인 아이디
	private String password; // 관리자 비밀번호 (등록 시 사용)
	private String memberName; // 관리자 이름 (예: 박해봄 (총괄))
	private String email; // 관리자 이메일
	private String role; // 권한 (ADMIN)
	private String memberStatus; // 계정 상태 (ACTIVE: 정상, SUSPENDED: 정지)
	private LocalDateTime createdAt; // 계정 생성일시
}
