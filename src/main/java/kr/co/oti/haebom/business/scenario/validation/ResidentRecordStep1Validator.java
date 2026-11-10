package kr.co.oti.haebom.business.scenario.validation;

import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import kr.co.oti.haebom.business.address.dto.SgisRegionDto;
import kr.co.oti.haebom.business.address.mapper.SgisRegionMapper;
import kr.co.oti.haebom.business.scenario.exception.SimulationValidationException;
import lombok.RequiredArgsConstructor;

/** 주민등록표 등본(초본) 발급 1단계 - 현재 선택한 발급 형태/항목만 서버 검증. */
@Component
@RequiredArgsConstructor
public class ResidentRecordStep1Validator implements StepValidator {

    private static final Set<String> TYPES = Set.of("DEUNGBON", "CHOBON");
    private static final Set<String> MODES = Set.of("ALL", "SELECT");
    private static final Set<String> RECEIPTS = Set.of("ONLINE_PRINT", "ONLINE_E_DOC", "ONLINE_THIRD_PARTY",
            "REGISTERED_MAIL", "NORMAL_MAIL");
    private static final Set<String> PURPOSES = Set.of("ADMIN", "FINANCE", "REAL_ESTATE", "COURT", "PRIVATE", "OTHER");
    private static final Set<String> MEMBER_IDS = Set.of("SELF", "SPOUSE", "CHILD");

    private final SgisRegionMapper regionMapper;

    @Override
    public boolean supports(String scenarioCode, Integer stepOrder) {
        return "RESIDENT_RECORD_ISSUE".equals(scenarioCode) && Integer.valueOf(1).equals(stepOrder);
    }

    @Override
    public void validate(Map<String, String> answers) {
        if (answers == null) throw new SimulationValidationException("신청 정보가 없습니다.");
    	System.out.println(
    	        "🔥 주민등록표 Validator 실행: " + answers.get("certificateType")
    	    );
        String type = required(answers, "certificateType", "발급 서비스");
        String mode = required(answers, "issueMode", "발급 형태");
        String receipt = required(answers, "receiveMethod", "수령 방법");
        if (!TYPES.contains(type)) throw new SimulationValidationException("지원하지 않는 발급 서비스입니다.");
        if (!MODES.contains(mode)) throw new SimulationValidationException("발급 형태가 올바르지 않습니다.");
        if (!RECEIPTS.contains(receipt)) throw new SimulationValidationException("수령 방법이 올바르지 않습니다.");

        String sidoCode = required(answers, "residentSidoCode", "시·도");
        String sigunguCode = required(answers, "residentSigunguCode", "시·군·구");
        if (!sidoCode.matches("\\d{2,20}") || !sigunguCode.matches("\\d{2,20}")) {
            throw new SimulationValidationException("행정구역 코드 형식이 올바르지 않습니다.");
        }
        SgisRegionDto sido = regionMapper.selectByRegionCode(sidoCode);
        SgisRegionDto sigungu = regionMapper.selectByRegionCode(sigunguCode);
        if (sido == null || sido.getRegionLevel() != 1) {
            throw new SimulationValidationException("올바른 시·도를 선택해 주세요.");
        }
        if (sigungu == null || sigungu.getRegionLevel() != 2 || !sidoCode.equals(sigungu.getParentCode())) {
            throw new SimulationValidationException("올바른 시·군·구를 선택해 주세요.");
        }

        // 선택 발급 세부값은 전체 발급 시 검증하지 않습니다.
        if (!"SELECT".equals(mode)) return;
        final String prefix = "DEUNGBON".equals(type) ? "deungbon" : "chobon";
        String[] includedKeys = "DEUNGBON".equals(type)
                ? new String[]{ "deungbonPastAddressIncluded", "deungbonHouseholdCompositionIncluded",
                        "deungbonHouseholdMemberIncluded", "deungbonRrnBackIncluded", "deungbonRelationshipIncluded" }
                : new String[]{ "chobonPastAddressIncluded", "chobonPastHouseholdRelationIncluded",
                        "chobonPersonalChangeIncluded", "chobonIdNumbersIncluded",
                        "chobonMilitaryServiceIncluded", "chobonHouseholdRelationIncluded" };

        boolean anyIncluded = false;
        for (String key : includedKeys) {
            checkYN(answers, key);
            if ("Y".equals(answers.get(key))) anyIncluded = true;
        }
        if (!anyIncluded) throw new SimulationValidationException("선택 발급 시 표시할 항목을 하나 이상 선택해 주세요.");

        if ("Y".equals(answers.get(prefix + "PastAddressIncluded"))) {
            String scope = required(answers, prefix + "PastAddressScope", "과거 주소 범위");
            if (!Set.of("ALL", "RECENT").contains(scope)) {
                throw new SimulationValidationException("과거 주소 범위가 올바르지 않습니다.");
            }
            if ("RECENT".equals(scope)) {
                String yearsText = required(answers, prefix + "PastAddressYears", "최근 연도");
                try {
                    int years = Integer.parseInt(yearsText);
                    if (years < 1 || years > 99) throw new NumberFormatException();
                } catch (NumberFormatException ex) {
                    throw new SimulationValidationException("최근 연도는 1~99 사이로 입력해 주세요.");
                }
            }
        }

        if ("DEUNGBON".equals(type)) {
            validateDeungbon(answers);
        } else {
            validateChobon(answers);
        }
    }

