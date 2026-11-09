package kr.co.oti.haebom.business.policy.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import kr.co.oti.haebom.business.policy.dto.PolicyDTO;
import lombok.extern.slf4j.Slf4j;

/**
 * [진희] 행정안전부 공공서비스(보조금24) API 연동 및 시나리오 맞춤 정책 추천 서비스
 * 
 * @author 진희
 */
@Slf4j
@Service
public class PolicyService {

    @Value("${gov24.api.base-url}")
    private String baseUrl;

    @Value("${gov24.api.service-key}")
    private String serviceKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /*
     * [진희] 시나리오 코드에 맞춤형 공공서비스 정책 목록 추천 (랜덤 셔플 추천)
     * @param scenarioCode "move"(전입신고) 또는 "id-card"(주민등록증 재발급)
     * @return 무작위 추천 정책 리스트 (3건)
     */
    public List<PolicyDTO> getRecommendedPolicies(String scenarioCode) {
        // 1. 시나리오별 알맞은 정부 정책 검색 키워드 매핑
        String keyword = resolveKeyword(scenarioCode);

        // 2. 공공서비스 API 호출 시도 (최대 20건 검색 후 무작위 3건 추출)
        try {
            List<PolicyDTO> apiResult = fetchFromGov24Api(keyword);
            if (apiResult != null && !apiResult.isEmpty()) {
                Collections.shuffle(apiResult);
                return apiResult.stream().limit(3).collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.warn("[공공서비스 API 호출 실패 또는 응답 지연] 기본 추천 정책(Fallback)으로 대체합니다. 사유: {}", e.getMessage());
        }

        // 3. API 장애/지연/결과없음 시 안전하게 기본 추천 정책 반환 (화면 보호 안전장치 + 셔플)
        List<PolicyDTO> fallback = getFallbackPolicies(scenarioCode);
        Collections.shuffle(fallback);
        return fallback.stream().limit(3).collect(Collectors.toList());
    }

    /*
     * 시나리오에 따른 검색 키워드 결정
     */
    private String resolveKeyword(String scenarioCode) {
        if ("move".equalsIgnoreCase(scenarioCode) || "1".equals(scenarioCode)) {
            return "주거"; // 전입신고 ➜ 주거/이사 관련 혜택
        } else if ("id-card".equalsIgnoreCase(scenarioCode) || "2".equals(scenarioCode)) {
            return "신분증"; // 주민등록증 재발급 ➜ 신분증/생활편의 관련 혜택
        }
        return "주거";
    }

    /*
     * 행정안전부 공공서비스 API(ODCloud) 호출 및 DTO 변환
     */
    private List<PolicyDTO> fetchFromGov24Api(String keyword) throws Exception {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/serviceList")
                .queryParam("page", 1)
                .queryParam("perPage", 20)
                .queryParam("cond[서비스명::LIKE]", keyword)
                .queryParam("returnType", "json")
                .build(false)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Infuser " + serviceKey);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

        List<PolicyDTO> resultList = new ArrayList<>();
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode dataArray = root.path("data");

            if (dataArray.isArray()) {
                for (JsonNode item : dataArray) {
                    String name = item.path("서비스명").asText("").trim();
                    if (name.isEmpty()) continue;

                    PolicyDTO dto = PolicyDTO.builder()
                            .serviceId(item.path("서비스ID").asText(""))
                            .serviceName(name)
                            .serviceSummary(item.path("서비스목적요약").asText("정부24에서 상세 지원 내용을 확인해 보세요."))
                            .supportType(item.path("지원유형").asText("공공서비스"))
                            .deptName(item.path("소관기관명").asText("정부24"))
                            .detailUrl(item.path("상세조회URL").asText("https://www.gov.kr/"))
                            .applyPeriod(item.path("신청기한").asText("상시 신청"))
                            .build();
                    resultList.add(dto);
                }
            }
        }
        return resultList;
    }

