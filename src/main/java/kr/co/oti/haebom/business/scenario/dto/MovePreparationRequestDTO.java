package kr.co.oti.haebom.business.scenario.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MovePreparationRequestDTO {
	// 가상 세대 구성원 목록
    private List<MoveFamilyMemberDTO> familyMembers;

}
