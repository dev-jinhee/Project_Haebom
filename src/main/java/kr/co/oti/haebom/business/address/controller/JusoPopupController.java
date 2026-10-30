package kr.co.oti.haebom.business.address.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/** 도로명주소 팝업 페이지. REST API가 아닌 JSP view 반환 Controller. */
@Controller
public class JusoPopupController {

	@Value("${juso.confirm-key}")
	private String jusoConfirmKey;

	// 공식 도로명주소 검색이 POST로 선택 결과를 돌려주므로 GET과 POST 모두 수용
	@RequestMapping(value = "/address/juso/popup", method = { RequestMethod.GET, RequestMethod.POST })
	public String jusoPopup(Model model) {
		model.addAttribute("jusoConfirmKey", jusoConfirmKey);

		return "address/juso-popup";
	}
}
