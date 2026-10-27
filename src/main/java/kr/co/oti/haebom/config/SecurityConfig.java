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

		http
				// CSRF 보호 정책 정비: 일반 폼 요청(로그아웃 등)은 CSRF 토큰을 검증하고,
				// 비동기 REST API(/api/**) 및 외부 행안부 주소 팝업 콜백(/address/juso/popup)은 안전하게 예외 처리
				.csrf(csrf -> csrf
						.ignoringRequestMatchers(
								antMatcher("/api/**"),
								antMatcher("/address/juso/popup")
						)
				)

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
