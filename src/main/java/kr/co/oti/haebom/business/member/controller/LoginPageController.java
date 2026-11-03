package kr.co.oti.haebom.business.member.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginPageController {
	
	@GetMapping("/login")
	public String login() {
		return "pages/member/login";
	}
	
	@GetMapping("/member/find-id")
    public String findId() {
        return "pages/member/find-id";
    }

    @GetMapping("/member/find-password")
    public String findPassword() {
        return "pages/member/find-password";
    }
	
}
