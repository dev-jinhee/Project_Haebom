
package kr.co.oti.haebom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringAntMatchers("/api/**")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/admin/**", "/scenario", "/scenario/**",
                	    "/inquiries/**", "/css/**", "/js/**", "/images/**", "/api/**",
                		 // Swagger UI 및 OpenAPI 문서
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs",
                        "/v3/api-docs/**")
                .permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .permitAll()
            )
            .logout(logout -> logout
                .permitAll()
            );

        return http.build();
    }
}
