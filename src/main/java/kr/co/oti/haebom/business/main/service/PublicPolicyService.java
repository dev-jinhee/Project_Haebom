package kr.co.oti.haebom.business.main.service;

import java.util.List;
import java.util.Locale;
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

    private final Gov24PolicyCatalogService catalogService;

    public Mono<List<String>> getCategories() {
        return catalogService.getAllPolicies().map(policies -> policies.stream()
                .map(Policy::getServiceField)
                .filter(field -> field != null && !field.trim().isEmpty())
                .map(String::trim)
                .distinct()
                .sorted()
                .collect(Collectors.toList()));
    }

    public Mono<PolicySearchPageDTO> search(
            String keyword, String category, int requestedPage) {
        String word = keyword == null ? "" : keyword.trim();
        String selected = category == null || category.trim().isEmpty()
                ? "ALL" : category.trim();

        return catalogService.getAllPolicies().map(policies -> {
            List<Policy> filtered = policies.stream()
                    .filter(policy -> "ALL".equals(selected)
                            || (policy.getServiceField() != null
                            && selected.equals(policy.getServiceField().trim())))
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
