package kr.co.oti.haebom.controller.api;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import kr.co.oti.haebom.dto.MemberJoinRequestDTO;
import kr.co.oti.haebom.service.MemberService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/members")
public class MemberApiController {

	private final MemberService memberService;

	@PostMapping("/join")
	@ResponseStatus(HttpStatus.CREATED)
	public void join(@Valid @RequestBody MemberJoinRequestDTO request) {
		memberService.join(request);
	}
}
