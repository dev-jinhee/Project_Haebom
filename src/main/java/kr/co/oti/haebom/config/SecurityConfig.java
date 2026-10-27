package kr.co.oti.haebom.config;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http // 임시 단계: 모든 요청에서 CSRF 토큰 검사를 하지 않습니다.
				.csrf(csrf -> csrf.disable())

				// URL별 인증·권한은 계속 검사합니다.
				.authorizeHttpRequests(auth -> auth

					    // 비로그인 접근 허용
					    .requestMatchers(
					        antMatcher("/"),
					        antMatcher("/login"),
					        antMatcher("/error"),
					        antMatcher("/member/signup"),
					        antMatcher("/member/find-id"),
					        antMatcher("/member/find-password"),
					        antMatcher("/css/**"),
					        antMatcher("/js/**"),
					        antMatcher("/images/**"),
					        antMatcher("/favicon.ico"),
					        antMatcher("/address/juso/popup"),
					        antMatcher("/swagger-ui.html"),
					        antMatcher("/swagger-ui/**"),
					        antMatcher("/v3/api-docs"),
					        antMatcher("/v3/api-docs/**")
					    ).permitAll()

					    // 회원 관련 공개 API
					    .requestMatchers(
					        antMatcher("/api/members/join"),
					        antMatcher("/api/members/id-availability"),
					        antMatcher("/api/members/email-verification/**")
					    ).permitAll()

					    // 공개 조회 API
					    .requestMatchers(
					        antMatcher(HttpMethod.GET, "/api/main/**"),
					        antMatcher(HttpMethod.GET, "/api/address/**"),
					        antMatcher(HttpMethod.GET, "/api/scenario/**"),
					        antMatcher(HttpMethod.GET, "/api/inquiries")
					    ).permitAll()

					    // 관리자 전용
					    .requestMatchers(
					        antMatcher("/admin/**"),
					        antMatcher("/api/admin/**")
					    ).hasRole("ADMIN")

					    // 로그인 필수
					    .requestMatchers(
					        antMatcher("/mypage"),
					        antMatcher("/api/mypage/**"),
					        antMatcher("/api/simulation/**"),
					        antMatcher("/api/inquiries/**")
					    ).authenticated()

					    .anyRequest().authenticated()
					)
				
				.formLogin(form -> form.loginPage("/login").loginProcessingUrl("/login").usernameParameter("loginId")
						.passwordParameter("password").successHandler((request, response, authentication) -> {
							String redirect = request.getParameter("redirect");
							if (redirect != null && !redirect.isBlank() && redirect.startsWith("/")) {
								response.sendRedirect(redirect);
							} else {
								response.sendRedirect("/");
							}
						}).failureUrl("/login?error").permitAll())
				.logout(logout -> logout.permitAll());

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
