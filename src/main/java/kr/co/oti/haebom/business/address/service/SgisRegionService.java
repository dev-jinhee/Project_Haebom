package kr.co.oti.haebom.business.address.service;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import kr.co.oti.haebom.business.address.dto.SgisRegionDto;
import kr.co.oti.haebom.business.address.mapper.SgisRegionMapper;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@RequiredArgsConstructor
public class SgisRegionService {

	private final SgisRegionMapper regionMapper;
	private final SgisRegionWriter regionWriter;

	private final AtomicBoolean refreshing = new AtomicBoolean(false);

	@Value("${sgis.consumer-key}")
	private String consumerKey;

	@Value("${sgis.consumer-secret}")
	private String consumerSecret;

	private final WebClient webClient;

	// ==============================
	// 1. SGIS 외부 API 조회
	// ==============================
	public Mono<List<Map<String, Object>>> fetchRegionsFromSgis(String cd) {
		return getAccessToken().flatMap(accessToken -> fetchRegionsFromSgis(cd, accessToken));
	}

	private Mono<List<Map<String, Object>>> fetchRegionsFromSgis(String cd, String accessToken) {

		UriComponentsBuilder builder = UriComponentsBuilder
				.fromHttpUrl("https://sgisapi.mods.go.kr/OpenAPI3/addr/stage.json")
				.queryParam("accessToken", accessToken);

		if (cd != null && !cd.isBlank()) {
			builder.queryParam("cd", cd);
		}

		URI uri = builder.build().encode().toUri();

		return webClient.get().uri(uri).retrieve().bodyToMono(Map.class)
				.switchIfEmpty(
						Mono.error(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SGIS 행정구역 응답이 비어 있습니다.")))
				.map(response -> {

					if (!"0".equals(String.valueOf(response.get("errCd")))) {
						throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SGIS 행정구역 조회에 실패했습니다. cd=" + cd);
					}

					Object result = response.get("result");

					if (!(result instanceof List<?>)) {
						throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SGIS 행정구역 응답 형식이 올바르지 않습니다.");
					}

					List<Map<String, Object>> regions = new ArrayList<>();

					for (Object item : (List<?>) result) {
						if (!(item instanceof Map<?, ?>)) {
							throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SGIS 행정구역 데이터 형식이 올바르지 않습니다.");
						}

						@SuppressWarnings("unchecked")
						Map<String, Object> region = (Map<String, Object>) item;

						regions.add(region);
					}

					return regions;
				})
				.onErrorMap(WebClientRequestException.class,
						e -> new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SGIS 행정구역 서비스 연결에 실패했습니다.", e))
				.onErrorMap(WebClientResponseException.class,
						e -> new ResponseStatusException(HttpStatus.BAD_GATEWAY, "SGIS 행정구역 서비스에서 오류가 발생했습니다.", e));
	}

	// ==============================
	// 2. SGIS 액세스 토큰 발급
	// ==============================
	private Mono<String> getAccessToken() {

		URI tokenUri = UriComponentsBuilder.fromHttpUrl("https://sgisapi.mods.go.kr/OpenAPI3/auth/authentication.json")
				.queryParam("consumer_key", consumerKey).queryParam("consumer_secret", consumerSecret).build().encode()
				.toUri();

		return webClient.get().uri(tokenUri).retrieve().bodyToMono(Map.class)
				.switchIfEmpty(Mono.error(new IllegalStateException("SGIS 인증 응답이 비어 있습니다."))).map(response -> {

					if (!"0".equals(String.valueOf(response.get("errCd")))) {
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
				}).onErrorMap(WebClientRequestException.class, e -> new IllegalStateException("SGIS 인증 서버 연결 실패", e))
				.onErrorMap(WebClientResponseException.class, e -> new IllegalStateException("SGIS 인증 서버 응답 오류", e));
	}

	// ==============================
	// 3. 전국 행정구역 수집 및 갱신
	// ==============================

	public Mono<Void> refreshRegions() {

		return Mono.defer(() -> {

			if (!refreshing.compareAndSet(false, true)) {
				return Mono.error(new IllegalStateException("SGIS 행정구역 갱신이 이미 진행 중입니다."));
			}

			return getAccessToken().flatMapMany(this::collectAllRegions).collectList()
					.flatMap(collected -> Mono.fromRunnable(() -> saveRegions(collected))
							.subscribeOn(Schedulers.boundedElastic()).then())
					.doFinally(signal -> refreshing.set(false));
		});
	}

	private Flux<SgisRegionDto> collectAllRegions(String accessToken) {

		return fetchRegionsFromSgis(null, accessToken).flatMapIterable(regions -> regions)
				.concatMap(sido -> collectSido(sido, accessToken));
	}

	private Flux<SgisRegionDto> collectSido(Map<String, Object> sido, String accessToken) {

		SgisRegionDto sidoDto = toDto(sido, null, 1, null);

		return fetchRegionsFromSgis(sidoDto.getRegionCode(), accessToken).flatMapMany(Flux::fromIterable)
				.concatMap(district -> collectDistrict(district, sidoDto, accessToken)).startWith(sidoDto);
	}

	private Flux<SgisRegionDto> collectDistrict(Map<String, Object> district, SgisRegionDto sidoDto,
			String accessToken) {

		SgisRegionDto districtDto = toDto(district, sidoDto.getRegionCode(), 2, sidoDto.getFullAddr());

		return fetchRegionsFromSgis(districtDto.getRegionCode(), accessToken).flatMapMany(Flux::fromIterable)
				.map(town -> toDto(town, districtDto.getRegionCode(), 3, districtDto.getFullAddr()))
				.startWith(districtDto);
	}

	private void saveRegions(List<SgisRegionDto> collected) {

		Set<String> codes = new HashSet<>();
		int[] counts = new int[4];

		for (SgisRegionDto region : collected) {

			if (!codes.add(region.getRegionCode())) {
				throw new IllegalStateException("SGIS 행정구역 코드 중복: " + region.getRegionCode());
			}

			int level = region.getRegionLevel();

			if (level < 1 || level > 3) {
				throw new IllegalStateException("올바르지 않은 SGIS 행정구역 단계: " + level);
			}

			counts[level]++;
		}

		if (counts[1] == 0 || counts[2] == 0 || counts[3] == 0) {

			throw new IllegalStateException("SGIS 행정구역 수집 결과가 불완전합니다.");
		}

		int existingCount = regionMapper.countRegions();

		if (existingCount > 0 && collected.size() < existingCount * 0.9) {

			throw new IllegalStateException("기존 데이터보다 수집 건수가 크게 감소했습니다.");
		}

		regionWriter.syncRegions(collected);
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
