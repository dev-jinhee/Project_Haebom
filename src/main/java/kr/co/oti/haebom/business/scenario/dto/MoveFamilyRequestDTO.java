package kr.co.oti.haebom.business.scenario.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MoveFamilyRequestDTO {
	private List<FamilyMember> familyMembers;

    private Integer remainingHeadFamilyId;

    private String remainingHeadPhoneNum;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class FamilyMember {

        private Integer familyId;

        private String moveStatus;
        
        private String phoneNum;

        private String relationship;

        private Boolean isHouseholdHead;
    }
}
