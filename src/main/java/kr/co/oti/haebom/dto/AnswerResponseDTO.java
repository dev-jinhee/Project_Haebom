package kr.co.oti.haebom.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnswerResponseDTO {

    private Integer answerId;
    private Integer progressId;
    private Integer stepId;
    private String fieldKey;
    private String answerValue;
}