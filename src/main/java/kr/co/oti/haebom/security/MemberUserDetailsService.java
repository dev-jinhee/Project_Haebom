package kr.co.oti.haebom.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import kr.co.oti.haebom.dto.MemberDTO;
import kr.co.oti.haebom.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberUserDetailsService implements UserDetailsService {
	
	private final MemberMapper memberMapper;
	
	public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
		
		MemberDTO member = memberMapper.findByLoginId(loginId);
		
		if(member == null) {
			throw new UsernameNotFoundException("회원 정보를 찾을 수 없습니다.");
		}
		
		if(!"ACTIVE".equals(member.getMemberStatus())) {
			throw new UsernameNotFoundException("사용할 수 없는 계정입니다.");
		}
		
		return new MemberPrincipal(member);
		
	}
}
