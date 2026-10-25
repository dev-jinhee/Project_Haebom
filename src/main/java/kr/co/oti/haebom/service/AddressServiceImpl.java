package kr.co.oti.haebom.service;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

	@Value("${sgis.consumer-key}")
	private String consumerKey;

	@Value("${sgis.consumer-secret}")
	private String consumerSecret;

	@Override
	public List<Map<String, Object>> getRegions(String cd) {

		// 유효한 액세스 토큰 가져오기
		String accessToken = getAccessToken();

		// SGIS 단계별 주소 조회 API 호출
		// 주소 조회 API URL 생성
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl("https://sgisapi.mods.go.kr/OpenAPI3/addr/stage.json")
				.queryParam("accessToken", accessToken);

		// cd가 있다면 파라미터 추가
		if (cd != null && !cd.isBlank()) {
			builder.queryParam("cd", cd);
		}

		URI uri = builder.build().encode().toUri();

		// SGIS 단계별 주소 조회 API 호출
		RestTemplate restTemplate = new RestTemplate();

		Map<?, ?> response = restTemplate.getForObject(uri, Map.class);

		// 응답 성공 여부 확인
		if (response == null || !"0".equals(String.valueOf(response.get("errCd")))) {
			throw new IllegalStateException("SGIS 행정구역 조회에 실패했습니다.");
		}
		// result에서 행정구역 목록 추출
		Object result = response.get("result");

		if (!(result instanceof List<?>)) {
			throw new IllegalStateException("SGIS 주소 조회 응답이 올바르지 않습니다.");
		}
		//행정구역 목록 반환
		@SuppressWarnings("unchecked") //제너릭 형변환 억제
		List<Map<String, Object>> regions = (List<Map<String, Object>>) result;

		return regions;
	}

	// 액세스 토큰 발급 및 재사용 처리
	private String getAccessToken() {

		// 인증 API URL 생성
		URI tokenUri = UriComponentsBuilder.fromHttpUrl("https://sgisapi.mods.go.kr/OpenAPI3/auth/authentication.json")
				.queryParam("consumer_key", consumerKey).queryParam("consumer_secret", consumerSecret).build().encode()
				.toUri();

		// SGIS 인증 API 호출
		RestTemplate restTemplate = new RestTemplate();

		Map<?, ?> response = restTemplate.getForObject(tokenUri, Map.class);

		// 응답 성공 여부 확인
		if (response == null || !"0".equals(String.valueOf(response.get("errCd")))) {
			throw new IllegalStateException("SGIS 인증에 실패했습니다.");
		}

		// 응답에서 result 추출
		Object result = response.get("result");

		if (!(result instanceof Map)) {
			throw new IllegalStateException("SGIS 인증 응답이 올바르지 않습니다.");
		}

		// accessToken 추출
		Object token = ((Map<?, ?>) result).get("accessToken");

		if (!(token instanceof String) || ((String) token).isEmpty()) {
			throw new IllegalStateException("SGIS 액세스 토큰을 찾을 수 없습니다.");
		}

		return (String) token;
	}
}
