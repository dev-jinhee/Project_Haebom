package kr.co.oti.haebom.business.member.dto;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PasswordResetRequestDTO {

	@NotBlank
	@Size(min = 4, max = 16)
	private String loginId;
	
	@NotBlank
	@Email
	@Size(max = 50)
	private String email;
	
	@NotBlank
	@Size(max = 240)
	private String newPassword;

	@AssertTrue(message = "비밀번호는 8~20자로 입력해 주세요. 사용할 수 없는 특수문자가 포함되어 있는지도 확인해 주세요.")
	public boolean isNewPasswordPolicyValid() {
		if (newPassword == null || newPassword.isBlank()) {
			return true; // @NotBlank에서 처리
		}

		try {
			String decodedPassword = URLDecoder.decode(newPassword, StandardCharsets.UTF_8.name());
			return decodedPassword.length() >= 8
					&& decodedPassword.length() <= 20
					&& !decodedPassword.matches(".*[><_\"'-].*");
		} catch (Exception e) {
			return false;
		}
	}
	
	@NotBlank
	private String passwordConfirm;
}
