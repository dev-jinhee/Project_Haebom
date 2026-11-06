package kr.co.oti.haebom.system.config;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

import kr.co.oti.haebom.business.admin.service.AdminMfaService;
import kr.co.oti.haebom.system.security.AdminMfaSuccessHandler;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			SecurityContextRepository repository,
			AdminMfaSuccessHandler successHandler) throws Exception {

		http
				// Spring Security 로그인 정보를 HTTP 세션에 저장하고 불러오도록 저장소를 지정합니다.
				// 관리자 계정은 OTP 확인 전까지 인증 완료 상태가 되지 않도록 성공 처리기와 같은 저장소를 사용합니다
				.securityContext(context ->
		        		context.securityContextRepository(repository))
				
				// [배포 보안 표준] 전역 CSRF 보호 활성화: 웹 폼 및 모든 REST API(/api/**) 대상 CSRF 토큰 검증
				// (비동기 fetch 요청은 common.js 전역 인터셉터가 X-CSRF-TOKEN 헤더를 자동 탑재)
				// 외부 연동인 행안부 도로명주소 팝업(/address/juso/popup)만 안전하게 예외 처리
				.csrf(csrf -> csrf
						.ignoringRequestMatchers(
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
					        antMatcher("/api/members/email-verification/**"),
					        antMatcher("/api/members/recovery/find-id/**"),
					        antMatcher("/api/members/recovery/find-password/**")
					    ).permitAll()

					    // 공개 조회 API
					    .requestMatchers(
					        antMatcher(HttpMethod.GET, "/api/main/**"),
					        antMatcher(HttpMethod.GET, "/api/address/**"),
					        antMatcher(HttpMethod.GET, "/api/scenario/**"),
					        antMatcher(HttpMethod.GET, "/api/inquiries")
					    ).permitAll()
					    
						 // 비밀번호 인증 후 OTP를 통과하기 전에는 ROLE_ADMIN 권한이 없으므로,
						 // MFA 등록·검증 화면(GET)과 코드 제출(POST) 경로만 Security 필터에서 허용합니다.
						 // 실제 접근 가능 여부는 컨트롤러에서 관리자 OTP 대기 세션과 만료 시간을 확인합니다.
					    .requestMatchers(
					    	antMatcher(HttpMethod.GET, "/admin/mfa/setup"),
						    antMatcher(HttpMethod.POST, "/admin/mfa/setup"),
						    antMatcher(HttpMethod.GET, "/admin/mfa/verify"),
						    antMatcher(HttpMethod.POST, "/admin/mfa/verify")
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
				
				.formLogin(form -> form
						.loginPage("/login")
					    .loginProcessingUrl("/login")
					    .usernameParameter("loginId")
					    .passwordParameter("password")
					    .successHandler(successHandler)
					    .failureUrl("/login?error")
					    .permitAll()
					)
				.logout(logout -> logout.permitAll());

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		BCryptPasswordEncoder delegate = new BCryptPasswordEncoder();
		return new PasswordEncoder() {
			@Override
			public String encode(CharSequence rawPassword) {
				return delegate.encode(decodePassword(rawPassword));
			}

			@Override
			public boolean matches(CharSequence rawPassword, String encodedPassword) {
				return delegate.matches(decodePassword(rawPassword), encodedPassword);
			}

			private String decodePassword(CharSequence rawPassword) {
				if (rawPassword == null) {
					return null;
				}
				try {
					return URLDecoder.decode(rawPassword.toString(), StandardCharsets.UTF_8.name());
				} catch (Exception e) {
					return rawPassword.toString();
				}
			}
		};
	}
	
	// Spring Security의 로그인 상태(SecurityContext)를 HTTP 세션에 저장하고,
	// 다음 요청에서 다시 불러올 저장소를 등록합니다.
	@Bean
	public SecurityContextRepository securityContextRepository() {
	    return new HttpSessionSecurityContextRepository();
	}

	// 로그인 성공 후 일반 회원과 관리자 흐름을 분기하는 처리기를 등록합니다.
	// 관리자는 OTP 인증을 거치도록 AdminMfaService와 세션 저장소를 전달합니다.
	@Bean
	public AdminMfaSuccessHandler adminMfaSuccessHandler(
	        AdminMfaService mfaService,
	        SecurityContextRepository repository) {
	    return new AdminMfaSuccessHandler(mfaService, repository);
	}
}
