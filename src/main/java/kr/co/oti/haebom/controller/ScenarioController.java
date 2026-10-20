package kr.co.oti.haebom.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/scenario")
public class ScenarioController {
	@GetMapping
    public String list() {
        return "scenario/scenario-list";
    }
}
