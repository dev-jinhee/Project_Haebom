package kr.co.oti.haebom.business.main.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdministrativeCenterDTO {
    
	private int centerId;
    private String sido;
    private String sigungu;
    private String centerName;
    private String postalCode;
    private String address;
    private Double latitude;
    private Double longitude;
}
