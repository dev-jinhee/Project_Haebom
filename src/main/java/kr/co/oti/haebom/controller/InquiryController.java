package kr.co.oti.haebom.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import kr.co.oti.haebom.dto.QnaDTO;
import kr.co.oti.haebom.service.QnaService;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping({"/inquiry", "/inquiries"})
public class InquiryController {

    // 1:1 문의 게시판 화면(JSP)만 띄어주기
    @GetMapping({"", "/"})
    public String inquiryList(Model model) {
    	
    	//문의 게시판 JSP 화면 열어주기!
        return "inquiries/inquiries";
    }
}
