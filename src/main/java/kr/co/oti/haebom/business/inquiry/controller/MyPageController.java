package kr.co.oti.haebom.business.inquiry.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MyPageController {
	
	@GetMapping("/mypage")
	public String myPage() {
		return "member/mypage";
	}
}
