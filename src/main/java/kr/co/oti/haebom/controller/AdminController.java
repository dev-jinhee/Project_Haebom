package kr.co.oti.haebom.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {

    /**
     * 관리자 통합 화면 (대시보드 / 회원 / 시나리오 / 문의 관리)
     * /admin 뿐 아니라 /admin/members 등 하위 경로 요청도 유연하게 수용
     */
    @GetMapping({"", "/", "/{subPage}"})
    public String adminMain() {
        return "admin/admin";
    }
}