    /*
     * 네트워크 오류나 API 점검 시에도 화면이 깨지지 않도록 보장하는 기본 추천 데이터 (Fallback)
     */
    private List<PolicyDTO> getFallbackPolicies(String scenarioCode) {
        List<PolicyDTO> fallback = new ArrayList<>();

        if ("id-card".equalsIgnoreCase(scenarioCode) || "2".equals(scenarioCode)) {
            // 주민등록증 재발급 추천 정책
            fallback.add(PolicyDTO.builder()
                    .serviceId("FALLBACK_ID_1")
                    .serviceName("모바일 신분증(주민등록증) 발급 서비스")
                    .serviceSummary("스마트폰에 안전하게 저장하여 실물 신분증 없이도 온·오프라인에서 편리하게 신원을 확인하세요.")
                    .supportType("디지털 신분증")
                    .deptName("행정안전부")
                    .detailUrl("https://www.gov.kr/")
                    .applyPeriod("상시 신청")
                    .build());
            fallback.add(PolicyDTO.builder()
                    .serviceId("FALLBACK_ID_2")
                    .serviceName("주민등록표 등·초본 전자증명서 발급")
                    .serviceSummary("정부24 전자문서지갑을 통해 수수료 없이 모바일로 간편하게 증명서를 발급받고 제출하세요.")
                    .supportType("전자증명서")
                    .deptName("행정안전부")
                    .detailUrl("https://www.gov.kr/")
                    .applyPeriod("상시 신청")
                    .build());
            fallback.add(PolicyDTO.builder()
                    .serviceId("FALLBACK_ID_3")
                    .serviceName("개인정보 노출자 사고예방 시스템")
                    .serviceSummary("신분증 분실 시 금융회사에 개인정보 노출 사실을 전파하여 신규 계좌 개설 등 금융사고를 사전에 차단합니다.")
                    .supportType("금융 안전")
                    .deptName("금융감독원")
                    .detailUrl("https://pd.fss.or.kr/")
                    .applyPeriod("연중 접수")
                    .build());
            fallback.add(PolicyDTO.builder()
                    .serviceId("FALLBACK_ID_4")
                    .serviceName("본인서명사실확인서 온라인 발급 서비스")
                    .serviceSummary("인감증명서 대신 안전하게 신원을 증명할 수 있는 본인서명사실확인서를 편리하게 발급받으세요.")
                    .supportType("전자증명서")
                    .deptName("행정안전부")
                    .detailUrl("https://www.gov.kr/")
                    .applyPeriod("상시 신청")
                    .build());
        } else {
            // 전입신고 추천 정책 (기본값)
            fallback.add(PolicyDTO.builder()
                    .serviceId("FALLBACK_MOVE_1")
                    .serviceName("청년월세 한시 특별지원")
                    .serviceSummary("독립 거주 무주택 청년의 주거비 부담 경감을 위해 실제 납부하는 월세를 월 최대 20만원까지 최대 12개월간 지원합니다.")
                    .supportType("현금/바우처")
                    .deptName("국토교통부")
                    .detailUrl("https://www.gov.kr/")
                    .applyPeriod("상시 신청")
                    .build());
            fallback.add(PolicyDTO.builder()
                    .serviceId("FALLBACK_MOVE_2")
                    .serviceName("전세보증금 반환보증 보증료 지원")
                    .serviceSummary("전세사기 피해 예방을 위해 HUG, HF, SGI 전세보증금반환보증 가입 시 납부한 보증료를 최대 30만원까지 전액 환급합니다.")
                    .supportType("보증료 지원")
                    .deptName("국토교통부")
                    .detailUrl("https://www.gov.kr/")
                    .applyPeriod("예산 소진 시까지")
                    .build());
            fallback.add(PolicyDTO.builder()
                    .serviceId("FALLBACK_MOVE_3")
                    .serviceName("청년 이사비 및 중개보수 지원")
                    .serviceSummary("이사 후 관할 지자체로 전입신고한 청년 가구에게 이사비와 부동산 중개보수를 최대 40만원 한도 내 실비 지급합니다.")
                    .supportType("실비 지원")
                    .deptName("지방자치단체")
                    .detailUrl("https://www.gov.kr/")
                    .applyPeriod("연중 접수")
                    .build());
            fallback.add(PolicyDTO.builder()
                    .serviceId("FALLBACK_MOVE_4")
                    .serviceName("버팀목 전세자금 대출 이자 지원")
                    .serviceSummary("무주택 서민 및 청년의 전세자금 대출에 대해 연 1.5%~2.1%의 저금리 혜택을 지원합니다.")
                    .supportType("금융 지원")
                    .deptName("국토교통부")
                    .detailUrl("https://nhuf.molit.go.kr/")
                    .applyPeriod("상시 신청")
                    .build());
            fallback.add(PolicyDTO.builder()
                    .serviceId("FALLBACK_MOVE_5")
                    .serviceName("청년 및 신혼부부 행복주택 공급")
                    .serviceSummary("직주근접이 가능한 대중교통 편리 부지에 주변 시세의 60~80% 수준으로 저렴하게 공급하는 공공임대주택입니다.")
                    .supportType("공공임대")
                    .deptName("한국토지주택공사")
                    .detailUrl("https://apply.lh.or.kr/")
                    .applyPeriod("모집 공고 시")
                    .build());
        }
        return fallback;
    }
}
