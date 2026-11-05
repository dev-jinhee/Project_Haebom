package kr.co.oti.haebom.business.admin.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import kr.co.oti.haebom.business.admin.service.AdminMfaService;
import kr.co.oti.haebom.system.security.AdminMfaSuccessHandler;
import kr.co.oti.haebom.system.security.MemberPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.web.context.SecurityContextRepository;

@Controller
@RequestMapping("/admin/mfa")
@RequiredArgsConstructor
public class AdminMfaController {

    private static final String FAILED_ATTEMPTS = "ADMIN_MFA_FAILED_ATTEMPTS";
    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final AdminMfaService mfaService;
    private final UserDetailsService userDetailsService;
    private final SecurityContextRepository securityContextRepository;

    // 첫 등록 화면: OTP 대기 관리자만 QR을 볼 수 있습니다.
    @GetMapping("/setup")
    public String setup(HttpServletRequest request, Model model) {
        MemberPrincipal admin = getPendingAdmin(request);
        if (admin == null) {
            return "redirect:/login?mfaExpired";
        }
        if (mfaService.isEnabled(admin.getMemberId())) {
            return "redirect:/admin/mfa/verify";
        }

        HttpSession session = request.getSession(false);
        model.addAttribute("loginId", admin.getUsername());
        model.addAttribute("qrDataUri",
                mfaService.createEnrollmentQr(admin.getUsername(), session));
        return "admin/mfa-setup";
    }

    // 이미 등록한 관리자의 OTP 입력 화면입니다.
    @GetMapping("/verify")
    public String verify(HttpServletRequest request) {
        MemberPrincipal admin = getPendingAdmin(request);
        if (admin == null) {
            return "redirect:/login?mfaExpired";
        }
        if (!mfaService.isEnabled(admin.getMemberId())) {
            return "redirect:/admin/mfa/setup";
        }
        return "admin/mfa-verify";
    }

    // 최초 등록: 세션 임시 비밀키의 OTP가 맞으면 암호화해 DB에 저장한 뒤 로그인합니다.
    @PostMapping("/setup")
    public String completeSetup(@RequestParam("code") String code,
                                HttpServletRequest request,
                                HttpServletResponse response) {
        MemberPrincipal admin = getPendingAdmin(request);
        if (admin == null) {
            return "redirect:/login?mfaExpired";
        }
        if (mfaService.isEnabled(admin.getMemberId())) {
            return "redirect:/admin/mfa/verify";
        }

        HttpSession session = request.getSession(false);
        if (!mfaService.completeEnrollment(admin.getMemberId(), code, session)) {
            return failedAttempt(session, "/admin/mfa/setup");
        }
        if (!completeAdminLogin(admin.getUsername(), request, response)) {
            return "redirect:/login?mfaExpired";
        }
        return "redirect:/admin";
    }

    // 재로그인: DB에 저장된 비밀키로 입력한 OTP를 확인한 뒤 로그인합니다.
    @PostMapping("/verify")
    public String completeVerification(@RequestParam("code") String code,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        MemberPrincipal admin = getPendingAdmin(request);
        if (admin == null) {
            return "redirect:/login?mfaExpired";
        }
        if (!mfaService.isEnabled(admin.getMemberId())) {
            return "redirect:/admin/mfa/setup";
        }

        if (!mfaService.verifyLoginCode(admin.getMemberId(), code)) {
            return failedAttempt(request.getSession(false), "/admin/mfa/verify");
        }
        if (!completeAdminLogin(admin.getUsername(), request, response)) {
            return "redirect:/login?mfaExpired";
        }
        return "redirect:/admin";
    }

    // 세션에 저장된 대기 관리자와 만료 시각을 확인하고, DB에서 현재도 활성 관리자일 때만 반환합니다.
    private MemberPrincipal getPendingAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }

        Object loginIdValue = session.getAttribute(AdminMfaSuccessHandler.PENDING_LOGIN_ID);
        Object expiresAtValue = session.getAttribute(AdminMfaSuccessHandler.PENDING_EXPIRES_AT);
        if (!(loginIdValue instanceof String) || !StringUtils.hasText((String) loginIdValue)
                || !(expiresAtValue instanceof Number)
                || System.currentTimeMillis() > ((Number) expiresAtValue).longValue()) {
            clearPendingState(session);
            return null;
        }

        try {
            UserDetails user = userDetailsService.loadUserByUsername((String) loginIdValue);
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
            if (isAdmin && user instanceof MemberPrincipal) {
                return (MemberPrincipal) user;
            }
        } catch (UsernameNotFoundException ignored) {
            // 계정이 없거나 ACTIVE 상태가 아니면 MFA 대기를 취소합니다.
        }

        clearPendingState(session);
        return null;
    }

    // OTP 성공 후에만 새 로그인 인증을 만들고, 세션에 SecurityContext를 저장합니다.
    private boolean completeAdminLogin(String loginId,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        MemberPrincipal admin = loadActiveAdmin(loginId);
        if (admin == null) {
            clearPendingState(request.getSession(false));
            return false;
        }

        request.changeSessionId();
        HttpSession session = request.getSession(false);
        clearPendingState(session);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                admin, null, admin.getAuthorities());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        return true;
    }

    private MemberPrincipal loadActiveAdmin(String loginId) {
        try {
            UserDetails user = userDetailsService.loadUserByUsername(loginId);
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
            return isAdmin && user instanceof MemberPrincipal
                    ? (MemberPrincipal) user : null;
        } catch (UsernameNotFoundException e) {
            return null;
        }
    }

    // OTP를 5번 틀리면 대기 정보를 지우고 다시 로그인하도록 합니다.
    private String failedAttempt(HttpSession session, String retryPath) {
        if (session == null) {
            return "redirect:/login?mfaExpired";
        }
        Object value = session.getAttribute(FAILED_ATTEMPTS);
        int attempts = value instanceof Integer ? (Integer) value : 0;
        attempts++;
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            clearPendingState(session);
            return "redirect:/login?mfaExpired";
        }
        session.setAttribute(FAILED_ATTEMPTS, attempts);
        return "redirect:" + retryPath + "?error";
    }

    private void clearPendingState(HttpSession session) {
        if (session == null) {
            return;
        }
        session.removeAttribute(AdminMfaSuccessHandler.PENDING_LOGIN_ID);
        session.removeAttribute(AdminMfaSuccessHandler.PENDING_EXPIRES_AT);
        session.removeAttribute(FAILED_ATTEMPTS);
        mfaService.clearEnrollment(session);
    }
}
