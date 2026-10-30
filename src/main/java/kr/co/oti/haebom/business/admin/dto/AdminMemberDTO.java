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
public class AdminMemberDTO {
	
	private Integer memberId; // 회원 고유 번호
	private String loginId; // 로그인 아이디
	private String email; // 이메일
	private String memberName; // 회원 이름
	private LocalDateTime birthDate; // 생년월일
	private String gender; // 성별 (M / F)
	private String role; // 권한 (USER / ADMIN)
	private String memberStatus; // 계정 상태 (ACTIVE / SUSPENDED / WITHDRAWN)
	private LocalDateTime createdAt; // 가입 일시
	private LocalDateTime withdrawnAt; // 탈퇴 일시
}