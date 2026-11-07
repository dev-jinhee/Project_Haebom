package kr.co.oti.haebom.business.main.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
        @JsonAlias("서비스ID")
        private String serviceId;

        @JsonAlias("서비스명")
        private String serviceName;

        @JsonAlias("서비스목적요약")
        private String summary;

        @JsonAlias("지원대상")
        private String target;

        @JsonAlias("신청기한")
        private String applicationDeadline;

        @JsonAlias("소관기관명")
        private String agencyName;

        @JsonAlias("상세조회URL")
        private String detailUrl;
    }
}
