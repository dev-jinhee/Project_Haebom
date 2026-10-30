package kr.co.oti.haebom.business.inquiry.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import kr.co.oti.haebom.system.security.MemberPrincipal;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping({"/inquiry", "/inquiries"})
@RequiredArgsConstructor
public class InquiryController {

    // 1:1 문의 게시판 화면(JSP)만 띄어주기
    @GetMapping({"", "/"})
    public String inquiryList(@AuthenticationPrincipal MemberPrincipal memberPrincipal, Model model) {
        if (memberPrincipal != null) {
            model.addAttribute("loginMemberId", memberPrincipal.getMemberId());
            model.addAttribute("loginUsername", memberPrincipal.getUsername());
            model.addAttribute("isLoggedIn", true);
            // 관리자(ROLE_ADMI) 권한 여부 확인 후 모델에 전달!
            boolean isAdmin = memberPrincipal.getAuthorities() != null
            		&& memberPrincipal.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
            model.addAttribute("isAdmin", isAdmin);
        } else {
            model.addAttribute("loginMemberId", null);
            model.addAttribute("loginUsername", null);
            model.addAttribute("isLoggedIn", false);
            model.addAttribute("isAdmin", false);
        }
        return "inquiries/inquiries";
    }
}
