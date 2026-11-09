package kr.co.oti.haebom.business.policy.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
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
import kr.co.oti.haebom.business.scenario.mapper.SimulationAnswerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyService {

    @Value("${gov24.api.base-url}")
    private String baseUrl;

    @Value("${gov24.api.service-key}")
    private String serviceKey;

    private final SimulationAnswerMapper simulationAnswerMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /*
     * 기본 시나리오 코드 기반 추천 (하위 호환)
     */
    public List<PolicyDTO> getRecommendedPolicies(String scenarioCode) {
        return getRecommendedPolicies(scenarioCode, null, null, 0);
    }

    /*
     * 시나리오 및 진행 ID(주소 기반 지역 맞춤) 정책 목록 추천 (기본 고정 추천)
     * 
     * @param scenarioCode "move"(전입신고) 또는 "identity_reissue"(주민등록증 재발급)
     * @param progressId 시뮬레이션 진행 ID (전입신고 새 주소 추출용, nullable)
     * @param directRegion 직접 전달된 지역명 (선택사항, nullable)
     * @return 지역 맞춤 추천 정책 리스트 (3건)
     */
    public List<PolicyDTO> getRecommendedPolicies(String scenarioCode, Integer progressId, String directRegion) {
        return getRecommendedPolicies(scenarioCode, progressId, directRegion, 0);
    }

    /*
     * 시나리오 및 진행 ID 기반 고정 정책 목록 추천 및 새로고침 지원 (결정론적 시드 기반)
     * - progressId가 동일할 경우 언제 조회하든(PDF 인쇄, 마이페이지 재조회 등) 항상 동일한 3개의 정책이 고정 반환됩니다.
     * - refreshIndex를 증가시키면 다음 추천 정책 세트로 순환 갱신됩니다.
     * 
     * @param scenarioCode 시나리오 코드
     * @param progressId 시뮬레이션 진행 ID
     * @param directRegion 직접 전달된 지역명
     * @param refreshIndex 새로고침 인덱스 (0: 기본 고정, 1 이상: 다른 추천 세트)
     * @return 지역 맞춤 + 시드 기반 추천 정책 리스트 (최대 3건)
     */
    public List<PolicyDTO> getRecommendedPolicies(String scenarioCode, Integer progressId, String directRegion, Integer refreshIndex) {
        // 1. 시나리오별 알맞은 정부 정책 검색 키워드 매핑
        String keyword = resolveKeyword(scenarioCode);

        // 2. 전입신고 시나리오인 경우 입력한 새 주소 기반 지역 키워드 추출 (시·군·구, 시·도)
        List<String> regionKeywords = new ArrayList<>();
        if (directRegion != null && !directRegion.isBlank()) {
            regionKeywords.add(directRegion.trim());
        } else if (isMoveScenario(scenarioCode) && progressId != null) {
            String[] extracted = extractRegionKeywords(progressId);
            for (String kw : extracted) {
                if (!regionKeywords.contains(kw)) {
                    regionKeywords.add(kw);
                }
            }
        }

        // 3. progressId와 refreshIndex 기반의 결정론적 Random 생성 (일관성 및 다채로운 순환 보장)
        int refresh = (refreshIndex != null && refreshIndex >= 0) ? refreshIndex : 0;
        Random random = (progressId != null)
                ? new Random((long) progressId * 31L + (long) refresh * 10007L)
                : new Random();

        // 4. 공공서비스 API 호출 시도 (지역 맞춤 + 전국 정책 풀 구성 후 스마트 선택)
        try {
            List<PolicyDTO> localPool = new ArrayList<>();
            Set<String> seenIds = new HashSet<>();

            // (1) 지자체 맞춤 정책 수집 (시·군·구 / 시·도)
            for (String region : regionKeywords) {
                List<PolicyDTO> list = fetchFromGov24Api(keyword, region);
                if (list != null && !list.isEmpty()) {
                    for (PolicyDTO dto : list) {
                        if (seenIds.add(dto.getServiceId())) {
                            localPool.add(dto);
                        }
                    }
                }
            }

            // (2) 전국 단위 공통 정책 수집
            List<PolicyDTO> nationalPool = new ArrayList<>();
            List<PolicyDTO> natList = fetchFromGov24Api(keyword, null);
            if (natList != null && !natList.isEmpty()) {
                for (PolicyDTO dto : natList) {
                    if (seenIds.add(dto.getServiceId())) {
                        nationalPool.add(dto);
                    }
                }
            }

            // (3) Fallback 기본 정책도 전국 풀에 보충 (풍부한 후보군 확보)
            List<PolicyDTO> fallbackPool = getFallbackPolicies(scenarioCode);
            for (PolicyDTO dto : fallbackPool) {
                if (seenIds.add(dto.getServiceId())) {
                    nationalPool.add(dto);
                }
            }

            // (4) 시드 기반 셔플
            Collections.shuffle(localPool, random);
            Collections.shuffle(nationalPool, random);

            List<PolicyDTO> selected = new ArrayList<>();

            // 기본(refresh == 0): 지자체 맞춤 정책을 최대 2개까지 우선 배치
            // 새로고침(refresh > 0): 지자체 정책 1개 유지 + 전국/기타 정책 풀에서 새로운 정책 2개 순환 교체!
            int localTargetCount = (refresh == 0) ? 2 : 1;
            for (PolicyDTO dto : localPool) {
                if (selected.size() >= localTargetCount) break;
                selected.add(dto);
            }

            // 나머지 자리를 nationalPool에서 순서대로 채우기
            for (PolicyDTO dto : nationalPool) {
                if (selected.size() >= 3) break;
                if (!selected.contains(dto)) {
                    selected.add(dto);
                }
            }

            // 여전히 3건 미만이면 남은 localPool에서 보충
            for (PolicyDTO dto : localPool) {
                if (selected.size() >= 3) break;
                if (!selected.contains(dto)) {
                    selected.add(dto);
                }
            }

            if (!selected.isEmpty()) {
                return selected;
            }
        } catch (Exception e) {
            log.warn("[공공서비스 API 호출 실패 또는 응답 지연] 기본 추천 정책(Fallback)으로 대체합니다. 사유: {}", e.getMessage());
        }

        // 5. API 장애 시 기본 추천 정책 풀에서 시드 기반 순환 반환
        List<PolicyDTO> fallback = getFallbackPolicies(scenarioCode);
        Collections.shuffle(fallback, random);
        return fallback.stream().limit(3).collect(Collectors.toList());
    }

    /*
     * 전입신고 시나리오 여부 확인
     */
    private boolean isMoveScenario(String scenarioCode) {
        String code = (scenarioCode == null) ? "" : scenarioCode.trim().toLowerCase();
        return code.contains("move") || "1".equals(code) || code.isEmpty();
    }

    /*
     * 시나리오에 따른 검색 키워드 결정
     */
    private String resolveKeyword(String scenarioCode) {
        String code = (scenarioCode == null) ? "" : scenarioCode.trim().toLowerCase();
        if (code.contains("identity") || code.contains("id-card") || code.contains("id_card") || "2".equals(code)) {
            return "신분증"; // 주민등록증 재발급 ➜ 신분증/디지털증명 관련 혜택
        }
        return "주거"; // 전입신고 ➜ 주거/이사 관련 혜택
    }

    /*
     * 시뮬레이션 답변(simulation_answer)에서 사용자가 선택한 새 주소의 지역 키워드 추출
     * 반환 예: ["수영구", "부산"] 또는 ["강남구", "서울"]
     */
    private String[] extractRegionKeywords(Integer progressId) {
        try {
            String addressJson = simulationAnswerMapper.selectAnswerValueByFieldKey(progressId, "currentAddress");
            if (addressJson == null || addressJson.isBlank()) {
                return new String[0];
            }

            JsonNode node = objectMapper.readTree(addressJson);
            String sigunguName = node.path("sigunguName").asText("").trim();
            String sidoName = node.path("sidoName").asText("").trim();

            List<String> keywords = new ArrayList<>();
            // 1) 시·군·구 (예: "수영구", "강남구", "성남시 분당구" -> 세부 구 단위 추출)
            if (!sigunguName.isEmpty()) {
                String[] parts = sigunguName.split("\\s+");
                for (String part : parts) {
                    if (part.length() >= 2) {
                        keywords.add(part);
                    }
                }
            }

            // 2) 시·도 (예: "부산광역시" -> "부산", "서울특별시" -> "서울", "경기도" -> "경기")
            if (!sidoName.isEmpty()) {
                String shortSido = sidoName.replaceAll("(특별시|광역시|특별자치시|특별자치도|도)$", "");
                if (shortSido.length() >= 2 && !keywords.contains(shortSido)) {
                    keywords.add(shortSido);
                }
            }

            return keywords.toArray(new String[0]);
        } catch (Exception e) {
            log.warn("[주소 지역 키워드 추출 실패] progressId={}: {}", progressId, e.getMessage());
            return new String[0];
        }
    }

    /*
     * 행정안전부 공공서비스 API(ODCloud) 호출 및 DTO 변환
     * @param keyword 검색어 (서비스명 LIKE)
     * @param regionKeyword 소관기관 필터 (소관기관명 LIKE, null이면 전국 대상)
     */
    private List<PolicyDTO> fetchFromGov24Api(String keyword, String regionKeyword) throws Exception {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl + "/serviceList")
                .queryParam("page", 1)
                .queryParam("perPage", 20)
                .queryParam("cond[서비스명::LIKE]", keyword)
                .queryParam("returnType", "json");

        if (regionKeyword != null && !regionKeyword.isBlank()) {
            builder.queryParam("cond[소관기관명::LIKE]", regionKeyword.trim());
        }

        String url = builder.build(false).toUriString();

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
        String code = (scenarioCode == null) ? "" : scenarioCode.trim().toLowerCase();

        if (code.contains("identity") || code.contains("id-card") || code.contains("id_card") || "2".equals(code)) {
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
            fallback.add(PolicyDTO.builder()
                    .serviceId("FALLBACK_ID_5")
                    .serviceName("여권 온라인 재발급 신청 서비스")
                    .serviceSummary("정부24를 통해 온라인으로 편리하게 전자여권 재발급을 신청하고 희망 기관에서 수령하세요.")
                    .supportType("신분증 발급")
                    .deptName("외교부")
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
