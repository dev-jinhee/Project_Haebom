package kr.co.oti.haebom.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.oti.haebom.domain.Member;
import kr.co.oti.haebom.dto.MemberJoinRequestDTO;
import kr.co.oti.haebom.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService{
	
	private final MemberMapper memberMapper;
	private final PasswordEncoder passwordEncoder;
	
	@Override
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
		
		Member member = new Member();
		member.setLoginId(request.getLoginId());
		member.setPassword(passwordEncoder.encode(request.getPassword()));
		member.setEmail(request.getEmail());
		member.setMemberName(request.getMemberName());
		member.setBirthDate(request.getBirthDate());
		member.setGender(request.getGender());

		memberMapper.insertMember(member);
	}
	
	@Override
	public boolean isLoginIdAvailable(String loginId) {
		return memberMapper.countByLoginId(loginId) == 0;
	}
}
