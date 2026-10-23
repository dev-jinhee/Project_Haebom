package kr.co.oti.haebom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
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
            .authorizeRequests(auth -> auth
                .antMatchers("/", "/login", "/error", "/member/signup", "/member/find-id", "/member/find-password",
                        "/api/members/join", "/admin/**",
                        "/inquiry/**", "/inquiries/**", "/css/**", "/js/**", "/images/**", "/api/**",
                        // Swagger UI 및 OpenAPI 문서
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs",
                        "/v3/api-docs/**")
                .permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                	.loginPage("/login")
                	.loginProcessingUrl("/login")
                	.usernameParameter("loginId")
                	.passwordParameter("password")
                	// ⭐ 스마트 리다이렉트 (이전 보던 페이지 파라미터가 있으면 거기로 복귀!)
                	.successHandler((request, response, authentication) -> {
                		String redirect = request.getParameter("redirect");
                		if (redirect != null && !redirect.isBlank() && redirect.startsWith("/")) {
                			response.sendRedirect(redirect);
                		} else {
                			response.sendRedirect("/");
                		}
                	})
                	.failureUrl("/login?error")
                    .permitAll()
                )
            .logout(logout -> logout
                .permitAll()
            );

        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
    	return new BCryptPasswordEncoder();
    }
}
