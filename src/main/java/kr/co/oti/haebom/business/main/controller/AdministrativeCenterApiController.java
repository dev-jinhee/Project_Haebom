package kr.co.oti.haebom.business.main.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.oti.haebom.business.main.dto.AdministrativeCenterDTO;
import kr.co.oti.haebom.business.main.service.AdministrativeCenterService;
import lombok.RequiredArgsConstructor;

@Tag(name = "메인페이지 행정복지센터 지도", description = "전체 또는 지역별 행정복지센터 조회 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main/institutions")
public class AdministrativeCenterApiController {

    private final AdministrativeCenterService administrativeCenterService;

    @Operation(summary = "행정복지센터 조회", description = "지역 조건이 없으면 좌표가 등록된 전체 기관을 조회하고, 시·도와 시·군·구를 지정하면 해당 지역만 조회합니다.")
    @GetMapping
    public List<AdministrativeCenterDTO> getCenters(
            @RequestParam(required = false) String sido,
            @RequestParam(required = false) String sigungu) {
        return administrativeCenterService.getCenters(sido, sigungu);
    }
}
