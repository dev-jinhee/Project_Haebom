package kr.co.oti.haebom.system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.view.tiles3.TilesConfigurer;
import org.springframework.web.servlet.view.tiles3.TilesViewResolver;

public class TilesConfig {

	//Tiles가 조립 규칙을 읽을 tiles.xml의 위치를 알려줌
    @Bean
    public TilesConfigurer tilesConfigurer() {
        TilesConfigurer configurer = new TilesConfigurer();
        configurer.setDefinitions("/WEB-INF/tiles/tiles.xml");
        configurer.setCheckRefresh(true);
        return configurer;
    }

    //Controller가 반환한 뷰 이름을 확인해서, tiles/로 시작하면 Tiles 방식으로 화면을 렌더링하게 함
    @Bean
    public TilesViewResolver tilesViewResolver() {
        TilesViewResolver resolver = new TilesViewResolver();
        resolver.setOrder(0);
        resolver.setViewNames("tiles/*");
        return resolver;
    }
}
