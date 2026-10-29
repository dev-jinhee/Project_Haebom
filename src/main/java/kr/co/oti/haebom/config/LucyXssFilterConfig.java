package kr.co.oti.haebom.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LucyXssFilterConfig {

    @Bean
    public FilterRegistrationBean<CustomXssFilter> lucyXssFilter() {

        FilterRegistrationBean<CustomXssFilter> registrationBean =
                new FilterRegistrationBean<>();

        registrationBean.setFilter(new CustomXssFilter());

        registrationBean.setOrder(1);
        registrationBean.addUrlPatterns("/*");

        return registrationBean;
    }
}
