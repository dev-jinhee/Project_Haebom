package kr.co.oti.haebom.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
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
	@Size(min = 8, max = 20)
	@Pattern(regexp = "^[^><_\"'-]+$")
	private String newPassword;
	
	@NotBlank
	private String passwordConfirm;
}
