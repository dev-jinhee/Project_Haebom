package kr.co.oti.haebom.business.scenario.dto;

import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnswerSaveRequestListDTO {
	
	@NotNull
	private List<@Valid AnswerSaveRequestDTO> answers;

	@Getter
	@Setter
	public static class AnswerSaveRequestDTO {
		@NotNull
		private Integer stepId;
		@NotBlank
		@Size(max = 100)
		private String fieldKey;
		@NotBlank
		private String answerValue;
	}
}
