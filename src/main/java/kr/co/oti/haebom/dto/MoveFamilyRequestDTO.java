package kr.co.oti.haebom.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MoveFamilyRequestDTO {
	private List<FamilyMember> familyMembers;

    private Integer remainingHeadFamilyId;

    private String remainingHeadPhoneNum;

    @Getter
    @NoArgsConstructor
    public static class FamilyMember {

        private Integer familyId;

        private String moveStatus;

        private String relationship;

        private Boolean isHouseholdHead;
    }
}
