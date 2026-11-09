package kr.co.oti.haebom.business.address.service;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddressService {

	@Value("${juso.confirm-key}")
	private String jusoConfirmKey;

	public String searchAddress(String keyword, int currentPage) {
		if (keyword == null || keyword.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"주소 검색어를 입력해 주세요.");
		}

		if (currentPage < 1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"페이지 번호는 1 이상이어야 합니다.");
		}

		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl("https://business.juso.go.kr/addrlink/addrLinkApi.do").queryParam("keyword", keyword)
				.queryParam("currentPage", currentPage).queryParam("countPerPage", 10)
				.queryParam("confmKey", jusoConfirmKey).queryParam("resultType", "json").queryParam("addInfoYn", "Y");
		URI uri = builder.build().encode().toUri();
		RestTemplate restTemplate = new RestTemplate();
		String response = restTemplate.getForObject(uri, String.class);
		if (response == null) {
			throw new IllegalStateException("도로명주소 조회에 실패했습니다.");
		}
		return response;
	}
}
