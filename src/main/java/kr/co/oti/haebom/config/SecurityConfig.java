package kr.co.oti.haebom.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http // 임시 단계: 모든 요청에서 CSRF 토큰 검사를 하지 않습니다.
				.csrf(csrf -> csrf.disable())

				// URL별 인증·권한은 계속 검사합니다.
				// 비로그인 접근 허용
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/", "/login", "/error", "/member/signup", "/member/find-id",
								"/member/find-password", "/css/**", "/js/**", "/images/**", "/favicon.ico",
								"/address/juso/popup", "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs",
								"/v3/api-docs/**")
						.permitAll()
						// 회원 관련 공개 API
						.requestMatchers("/api/members/join", "/api/members/id-availability",
								"/api/members/email-verification/**")
						.permitAll()
						// 공개 조회 API (GET)
						.requestMatchers(HttpMethod.GET, "/api/main/**", "/api/address/**", "/api/scenario/**",
								"/api/inquiries")
						.permitAll()
						// 관리자 전용
						.requestMatchers("/admin/**", "/api/admin/**").hasRole("ADMIN")
						// 로그인 필수
						.requestMatchers("/mypage", "/api/mypage/**", "/api/simulation/**", "/api/simulation/move/**",
								"/api/inquiries/**")
						.authenticated()

						.anyRequest().authenticated())
				
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

/*
 * @Configuration public class SecurityConfig {
 * 
 * @Bean public SecurityFilterChain securityFilterChain(HttpSecurity http)
 * throws Exception { http .csrf(csrf -> csrf
 * .ignoringAntMatchers("/address/juso/popup") //주소팝업은 외부 서비스라 CSRF 예외 필요 )
 * .authorizeHttpRequests(auth -> auth .requestMatchers("/", "/login", "/error",
 * "/member/signup", "/member/find-id", "/member/find-password",
 * "/api/members/join", "/css/**", "/js/**", "/images/**",
 * "/api/**","/address/juso/popup", // Swagger UI 및 OpenAPI 문서
 * "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs", "/v3/api-docs/**")
 * .permitAll() .anyRequest().authenticated() ) .formLogin(form -> form
 * .loginPage("/login") .loginProcessingUrl("/login")
 * .usernameParameter("loginId") .passwordParameter("password") // ⭐ 스마트 리다이렉트
 * (이전 보던 페이지 파라미터가 있으면 거기로 복귀!) .successHandler((request, response,
 * authentication) -> { String redirect = request.getParameter("redirect"); if
 * (redirect != null && !redirect.isBlank() && redirect.startsWith("/")) {
 * response.sendRedirect(redirect); } else { response.sendRedirect("/"); } })
 * .failureUrl("/login?error") .permitAll() ) .logout(logout -> logout
 * .permitAll() );
 * 
 * return http.build(); }
 * 
 * @Bean public PasswordEncoder passwordEncoder() { return new
 * BCryptPasswordEncoder(); } }
 */
