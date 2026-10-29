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

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        String path = httpRequest.getRequestURI()
                .substring(httpRequest.getContextPath().length());

        // 공통 답변 저장 API만 Lucy 적용 제외
        if (path.startsWith("/api/simulation/progress/")) {
            chain.doFilter(request, response);
            return;
        }

        // 나머지는 기존 Lucy 필터 적용
        super.doFilter(request, response, chain);
    }
}