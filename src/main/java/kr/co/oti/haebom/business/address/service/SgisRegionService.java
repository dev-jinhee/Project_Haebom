
package kr.co.oti.haebom.business.address.service;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import kr.co.oti.haebom.business.address.dto.SgisRegionDto;
import kr.co.oti.haebom.business.address.mapper.SgisRegionMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SgisRegionService {

	private final SgisRegionMapper regionMapper;
	private final SgisRegionWriter regionWriter;

	@Value("${sgis.consumer-key}")
	private String consumerKey;

	@Value("${sgis.consumer-secret}")
	private String consumerSecret;

	private final RestTemplate restTemplate = new RestTemplate();

	// ==============================
	// 1. SGIS 외부 API 조회
	// ==============================
	public List<Map<String, Object>> fetchRegionsFromSgis(String cd) {
		return fetchRegionsFromSgis(cd, getAccessToken());
	}

	private List<Map<String, Object>> fetchRegionsFromSgis(String cd, String accessToken) {

		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl("https://sgisapi.mods.go.kr/OpenAPI3/addr/stage.json")
				.queryParam("accessToken", accessToken);

		if (cd != null && !cd.isBlank()) {
			builder.queryParam("cd", cd);
		}

		URI uri = builder.build().encode().toUri();

		Map<?, ?> response;

		try {
			response = restTemplate.getForObject(uri, Map.class);
		} catch (RestClientException e) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SGIS 행정구역 서비스 연결에 실패했습니다.", e);
		}

		if (response == null || !"0".equals(String.valueOf(response.get("errCd")))) {

			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SGIS 행정구역 조회에 실패했습니다. cd=" + cd);
		}

		Object result = response.get("result");

		if (!(result instanceof List<?>)) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SGIS 행정구역 응답 형식이 올바르지 않습니다.");
		}

		@SuppressWarnings("unchecked")
		List<Map<String, Object>> regions = (List<Map<String, Object>>) result;

		return regions;
	}

	// ==============================
	// 2. SGIS 액세스 토큰 발급
	// ==============================
	private String getAccessToken() {

		URI tokenUri = UriComponentsBuilder.fromHttpUrl("https://sgisapi.mods.go.kr/OpenAPI3/auth/authentication.json")
				.queryParam("consumer_key", consumerKey).queryParam("consumer_secret", consumerSecret).build().encode()
				.toUri();

		Map<?, ?> response = restTemplate.getForObject(tokenUri, Map.class);

		if (response == null || !"0".equals(String.valueOf(response.get("errCd")))) {
			throw new IllegalStateException("SGIS 인증 실패");
		}

		Object result = response.get("result");

		if (!(result instanceof Map<?, ?>)) {
			throw new IllegalStateException("SGIS 인증 응답 오류");
		}

		Object token = ((Map<?, ?>) result).get("accessToken");

		if (!(token instanceof String) || ((String) token).isBlank()) {
			throw new IllegalStateException("SGIS 액세스 토큰이 없습니다.");
		}

		return (String) token;
	}

	// ==============================
	// 3. 전국 행정구역 수집 및 갱신
	// ==============================
	public synchronized void refreshRegions() {

		List<SgisRegionDto> collected = new ArrayList<>();
		Set<String> codes = new HashSet<>();

		int[] counts = new int[4];

		// 수집 작업에서 토큰을 한 번 발급
		String accessToken = getAccessToken();

		// 1단계: 시·도
		List<Map<String, Object>> sidos = fetchRegionsFromSgis(null, accessToken);

		for (Map<String, Object> sido : sidos) {

			SgisRegionDto sidoDto = toDto(sido, null, 1, null);

			addRegion(collected, codes, sidoDto);
			counts[1]++;

			// 2단계: 시·군·구
			List<Map<String, Object>> districts = fetchRegionsFromSgis(sidoDto.getRegionCode(), accessToken);

			for (Map<String, Object> district : districts) {

				SgisRegionDto districtDto = toDto(district, sidoDto.getRegionCode(), 2, sidoDto.getFullAddr());

				addRegion(collected, codes, districtDto);
				counts[2]++;

				// 3단계: 읍·면·동
				List<Map<String, Object>> towns = fetchRegionsFromSgis(districtDto.getRegionCode(), accessToken);

				for (Map<String, Object> town : towns) {

					SgisRegionDto townDto = toDto(town, districtDto.getRegionCode(), 3, districtDto.getFullAddr());

					addRegion(collected, codes, townDto);
					counts[3]++;
				}
			}
		}

		// ==============================
		// 4. 수집 결과 검증
		// ==============================
		if (counts[1] == 0 || counts[2] == 0 || counts[3] == 0) {

			throw new IllegalStateException("SGIS 행정구역 수집 결과가 불완전합니다.");
		}

		// 기존 데이터가 있을 경우 급격한 감소 방지
		int existingCount = regionMapper.countRegions();

		if (existingCount > 0 && collected.size() < existingCount * 0.9) {

			throw new IllegalStateException("기존 데이터보다 수집 건수가 크게 감소했습니다.");
		}

		// ==============================
		// 5. DB 반영
		// ==============================
		// 실제 트랜잭션은 Writer에서 처리
		regionWriter.replaceRegions(collected);

		System.out.println("[SGIS] 행정구역 갱신 완료" + " / 시도: " + counts[1] + " / 시군구: " + counts[2] + " / 읍면동: " + counts[3]
				+ " / 전체: " + collected.size());
	}

	// ==============================
	// 6. SGIS 응답 → DTO 변환
	// ==============================
	private SgisRegionDto toDto(Map<String, Object> region, String parentCode, int level, String parentAddr) {

		String code = required(region, "cd");
		String name = required(region, "addr_name");

		Object fullAddrValue = region.get("full_addr");

		String fullAddr = fullAddrValue == null ? "" : fullAddrValue.toString().trim();

		if (fullAddr.isBlank()) {
			fullAddr = parentAddr == null ? name : parentAddr + " " + name;
		}

		SgisRegionDto dto = new SgisRegionDto();

		dto.setRegionCode(code);
		dto.setParentCode(parentCode);
		dto.setRegionName(name);
		dto.setFullAddr(fullAddr);
		dto.setRegionLevel(level);

		return dto;
	}

	private String required(Map<String, Object> region, String key) {

		Object value = region.get(key);

		if (value == null || value.toString().isBlank()) {
			throw new IllegalStateException("SGIS 필수값 누락: " + key);
		}

		return value.toString().trim();
	}

	private void addRegion(List<SgisRegionDto> collected, Set<String> codes, SgisRegionDto region) {

		if (!codes.add(region.getRegionCode())) {
			throw new IllegalStateException("SGIS 행정구역 코드 중복: " + region.getRegionCode());
		}

		collected.add(region);
	}

	// ==============================
	// 7. DB 기반 단계별 행정구역 조회
	// ==============================
	public List<Map<String, Object>> getRegionsFromDb(String cd) {

		List<SgisRegionDto> regions;

		if (cd == null || cd.isBlank()) {
			regions = regionMapper.selectSido();
		} else {
			regions = regionMapper.selectByParentCode(cd);
		}

		// 기존 JS의 cd, addr_name 응답 형식 유지
		return regions.stream().map(region -> Map.<String, Object>of("cd", region.getRegionCode(), "addr_name",
				region.getRegionName(), "full_addr", region.getFullAddr())).toList();
	}

	// ==============================
	// 8. DB 기반 행정구역명 검색
	// ==============================
	public List<SgisRegionDto> search(String keyword) {

		if (keyword == null || keyword.trim().length() < 2 || keyword.trim().length() > 100) {

			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "검색어는 2자 이상 100자 이하로 입력해 주세요.");
		}

		return regionMapper.searchRegions(keyword.trim());
	}

	// ==============================
	// 9.행정구역 코드로 전체 주소 조회
	// ==============================
	public String getRegionFullAddr(String regionCode) {

		if (regionCode == null || !regionCode.matches("\\d{2,20}")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 행정구역 코드를 입력해 주세요.");
		}

		SgisRegionDto region = regionMapper.selectByRegionCode(regionCode);

		if (region == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 행정구역을 찾을 수 없습니다.");
		}

		return region.getFullAddr();
	}
}
