package kr.co.oti.haebom.business.scenario.dto;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
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

		// 프론트의 encodeURIComponent 값을 자바단에서 자동으로 안전 복원~!
		public void setAnswerValue(String answerValue) {
			if (answerValue != null) {
				try {
					this.answerValue = URLDecoder.decode(answerValue, StandardCharsets.UTF_8.name());
				} catch (Exception e) {
					this.answerValue = answerValue;
				}
			} else {
				this.answerValue = null;
			}
		}
	}
}