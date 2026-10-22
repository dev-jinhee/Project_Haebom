package kr.co.oti.haebom.service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.domain.Member;
import kr.co.oti.haebom.dto.MemberJoinRequestDTO;
import kr.co.oti.haebom.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {
	
	private final MemberMapper memberMapper;
	private final PasswordEncoder passwordEncoder;
	
	@Transactional
	public void join(MemberJoinRequestDTO request) {
		
		if(request.getTermsAgreed() == null || !request.getTermsAgreed()) {
			throw new IllegalArgumentException("필수 약관에 동의해 주세요.");
		}
		
		if(memberMapper.countByLoginId(request.getLoginId()) > 0) {
			throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
		}
		
		if(memberMapper.countByEmail(request.getEmail()) > 0) {
			throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
		}
		
		int code = Integer.parseInt(request.getRegistrationNumberBackFirstDigit());
		LocalDate birthDate = toBirthDate(request.getRegistrationNumberFront(), code);
		String gender = toGender(code);
		String encodedPassword = passwordEncoder.encode(request.getPassword());

		Member member = new Member();
		member.setLoginId(request.getLoginId());
		member.setPassword(encodedPassword);
		member.setEmail(request.getEmail());
		member.setMemberName(request.getMemberName());
		member.setBirthDate(birthDate);
		member.setGender(gender);

		memberMapper.insertMember(member);
	}
	
	private LocalDate toBirthDate(String registrationNumberFront, int code) {
		String centuryPrefix = switch (code) {
			case 1, 2, 5, 6 -> "19";
			case 3, 4, 7, 8 -> "20";
			default -> throw new IllegalArgumentException("주민등록번호 뒷자리가 올바르지 않습니다.");
		};
	
		try {
			return LocalDate.parse(centuryPrefix + registrationNumberFront, DateTimeFormatter.BASIC_ISO_DATE);
		} catch (DateTimeException ex) {
			throw new IllegalArgumentException("주민등록번호 앞자리가 올바르지 않습니다.");
		}
	}
	
	private String toGender(int code) {
		return switch(code) {
			case 1, 3, 5, 7 -> "M";
			case 2, 4, 6, 8 -> "F";
			default -> throw new IllegalArgumentException("주민등록번호 뒷자리가 올바르지 않습니다.");
		};
	}
}
