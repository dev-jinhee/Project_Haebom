package kr.co.oti.haebom.business.member.dto;

import java.time.LocalDate;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
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
	@Size(min = 8, max = 20)
	@Pattern(regexp = "^[^><_\"'-]+$")
	private String password;
	
	@NotBlank
	@Email
	@Size(max = 50)
	private String email;
	
	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate birthDate;
	
	@Pattern(regexp = "^[MF]$")
	private String gender;
	
	@NotNull
    @AssertTrue
	private Boolean termsAgreed;
	
}
