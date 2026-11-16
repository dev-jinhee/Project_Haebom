package kr.co.oti.haebom.system.config;

import org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;

@Configuration
public class NotFoundErrorViewResolverConfig {

    @Bean
    public ErrorViewResolver notFoundErrorViewResolver() {
        return (request, status, model) -> {
            if (status == HttpStatus.NOT_FOUND) {
                return new ModelAndView("error/404", model);
            }
            return null;
        };
    }
}
