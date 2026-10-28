package kr.co.oti.haebom;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("kr.co.oti.haebom.mapper") //스프링에게 mapper 위치를 딱 짚어준다네?!
public class HaeBomApplication {

	public static void main(String[] args) {
		SpringApplication.run(HaeBomApplication.class, args);
	}

}
