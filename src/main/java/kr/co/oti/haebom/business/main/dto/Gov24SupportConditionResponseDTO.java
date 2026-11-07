package kr.co.oti.haebom.business.main.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class Gov24SupportConditionResponseDTO {
    private List<SupportCondition> data;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SupportCondition {
        @JsonAlias("서비스ID")
        private String serviceId;

        @JsonAlias("JA0110")
        private Integer ageStart;

        @JsonAlias("JA0111")
        private Integer ageEnd;

        @JsonAlias("JA0403")
        private String singleParentOrGrandparent;

        @JsonAlias("JA0404")
        private String onePersonHousehold;

        @JsonAlias("JA0411")
        private String multiChildHousehold;

        @JsonAlias("JA0412")
        private String noHomeHousehold;

        @JsonAlias("JA0413")
        private String newResidentHousehold;
    }
}
