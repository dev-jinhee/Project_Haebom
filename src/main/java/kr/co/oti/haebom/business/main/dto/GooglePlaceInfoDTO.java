package kr.co.oti.haebom.business.main.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GooglePlaceInfoDTO {
	
    private String placeName;
    private String formattedAddress;
    private String phoneNumber;
    private String websiteUri;
    private List<String> weekdayDescriptions;
    private String googleMapsUri;
}
