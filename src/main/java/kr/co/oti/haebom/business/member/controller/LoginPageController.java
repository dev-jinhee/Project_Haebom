package kr.co.oti.haebom.business.member.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginPageController {
	
	@GetMapping("/login")
	public String login() {
		return "member/login";
	}
	
	@GetMapping("/member/find-id")
    public String findId() {
        return "member/find-id";
    }

    @GetMapping("/member/find-password")
    public String findPassword() {
        return "member/find-password";
    }
	
}
