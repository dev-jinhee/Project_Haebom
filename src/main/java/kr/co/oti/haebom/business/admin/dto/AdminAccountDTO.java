package kr.co.oti.haebom.business.admin.dto;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

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
	@NotBlank
	@Size(min = 4, max = 16)
	@Pattern(regexp = "^[a-zA-Z0-9_]+$")
	private String loginId; // 관리자 로그인 아이디
	@NotBlank
	@Size(max = 240)
	private String password; // 관리자 비밀번호 (등록 시 사용)

	@AssertTrue(message = "비밀번호는 8~20자로 입력해 주세요. 사용할 수 없는 특수문자가 포함되어 있는지도 확인해 주세요.")
	public boolean isPasswordPolicyValid() {
		if (password == null || password.isBlank()) {
			return true; // @NotBlank에서 처리
		}

		try {
			String decodedPassword = URLDecoder.decode(password, StandardCharsets.UTF_8.name());
			return decodedPassword.length() >= 8
					&& decodedPassword.length() <= 20
					&& !decodedPassword.matches(".*[><_\\\"'-].*");
		} catch (Exception e) {
			return false;
		}
	}
	@NotBlank(message = "관리자 이름을 입력해 주세요.")
	@Size(max = 20, message = "관리자 이름은 20자 이내로 입력해 주세요.")
	@Pattern(regexp = "^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z() ]+$", message = "관리자 이름에는 한글, 영문, 괄호, 공백만 사용할 수 있습니다.")
	private String memberName; // 관리자 이름 (예: 박해봄 (총괄))
	@NotBlank(message = "이메일을 입력해 주세요.")
	@Email(message = "올바른 이메일 주소를 입력해 주세요.")
	@Size(max = 50, message = "이메일은 50자 이내로 입력해 주세요.")
	@Pattern(regexp = "^[A-Za-z0-9_%+-]+(?:\\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+[A-Za-z]{2,}$", message = "올바른 이메일 주소를 입력해 주세요.")
	private String email; // 관리자 이메일
	private String role; // 권한 (ADMIN)
	private String memberStatus; // 계정 상태 (ACTIVE: 정상, SUSPENDED: 정지)
	private LocalDateTime createdAt; // 계정 생성일시
}
