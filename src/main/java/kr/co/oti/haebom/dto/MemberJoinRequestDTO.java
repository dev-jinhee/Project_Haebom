package kr.co.oti.haebom.dto;

import java.time.LocalDate;

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
	
	@NotBlank(message = "이름을 입력해 주세요.")
	@Size(max = 20, message = "이름은 20자 이내로 입력해 주세요.")
	@Pattern(regexp = "^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z ]+$", message = "이름은 한글, 영문, 공백만 입력할 수 있습니다")
	private String memberName;
	
	@NotBlank(message = "아이디를 입력해 주세요.")
	@Size(min = 4, max = 16, message = "아이디는 4~16자로 입력해 주세요.")
	@Pattern(regexp = "^[a-zA-Z0-9]+$", message = "아이디는 영문 대소문자와 숫자만 입력해 주세요.")
	private String loginId;
	
	@NotBlank(message = "비밀번호를 입력해 주세요.")
	@Size(min = 8, max = 20, message = "비밀번호는 8~20자로 입력해 주세요.")
	@Pattern(regexp = "^[^><_\"'-]+$", message = "사용할 수 없는 특수문자가 포함되어 있습니다.")
	private String password;
	
	@NotBlank(message = "이메일을 입력해 주세요.")
	@Email(message = "올바른 이메일 주소를 입력해 주세요.")
	@Size(max = 50, message = "이메일은 50자 이내로 입력해 주세요.")
	private String email;
	
	private LocalDate birthDate;
	
	@Pattern(regexp = "^[MF]$", message = "성별은 M 또는 F여야 합니다.")
	private String gender;
	
	@NotNull(message = "필수 약관 동의 여부를 입력해 주세요.")
    @AssertTrue(message = "필수 약관에 동의해 주세요.")
	private Boolean termsAgreed;
	
}
