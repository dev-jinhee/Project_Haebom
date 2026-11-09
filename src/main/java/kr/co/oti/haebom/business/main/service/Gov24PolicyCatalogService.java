package kr.co.oti.haebom.business.main.service;

import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import kr.co.oti.haebom.business.main.dto.Gov24PolicyResponseDTO;
import kr.co.oti.haebom.business.main.dto.Gov24PolicyResponseDTO.Policy;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class Gov24PolicyCatalogService {
    private static final int API_PAGE_SIZE = 100;
    private final String baseUrl;
    private final String serviceKey;
    private final WebClient webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs()
                    .maxInMemorySize(5 * 1024 * 1024))
            .build();
    private volatile Mono<List<Policy>> catalogCache;

    public Gov24PolicyCatalogService(
            @Value("${gov24.api.base-url}") String baseUrl,
            @Value("${gov24.api.service-key}") String serviceKey) {
        this.baseUrl = baseUrl;
        this.serviceKey = serviceKey;
    }

    public Mono<List<Policy>> getAllPolicies() {
        if (catalogCache == null) {
            synchronized (this) {
                if (catalogCache == null) {
                    catalogCache = loadAllPages().cache(
                        value -> Duration.ofHours(24),
                        error -> Duration.ZERO,
                        () -> Duration.ZERO);
                }
            }
        }
        return catalogCache;
    }

    private Mono<List<Policy>> loadAllPages() {
        return fetchPage(1).flatMap(first -> {
            List<Policy> firstItems = first.getData();
            if (firstItems == null || firstItems.isEmpty()) {
            	return Mono.<List<Policy>>just(Collections.emptyList());
            }
            int pageCount = (int) Math.ceil(
                    (double) first.getTotalCount() / API_PAGE_SIZE);
            if (pageCount <= 1) {
                return Mono.just(Collections.unmodifiableList(firstItems));
            }

            return Flux.range(2, pageCount - 1)
                .flatMapSequential(this::fetchPage, 4)
                .map(Gov24PolicyResponseDTO::getData)
                .filter(data -> data != null)
                .concatMap(Flux::fromIterable)
                .collectList()
                .map(rest -> {
                    List<Policy> all = new ArrayList<>(firstItems);
                    all.addAll(rest);
                    return Collections.unmodifiableList(all);
                });
        });
    }

    private Mono<Gov24PolicyResponseDTO> fetchPage(int page) {
        URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/serviceList")
            .queryParam("serviceKey", serviceKey)
            .queryParam("page", page)
            .queryParam("perPage", API_PAGE_SIZE)
            .queryParam("returnType", "JSON")
            .build().encode().toUri();
        return webClient.get().uri(uri).retrieve()
            .bodyToMono(Gov24PolicyResponseDTO.class);
    }
}
