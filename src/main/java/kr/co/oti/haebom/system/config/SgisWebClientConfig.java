package kr.co.oti.haebom.system.config;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;

import io.netty.channel.ChannelOption;
import reactor.netty.http.client.HttpClient;

@Configuration
public class SgisWebClientConfig {

    @Bean("sgisWebClient")
    public WebClient sgisWebClient(WebClient.Builder builder) {

        HttpClient httpClient = HttpClient.create()
                .option(
                    ChannelOption.CONNECT_TIMEOUT_MILLIS,
                    5000
                )
                .responseTimeout(Duration.ofSeconds(10));

        return builder
                .clientConnector(
                    new ReactorClientHttpConnector(httpClient)
                )
                .build();
    }
}