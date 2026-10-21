package kr.co.oti.haebom.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/simulation")
public class SimulationController {
	@GetMapping
    public String simulationPage() {
        return "scenario/simulation";
    }
}