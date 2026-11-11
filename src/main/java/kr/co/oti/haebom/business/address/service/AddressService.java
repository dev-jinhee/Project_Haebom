package kr.co.oti.haebom.business.address.service;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AddressService {
	private final WebClient webClient;

	@Value("${juso.confirm-key}")
	private String jusoConfirmKey;

	public Mono<String> searchAddress(String keyword, int currentPage) {
		if (keyword == null || keyword.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "주소 검색어를 입력해 주세요.");
		}

		if (currentPage < 1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "페이지 번호는 1 이상이어야 합니다.");
		}

		URI uri = UriComponentsBuilder
                .fromHttpUrl("https://business.juso.go.kr/addrlink/addrLinkApi.do")
                .queryParam("keyword", keyword)
                .queryParam("currentPage", currentPage)
                .queryParam("countPerPage", 10)
                .queryParam("confmKey", jusoConfirmKey)
                .queryParam("resultType", "json")
                .queryParam("addInfoYn", "Y")
                .build()
                .encode()
                .toUri();
		
		// WebClient를 사용하지만 호출 스레드는 대기
        return webClient.get()
                .uri(uri)
                .retrieve()
                .bodyToMono(String.class)
                .switchIfEmpty(Mono.error(
                        new IllegalStateException("도로명주소 조회에 실패했습니다.")
                ));
	}
}
