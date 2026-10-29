package kr.co.oti.haebom.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MyPageInquiryItemDTO {

	private Integer qnaId;
    private String qnaTitle;
    private String qnaCategoryName;
    private String qnaStatus;
    private LocalDateTime qnaCreatedAt;
}
