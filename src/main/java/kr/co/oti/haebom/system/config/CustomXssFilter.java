package kr.co.oti.haebom.system.config;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import com.navercorp.lucy.security.xss.servletfilter.XssEscapeServletFilter;

public class CustomXssFilter extends XssEscapeServletFilter {

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        // 시뮬레이션을 포함한 모든 요청에 Lucy XSS 필터 적용!
        super.doFilter(request, response, chain);
    }
}