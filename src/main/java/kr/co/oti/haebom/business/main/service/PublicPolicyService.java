package kr.co.oti.haebom.business.main.service;

import java.net.URI;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import kr.co.oti.haebom.business.main.dto.Gov24PolicyResponseDTO;
import kr.co.oti.haebom.business.main.dto.Gov24PolicyResponseDTO.Policy;

@Service
public class PublicPolicyService {
    
	private static final String API_URL = "https://api.odcloud.kr/api/gov24/v3/serviceList";

    private final String serviceKey;
    private final RestTemplate restTemplate = new RestTemplate();

    public PublicPolicyService(@Value("${gov24.api.service-key}") String serviceKey) {
        this.serviceKey = serviceKey;
    }

    public List<Policy> search(String keyword) {
        
    	if (!StringUtils.hasText(keyword)) {
            return Collections.emptyList();
        }
        
    	if (!StringUtils.hasText(serviceKey)) {
            throw new IllegalStateException("정부24 API 인증키가 설정되지 않았습니다.");
        }

        URI uri = UriComponentsBuilder.fromHttpUrl(API_URL)
                .queryParam("serviceKey", serviceKey)
                .queryParam("page", 1)
                .queryParam("perPage", 10)
                .queryParam("returnType", "JSON")
                .queryParam("cond[서비스명::LIKE]", keyword.trim())
                .build()
                .encode()
                .toUri();

        try {
            Gov24PolicyResponseDTO response =
                    restTemplate.getForObject(uri, Gov24PolicyResponseDTO.class);
            if (response == null || response.getData() == null) {
                return Collections.emptyList();
            }
            return response.getData();
        } catch (RestClientException e) {
            throw new IllegalStateException(
                    "정부24 공공서비스 조회에 실패했습니다.", e);
        }
    }
}
