package kr.co.oti.haebom.business.member.dto;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MemberJoinRequestDTO {
	
	@NotBlank
	@Size(max = 20)
	@Pattern(regexp = "^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z ]+$")
	private String memberName;
	
	@NotBlank
	@Size(min = 4, max = 16)
	@Pattern(regexp = "^[a-zA-Z0-9]+$")
	private String loginId;
	
	@NotBlank
	@Size(max = 240)
	private String password;

	@AssertTrue(message = "비밀번호는 8~20자로 입력해 주세요. 사용할 수 없는 특수문자가 포함되어 있는지도 확인해 주세요.")
	public boolean isPasswordPolicyValid() {
		if (password == null || password.isBlank()) {
			return true; // @NotBlank에서 처리
		}

		try {
			String decodedPassword = URLDecoder.decode(password, StandardCharsets.UTF_8.name());
			return decodedPassword.length() >= 8
					&& decodedPassword.length() <= 20
					&& !decodedPassword.matches(".*[><_\"'-].*");
		} catch (Exception e) {
			return false;
		}
	}
	
	@NotBlank
	@Email
	@Size(max = 50)
	private String email;
	
	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	@PastOrPresent(message = "오늘 이후 날짜는 입력할 수 없습니다.")
	private LocalDate birthDate;
	
	@Pattern(regexp = "^[MF]$")
	private String gender;
	
	@NotNull
    @AssertTrue
	private Boolean termsAgreed;
	
}
