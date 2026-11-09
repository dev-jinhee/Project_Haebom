package kr.co.oti.haebom.business.main.dto;

import java.util.List;

import kr.co.oti.haebom.business.main.dto.Gov24PolicyResponseDTO.Policy;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PolicySearchPageDTO {
	
    private List<Policy> items;
    private int page;
    private int size;
    private long totalCount;
    private int totalPages;
}
