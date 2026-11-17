package kr.co.oti.haebom.business.main.service;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicBoolean;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.business.address.dto.SgisRegionDto;
import kr.co.oti.haebom.business.address.mapper.SgisRegionMapper;
import kr.co.oti.haebom.business.main.dto.KakaoLocalPlaceDto;
import kr.co.oti.haebom.business.main.dto.KakaoLocalSearchResultDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class KakaoLocalSearchService {
    private static final Logger log = LoggerFactory.getLogger(KakaoLocalSearchService.class);
    private static final int PAGE_SIZE = 15;
    private static final int MAX_PAGE = 45;
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);

    private static final List<String> KEYWORDS = List.of(
            "행정복지센터", "주민센터", "주민자치센터", "동사무소", "면사무소",
            "읍사무소", "시청", "군청", "구청", "출장소", "분소");
    private static final List<String> ADMINISTRATIVE_CATEGORY_PATHS = List.of(
            "사회,공공기관 > 지방행정기관",
            "사회,공공기관 > 행정기관",
            "사회,공공기관 > 행정기관부속시설");
    private static final List<String> EXCLUDED_KEYWORDS = List.of("무인민원발급", "무인발급");
    private final WebClient webClient;
    private final SgisRegionMapper regionMapper;
    private final String restApiKey;

    public KakaoLocalSearchService(
            SgisRegionMapper regionMapper,
            @Value("${app.kakao.local.rest-key:}") String restApiKey) {
        this.regionMapper = regionMapper;
        this.restApiKey = restApiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://dapi.kakao.com")
                .build();
    }

    public Mono<KakaoLocalSearchResultDto> search(String sidoCode, String sigunguCode) {
        if (!StringUtils.hasText(sidoCode)) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "시·도를 선택해 주세요."));
        }
        if (!StringUtils.hasText(restApiKey)) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "카카오 검색 키가 설정되지 않았습니다."));
        }

        SgisRegionDto sido = regionMapper.selectByRegionCode(sidoCode.trim());
        if (sido == null || !Integer.valueOf(1).equals(sido.getRegionLevel())) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효한 시·도 코드가 아닙니다."));
        }

        final String regionName;
        if (sido.getRegionName() != null && sido.getRegionName().contains("세종")) {
            regionName = "세종";
        } else {
            if (!StringUtils.hasText(sigunguCode)) {
                return Mono.error(new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "시·군·구를 선택해 주세요."));
            }
            SgisRegionDto sigungu = regionMapper.selectByRegionCode(sigunguCode.trim());
            if (sigungu == null || !Integer.valueOf(2).equals(sigungu.getRegionLevel())
                    || !Objects.equals(sido.getRegionCode(), sigungu.getParentCode())) {
                return Mono.error(new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "선택한 시·군·구가 시·도에 속하지 않습니다."));
            }
            regionName = sido.getRegionName() + " " + sigungu.getRegionName();
        }

        long startedAt = System.nanoTime();
        AtomicInteger requestCount = new AtomicInteger();
        AtomicInteger failedQueryCount = new AtomicInteger();
        AtomicBoolean rateLimited = new AtomicBoolean();
        return Flux.fromIterable(KEYWORDS)
                .concatMap(keyword -> {
                    if (rateLimited.get()) return Flux.empty();
                    String query = regionName + " " + keyword;
                    return fetchAllPages(query, 1, requestCount)
                            .onErrorResume(error -> {
                                if (error instanceof ResponseStatusException statusError
                                        && statusError.getStatus() == HttpStatus.SERVICE_UNAVAILABLE) {
                                    return Flux.error(error);
                                }
                                failedQueryCount.incrementAndGet();
                                if (error instanceof ResponseStatusException statusError
                                        && statusError.getStatus() == HttpStatus.TOO_MANY_REQUESTS) {
                                    rateLimited.set(true);
                                }
                                log.warn("Kakao Local keyword search failed: query={}, failedQueries={}, rateLimited={}",
                                        query, failedQueryCount.get(), rateLimited.get());
                                return Flux.empty();
                            });
                })
                .filter(place -> StringUtils.hasText(place.id()))
                .collect(LinkedHashMap<String, KakaoLocalPlaceDto>::new,
                        (byId, place) -> byId.merge(place.id(), place, this::mergePlace))
                .map(byId -> {
                    List<KakaoLocalPlaceDto> filtered = byId.values().stream()
                            .filter(this::matchesTargetPlaceName)
                            .filter(place -> !containsAny(place.placeName(), EXCLUDED_KEYWORDS))
                            .filter(this::hasValidCoordinates)
                            .toList();
                    log.info("Kakao Local search completed: region={}, expectedBaseRequests={}, actualRequests={}, unique={}, accepted={}, failedQueries={}, rateLimited={}, elapsedMs={}",
                            regionName, KEYWORDS.size(), requestCount.get(), byId.size(),
                            filtered.size(), failedQueryCount.get(), rateLimited.get(),
                            Duration.ofNanos(System.nanoTime() - startedAt).toMillis());
                    return new KakaoLocalSearchResultDto(
                            filtered, failedQueryCount.get(), rateLimited.get());
                })
                .doOnError(error -> log.warn(
                        "Kakao Local search stopped: region={}, requestedPages={}, elapsedMs={}",
                        regionName, requestCount.get(),
                        Duration.ofNanos(System.nanoTime() - startedAt).toMillis()));
    }

    private Flux<KakaoLocalPlaceDto> fetchAllPages(
            String query, int page, AtomicInteger requestCount) {
        return requestPage(query, page, requestCount).flatMapMany(root -> {
            JsonNode documents = root.path("documents");
            Flux<KakaoLocalPlaceDto> currentPage = documents.isArray()
                    ? Flux.fromIterable(documents).map(this::toPlace)
                    : Flux.empty();
            boolean isEnd = root.path("meta").path("is_end").asBoolean(true);
            log.info("Kakao Local page: query={}, page={}, count={}, isEnd={}",
                    query, page, documents.isArray() ? documents.size() : 0, isEnd);
            if (isEnd) {
                return currentPage;
            }
            if (page >= MAX_PAGE) {
                return currentPage;
            }
            return currentPage.concatWith(fetchAllPages(
                    query, page + 1, requestCount));
        });
    }

    private Mono<JsonNode> requestPage(String query, int page, AtomicInteger requestCount) {
        return Mono.defer(() -> {
            long startedAt = System.nanoTime();
            requestCount.incrementAndGet();
            return webClient.get()
                .uri(uri -> uri.path("/v2/local/search/keyword.json")
                        .queryParam("query", query)
                        .queryParam("page", page)
                        .queryParam("size", PAGE_SIZE)
                        .build())
                .headers(headers -> headers.set("Authorization", "KakaoAK " + restApiKey))
                .retrieve()
                .onStatus(status -> status.value() == 429,
                        response -> Mono.error(new ResponseStatusException(
                                HttpStatus.TOO_MANY_REQUESTS, "카카오 검색 요청이 제한됐습니다. 잠시 후 다시 시도해 주세요.")))
                .onStatus(status -> status.value() == 401 || status.value() == 403,
                        response -> Mono.error(new ResponseStatusException(
                                HttpStatus.SERVICE_UNAVAILABLE, "카카오 API 키 또는 권한 설정을 확인해 주세요.")))
                .onStatus(status -> status.isError(),
                        response -> Mono.error(new ResponseStatusException(
                                HttpStatus.BAD_GATEWAY, "카카오 장소 검색에 실패했습니다.")))
                .bodyToMono(JsonNode.class)
                .timeout(REQUEST_TIMEOUT)
                .doOnNext(root -> log.debug(
                        "Kakao Local HTTP request: query={}, page={}, status=200, elapsedMs={}",
                        query, page, Duration.ofNanos(System.nanoTime() - startedAt).toMillis()))
                .onErrorMap(error -> !(error instanceof ResponseStatusException),
                        error -> new ResponseStatusException(
                                HttpStatus.BAD_GATEWAY, "카카오 장소 검색 응답을 받지 못했습니다.", error))
                .doOnError(error -> log.warn(
                        "Kakao Local HTTP request failed: query={}, page={}, elapsedMs={}",
                        query, page, Duration.ofNanos(System.nanoTime() - startedAt).toMillis()));
        });
    }

    private KakaoLocalPlaceDto toPlace(JsonNode node) {
        return new KakaoLocalPlaceDto(
                node.path("id").asText(null),
                node.path("place_name").asText(null),
                node.path("category_name").asText(null),
                node.path("category_group_code").asText(null),
                node.path("address_name").asText(null),
                node.path("road_address_name").asText(null),
                node.path("phone").asText(null),
                node.path("x").asText(null),
                node.path("y").asText(null),
                node.path("place_url").asText(null),
                isAdministrativeCategoryMatch(
                        node.path("category_group_code").asText(null),
                        node.path("category_name").asText(null)));
    }

    private KakaoLocalPlaceDto mergePlace(KakaoLocalPlaceDto oldValue, KakaoLocalPlaceDto newValue) {
        return new KakaoLocalPlaceDto(
                firstText(oldValue.id(), newValue.id()),
                firstText(oldValue.placeName(), newValue.placeName()),
                firstText(oldValue.categoryName(), newValue.categoryName()),
                firstText(oldValue.categoryGroupCode(), newValue.categoryGroupCode()),
                firstText(newValue.addressName(), oldValue.addressName()),
                firstText(newValue.roadAddressName(), oldValue.roadAddressName()),
                firstText(newValue.phone(), oldValue.phone()),
                firstText(newValue.x(), oldValue.x()),
                firstText(newValue.y(), oldValue.y()),
                firstText(oldValue.placeUrl(), newValue.placeUrl()),
                oldValue.administrativeCategoryMatched() || newValue.administrativeCategoryMatched());
    }

    private String firstText(String preferred, String fallback) {
        return StringUtils.hasText(preferred) ? preferred : fallback;
    }

    private boolean containsAny(String value, List<String> words) {
        return StringUtils.hasText(value) && words.stream().anyMatch(value::contains);
    }

    private boolean isAdministrativeCategoryMatch(String categoryGroupCode, String categoryName) {
        return "PO3".equals(categoryGroupCode)
                || (StringUtils.hasText(categoryName)
                        && ADMINISTRATIVE_CATEGORY_PATHS.stream().anyMatch(categoryName::startsWith));
    }

    private boolean matchesTargetPlaceName(KakaoLocalPlaceDto place) {
        return containsAny(place.placeName(), KEYWORDS);
    }

    private boolean hasValidCoordinates(KakaoLocalPlaceDto place) {
        try {
            double longitude = Double.parseDouble(place.x());
            double latitude = Double.parseDouble(place.y());
            return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
        } catch (RuntimeException exception) {
            return false;
        }
    }
}
