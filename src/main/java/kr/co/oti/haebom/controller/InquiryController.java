package kr.co.oti.haebom.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/inquiries")
public class InquiryController {

    /**
     * 1:1 문의 게시판 화면 (문의 목록 조회, 문의 작성 모달, FAQ 안내)
     */
    @GetMapping({"", "/"})
    public String inquiryList() {
        return "inquiries/inquiries";
    }
}
