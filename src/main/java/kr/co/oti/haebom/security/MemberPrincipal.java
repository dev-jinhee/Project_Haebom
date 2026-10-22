package kr.co.oti.haebom.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import kr.co.oti.haebom.domain.Member;

public class MemberPrincipal implements UserDetails {

	private final Integer memberId;
	private final String username;
	private final String password;
	private final String memberName;
	private final Collection<? extends GrantedAuthority> authorities;
	
	public MemberPrincipal(Member member) {
		this.memberId = member.getMemberId();
		this.username = member.getLoginId();
		this.password = member.getPassword();
		this.memberName = member.getMemberName();
		this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + member.getRole()));
	}
	
	public String getMemberName() {
		return memberName;
	}
	
	public Integer getMemberId() {
		return memberId;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
	
	
}
