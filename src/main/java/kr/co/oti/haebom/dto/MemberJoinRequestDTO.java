package kr.co.oti.haebom.dto;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MemberJoinRequestDTO {
	
	@NotBlank
	@Size(max = 20)
	private String memberName;
	
	@NotBlank
	@Size(min = 7, max = 15, message = "아이디는 7자 이상 15자 이하로 입력해 주세요.")
	@Pattern(regexp = "^[a-zA-Z0-9]+$", message = "아이디는 영문 대소문자와 숫자만 사용할 수 있습니다.")
	private String loginId;
	
	@NotBlank
	@Size(min = 8, max = 20, message = "비밀번호는 8자 이상 20자 이하로 입력해 주세요.")
	@Pattern(regexp = "^[a-zA-Z0-9]+$", message = "비밀번호는 영문 대소문자와 숫자만 사용할 수 있습니다.")
	private String password;
	
	@NotBlank
	@Email
	@Size(max = 50)
	private String email;
	
	@NotBlank
	@Pattern(regexp = "^[0-9]{6}$", message = "주민등록번호 또는 외국인등록번호 앞 6자리를 입력해 주세요.")
	private String registrationNumberFront;
	
	@NotBlank
	@Pattern(regexp = "^[1-8]$", message = "주민등록번호 또는 외국인등록번호의 뒤 첫 숫자를 확인해 주세요.")
	private String registrationNumberBackFirstDigit;
	
	@NotNull
    @AssertTrue(message = "필수 약관에 동의해 주세요.")
	private Boolean termsAgreed;
	
}
