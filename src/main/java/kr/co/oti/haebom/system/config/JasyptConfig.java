package kr.co.oti.haebom.system.config;

import org.jasypt.encryption.StringEncryptor;
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JasyptConfig {

    // 코드에 어떤 키도 남기지 않고, 오직 외부(VM 옵션 또는 환경변수)에서만 주입받음
    @Value("${jasypt.encryptor.password}")
    private String encryptKey;

    @Bean("jasyptStringEncryptor")
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();

        config.setPassword(encryptKey); // 주입받은 마스터 키
        config.setAlgorithm("PBEWithMD5AndDES"); // 표준 암호화 알고리즘
        config.setKeyObtentionIterations("1000");  // 해싱 반복 횟수 (보안 강도 향상)
        config.setPoolSize("1");  // 인스턴스 풀 크기
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setStringOutputType("base64");

        encryptor.setConfig(config);
        return encryptor;
    }
}