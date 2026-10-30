package kr.co.oti.haebom.business.scenario.dto;

import java.time.LocalDate;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MoveFamilyMemberDTO {
	@NotBlank
	private String familyName;

	@NotNull
	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
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
