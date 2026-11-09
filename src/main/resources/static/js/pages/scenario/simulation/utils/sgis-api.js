const REGIONS_API = "/api/address/sgis/regions";

export async function fetchRegions(cd) {
    const url = cd
        ? `${REGIONS_API}?cd=${encodeURIComponent(cd)}`
        : REGIONS_API;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("행정구역 조회 실패");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error("행정구역 응답 형식 오류");
    }

    return data;
}