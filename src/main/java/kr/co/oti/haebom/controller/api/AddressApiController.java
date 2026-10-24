package kr.co.oti.haebom.controller.api;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.service.AddressService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/address")
@Tag(name = "주소오픈API", description = "주소 관련 오픈API")
public class AddressApiController {
	private final AddressService addressService;

	// 행정구역(시도/시군구) 조회
	@Operation(summary = "행정 구역 조회", description = "단계별 행정 구역을 조회합니다.")
	@ApiResponse(responseCode = "202", description = "행정구역 조회 성공")
	@GetMapping("/sgis/regions")
	public List<Map<String, Object>> getRegions(@RequestParam(required = false) String cd) {
		return addressService.getRegions(cd);
	}
}
