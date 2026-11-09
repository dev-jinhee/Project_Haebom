package kr.co.oti.haebom.business.main.service;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import kr.co.oti.haebom.business.main.dto.Gov24PolicyResponseDTO.Policy;
import kr.co.oti.haebom.business.main.dto.PolicySearchPageDTO;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class PublicPolicyService {
    private static final int PAGE_SIZE = 5;

    private static final Map<String, Set<String>> CATEGORY_FIELDS = Map.of(
        "LIFE_FAMILY", Set.of("실제 분야값"),
        "BIRTH_CHILDCARE", Set.of("실제 분야값"),
        "WELFARE_FINANCE", Set.of("실제 분야값"),
        "EDUCATION_JOB_BUSINESS", Set.of("실제 분야값")
    );

    private final Gov24PolicyCatalogService catalogService;

    public Mono<PolicySearchPageDTO> search(
            String keyword, String category, int requestedPage) {
        String word = keyword == null ? "" : keyword.trim();
        String selected = category == null || category.trim().isEmpty()
                ? "ALL" : category.trim();
        Set<String> fields = CATEGORY_FIELDS.get(selected);

        if (!"ALL".equals(selected) && fields == null) {
            throw new IllegalArgumentException("지원하지 않는 정책 카테고리입니다.");
        }

        return catalogService.getAllPolicies().map(policies -> {
            List<Policy> filtered = policies.stream()
                    .filter(policy -> "ALL".equals(selected)
                            || (policy.getServiceField() != null
                            && fields.contains(policy.getServiceField().trim())))
                    .filter(policy -> word.isEmpty()
                            || (policy.getServiceName() != null
                            && policy.getServiceName().toLowerCase(Locale.ROOT)
                                    .contains(word.toLowerCase(Locale.ROOT))))
                    .collect(Collectors.toList());

            long totalCount = filtered.size();
            int totalPages = (int) Math.ceil((double) totalCount / PAGE_SIZE);
            int page = totalPages == 0 ? 1
                    : Math.min(Math.max(requestedPage, 1), totalPages);
            int from = Math.min((page - 1) * PAGE_SIZE, filtered.size());
            int to = Math.min(from + PAGE_SIZE, filtered.size());

            return new PolicySearchPageDTO(
                    filtered.subList(from, to),
                    page,
                    PAGE_SIZE,
                    totalCount,
                    totalPages);
        });
    }
}