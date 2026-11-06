package kr.co.oti.haebom.business.inquiry.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MyPageScenarioHistoryPageDTO {

	private List<MyPageScenarioHistoryDTO> items;
    private int page;
    private int size;
    private long totalCount;
    private int totalPages;
}
