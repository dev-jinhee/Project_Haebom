package kr.co.oti.haebom.business.member.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FindIdSendRequestDTO {
	
	@NotBlank
	@Size(max = 20)
	private String memberName;
	
	@NotBlank
	@Email
	@Size(max = 50)
	private String email;
}
