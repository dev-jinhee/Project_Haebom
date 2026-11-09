package kr.co.oti.haebom.business.address.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.business.address.service.AddressService;
import kr.co.oti.haebom.business.address.service.SgisRegionService;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/address")
@Tag(name = "주소API", description = "주소 관련 API")
public class AddressApiController {
	private final AddressService addressService;
	private final SgisRegionService sgisRegionService;

	// 행정구역(시도/시군구) 조회
	@Operation(summary = "행정 구역 조회", description = "단계별 행정 구역을 조회합니다.")
	@ApiResponse(responseCode = "202", description = "행정구역 조회 성공")
	@GetMapping("/sgis/regions")
	public List<Map<String, Object>> getRegions(@RequestParam(required = false) String cd) {
		return sgisRegionService.getRegionsFromDb(cd);
	}

	// 도로명 주소 검색
	@Operation(summary = "도로명주소 조회", description = "도로명주소를 조회합니다.")
	@ApiResponse(responseCode = "200", description = "도로명주소 조회 성공")
	@GetMapping("/search")
	public Mono<String> searchAddress(@RequestParam String keyword, @RequestParam(defaultValue = "1") int currentPage) {
		return addressService.searchAddress(keyword, currentPage);
	}

	// SGIS 행정구역명 검색
	@Operation(summary = "SGIS 행정구역명 검색", description = "시도·시군구·읍면동 전체 주소를 검색합니다.")
	@GetMapping("/sgis/search")
	public Map<String, Object> searchSgisRegions(@RequestParam String keyword) {

		return Map.of("status", "READY", "results", sgisRegionService.search(keyword));
	}
	
	// 행정구역 코드로 전체 주소 조회
	@Operation(summary = "전체 주소 조회", description = "행정구역 코드로 전체 주소 조회합니다.")
	@GetMapping("/sgis/regions/{regionCode}")
	public ResponseEntity<Map<String, String>> getRegionFullAddr(
	        @PathVariable String regionCode) {

		String fullAddr = sgisRegionService.getRegionFullAddr(regionCode);

	    return ResponseEntity.ok(
	        Map.of(
	            "regionCode", regionCode,
	            "fullAddr", fullAddr
	        )
	    );
	}
}
