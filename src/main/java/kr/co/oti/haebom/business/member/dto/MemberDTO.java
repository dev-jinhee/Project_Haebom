package kr.co.oti.haebom.business.member.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MemberDTO {

	private Integer memberId;
	private String memberName;
	private String loginId;
	private String password;
	private LocalDate birthDate;
	private String gender;
	private String email;
	private String role;
	private String memberStatus;
	
	
	
}
