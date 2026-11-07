package kr.co.oti.haebom.business.main.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class Gov24PolicyResponseDTO {
    private int page;
    private int perPage;
    private long totalCount;
    private List<Policy> data;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Policy {
        @JsonProperty("서비스ID")
        private String serviceId;

        @JsonProperty("서비스명")
        private String serviceName;

        @JsonProperty("서비스목적요약")
        private String summary;

        @JsonProperty("지원대상")
        private String target;

        @JsonProperty("신청기한")
        private String applicationDeadline;

        @JsonProperty("소관기관명")
        private String agencyName;

        @JsonProperty("상세조회URL")
        private String detailUrl;
    }
}
