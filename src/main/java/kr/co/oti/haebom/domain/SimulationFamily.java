package kr.co.oti.haebom.domain;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationFamily {

    private Integer familyId;
    private Integer progressId;

    private String familyName;
    private LocalDate birthDate;
    private String gender;
    private String phoneNum;
    private Boolean isApplicant;
    private Boolean isOriginalHead;
    private String originalRelationship;
    private String relationship;
    private Boolean isHouseholdHead;
    private String moveStatus;
}