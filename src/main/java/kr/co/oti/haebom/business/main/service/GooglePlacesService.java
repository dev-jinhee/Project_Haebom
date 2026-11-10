package kr.co.oti.haebom.business.main.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.server.ResponseStatusException;

import kr.co.oti.haebom.business.main.dto.AdministrativeCenterDTO;
import kr.co.oti.haebom.business.main.dto.GooglePlaceInfoDTO;
import kr.co.oti.haebom.business.main.mapper.MainPageMapper;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class GooglePlacesService {
    private static final String URL =
            "https://places.googleapis.com/v1/places:searchText";
    private static final String FIELD_MASK =
            "places.displayName,places.formattedAddress,"
            + "places.nationalPhoneNumber,places.websiteUri,"
            + "places.regularOpeningHours.weekdayDescriptions,"
            + "places.googleMapsUri";

    private final MainPageMapper mainPageMapper;
    private final WebClient webClient = WebClient.builder().build();

    @Value("${app.google.maps.server-key:}")
    private String serverKey;

    public Mono<GooglePlaceInfoDTO> getPlaceInfo(int centerId) {
        if (!StringUtils.hasText(serverKey)) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE, "Google Places 서버 키가 설정되지 않았습니다."));
        }

        AdministrativeCenterDTO center = mainPageMapper.selectCenterById(centerId);
        if (center == null) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "행정복지센터 정보를 찾을 수 없습니다."));
        }
        if (!StringUtils.hasText(center.getCenterName())
                || !StringUtils.hasText(center.getAddress())
                || center.getLatitude() == null || center.getLongitude() == null) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "기관명·주소·좌표 정보가 부족합니다."));
        }

        String query = center.getCenterName() + " "
                + center.getAddress() + " 대한민국";
        Map<String, Object> body = Map.of(
                "textQuery", query,
                "languageCode", "ko",
                "regionCode", "KR",
                "locationBias", Map.of("circle", Map.of(
                        "center", Map.of(
                                "latitude", center.getLatitude(),
                                "longitude", center.getLongitude()),
                        "radius", 300.0)));

        return webClient.post()
                .uri(URL)
                .header("X-Goog-Api-Key", serverKey)
                .header("X-Goog-FieldMask", FIELD_MASK)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .flatMap(this::toDto)
                .onErrorMap(WebClientException.class, error ->
                        new ResponseStatusException(
                                HttpStatus.BAD_GATEWAY,
                                "Google Places 조회에 실패했습니다.", error));
    }

    private Mono<GooglePlaceInfoDTO> toDto(JsonNode response) {
        JsonNode places = response.path("places");
        if (!places.isArray() || places.isEmpty()) {
            return Mono.error(new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "일치하는 장소 정보를 찾지 못했습니다."));
        }

        JsonNode place = places.get(0);
        JsonNode weekdayNodes =
                place.path("regularOpeningHours").path("weekdayDescriptions");
        List<String> weekdays = new ArrayList<>();
        if (weekdayNodes.isArray()) {
            weekdayNodes.forEach(day -> weekdays.add(day.asText()));
        }

        return Mono.just(new GooglePlaceInfoDTO(
                text(place.path("displayName").path("text")),
                text(place.path("formattedAddress")),
                text(place.path("nationalPhoneNumber")),
                text(place.path("websiteUri")),
                weekdays,
                text(place.path("googleMapsUri"))));
    }

    private String text(JsonNode node) {
        return node.isMissingNode() || node.isNull() ? null : node.asText();
    }
}
