package kr.co.oti.haebom.system.security;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.SecurityContextRepository;

import kr.co.oti.haebom.business.admin.service.AdminMfaService;

public class AdminMfaSuccessHandler implements AuthenticationSuccessHandler {
    public static final String PENDING_LOGIN_ID = "ADMIN_MFA_PENDING_LOGIN_ID";
    public static final String PENDING_EXPIRES_AT = "ADMIN_MFA_PENDING_EXPIRES_AT";

    private final AdminMfaService mfaService;
    private final SecurityContextRepository contextRepository;

    public AdminMfaSuccessHandler(AdminMfaService mfaService,
                                  SecurityContextRepository contextRepository) {
        this.mfaService = mfaService;
        this.contextRepository = contextRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!admin) {
            String redirect = request.getParameter("redirect");

            if (redirect != null && !redirect.isBlank()
                    && redirect.startsWith("/") && !redirect.startsWith("//")) {
                response.sendRedirect(redirect);
            } else {
                response.sendRedirect("/");
            }
            return;
        }

        MemberPrincipal principal = (MemberPrincipal) authentication.getPrincipal();
        HttpSession session = request.getSession(true);
        session.setAttribute(PENDING_LOGIN_ID, principal.getUsername());
        session.setAttribute(PENDING_EXPIRES_AT, System.currentTimeMillis() + 5 * 60 * 1000L);

        // 비밀번호만 통과한 ADMIN을 로그인 완료 상태로 남기지 않습니다.
        SecurityContextHolder.clearContext();
        contextRepository.saveContext(SecurityContextHolder.createEmptyContext(), request, response);

        response.sendRedirect(mfaService.isEnabled(principal.getMemberId())
                ? "/admin/mfa/verify" : "/admin/mfa/setup");
    }
}