    private void validateChobon(Map<String, String> answers) {
        if ("Y".equals(answers.get("chobonPastAddressIncluded"))) {
            checkYN(answers, "chobonPastAddressReportDateIncluded");
            checkYN(answers, "chobonPastAddressChangeReasonIncluded");
        }
        if ("Y".equals(answers.get("chobonIdNumbersIncluded"))) {
            checkYN(answers, "chobonRrnBackIncluded");
            checkYN(answers, "chobonForeignNumberIncluded");
        }
        checkChobonChoice(answers, "chobonPastHouseholdRelationIncluded",
                "chobonPastHouseholdRelationType", Set.of("GENERAL", "DETAIL"));
        checkChobonChoice(answers, "chobonPersonalChangeIncluded",
                "chobonPersonalChangeScope", Set.of("ALL", "NAME", "NUMBER"));
        checkChobonChoice(answers, "chobonMilitaryServiceIncluded",
                "chobonMilitaryServiceScope", Set.of("DATES", "ALL"));
        checkChobonChoice(answers, "chobonHouseholdRelationIncluded",
                "chobonHouseholdRelationType", Set.of("GENERAL", "DETAIL"));

        boolean detailed =
                ("Y".equals(answers.get("chobonPastHouseholdRelationIncluded")) &&
                        "DETAIL".equals(answers.get("chobonPastHouseholdRelationType"))) ||
                ("Y".equals(answers.get("chobonHouseholdRelationIncluded")) &&
                        "DETAIL".equals(answers.get("chobonHouseholdRelationType")));
        if (detailed) {
            String purpose = required(answers, "chobonPurpose", "초본 용도 및 목적");
            if (!PURPOSES.contains(purpose)) {
                throw new SimulationValidationException("초본 용도 및 목적이 올바르지 않습니다.");
            }
            if ("OTHER".equals(purpose)) {
                String other = required(answers, "chobonPurposeDetail", "기타 용도");
                if (other.length() > 100) {
                    throw new SimulationValidationException("기타 용도는 100자 이하로 입력해 주세요.");
                }
            }
        }
    }

    private void checkChobonChoice(Map<String, String> answers, String parent, String field, Set<String> allowed) {
        if ("Y".equals(answers.get(parent))) {
            String selected = required(answers, field, "초본 세부 선택");
            if (!allowed.contains(selected)) {
                throw new SimulationValidationException("초본 선택 항목이 올바르지 않습니다: " + field);
            }
        }
    }

    private void validateDeungbon(Map<String, String> answers) {
        if ("Y".equals(answers.get("deungbonHouseholdCompositionIncluded"))) {
            for (String key : new String[]{"deungbonHouseholdCompositionReasonIncluded", "deungbonHouseholdCompositionDateIncluded", "deungbonChangeReasonIncluded"}) {
                checkYN(answers, key);
            }
        }
        if ("Y".equals(answers.get("deungbonHouseholdMemberIncluded"))) {
            for (String key : new String[]{"deungbonHouseholdMemberNameIncluded", "deungbonHouseholdMemberChangeReasonIncluded",
                    "deungbonHouseholdMemberReportDateIncluded", "deungbonHouseholdMemberOtherNamesIncluded"}) {
                checkYN(answers, key);
            }
        }
        if ("Y".equals(answers.get("deungbonRrnBackIncluded"))) {
            String scope = required(answers, "deungbonRrnBackScope", "주민등록번호 뒷자리 표시 범위");
            if (!Set.of("HOUSEHOLD_ALL", "HOUSEHOLD_PART").contains(scope)) {
                throw new SimulationValidationException("주민등록번호 뒷자리 표시 범위가 올바르지 않습니다.");
            }
            if ("HOUSEHOLD_PART".equals(scope)) {
                String csv = required(answers, "deungbonSelectedMemberIds", "표시 대상 세대원");
                String[] ids = csv.split(",", -1);
                Set<String> unique = Arrays.stream(ids).collect(Collectors.toSet());
                if (ids.length == 0 || ids.length != unique.size() || !MEMBER_IDS.containsAll(unique)) {
                    throw new SimulationValidationException("표시 대상 세대원 정보가 올바르지 않습니다.");
                }
            }
        }
        if ("Y".equals(answers.get("deungbonRelationshipIncluded"))) {
            String relation = required(answers, "deungbonRelationshipType", "세대주 관계 표시 방식");
            if (!Set.of("GENERAL", "DETAIL").contains(relation)) {
                throw new SimulationValidationException("세대주 관계 표시 방식이 올바르지 않습니다.");
            }
            if ("DETAIL".equals(relation)) {
                String purpose = required(answers, "deungbonPurpose", "용도 및 목적");
                if (!PURPOSES.contains(purpose)) throw new SimulationValidationException("용도 및 목적이 올바르지 않습니다.");
                if ("OTHER".equals(purpose)) {
                    String other = required(answers, "deungbonPurposeDetail", "기타 용도");
                    if (other.length() > 100) throw new SimulationValidationException("기타 용도는 100자 이하로 입력해 주세요.");
                }
            }
        }
    }

    private void checkYN(Map<String, String> answers, String key) {
        String value = answers.get(key);
        if (!"Y".equals(value) && !"N".equals(value)) {
            throw new SimulationValidationException("선택 항목이 올바르지 않습니다: " + key);
        }
    }

    private String required(Map<String, String> answers, String key, String label) {
        String val = answers.get(key);
        if (val == null || val.isBlank()) throw new SimulationValidationException(label + " 항목을 입력해 주세요.");
        return val.trim();
    }
}
