package kr.co.oti.haebom.business.main.dto;

public record KakaoLocalPlaceDto(
        String id,
        String placeName,
        String categoryName,
        String categoryGroupCode,
        String addressName,
        String roadAddressName,
        String phone,
        String x,
        String y,
        String placeUrl,
        boolean administrativeCategoryMatched) {
}
