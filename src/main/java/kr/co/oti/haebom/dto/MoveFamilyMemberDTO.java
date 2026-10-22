package kr.co.oti.haebom.dto;

import java.time.LocalDate;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MoveFamilyMemberDTO {
	@NotBlank
	private String familyName;

	@NotNull
	private LocalDate birthDate;

	@NotBlank
	private String gender;

	@NotNull
	private Boolean isApplicant;

	@NotNull
	private Boolean isOriginalHead;

	@NotBlank
	private String originalRelationship;

}
