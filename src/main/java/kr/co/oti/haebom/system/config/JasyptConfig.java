package kr.co.oti.haebom.system.config;

import org.jasypt.encryption.StringEncryptor;
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Jasypt 프로퍼티 암호화/복호화 빈 설정
 * - 알고리즘: PBEWITHHMACSHA512ANDAES_256 (NIST 표준 AES-256 + HMAC-SHA512)
 * - 블록 암호화 운영모드 지원을 위한 RandomIvGenerator 적용
 */
@Configuration
public class JasyptConfig {

    // 코드(Git)에 비밀키를 남기지 않고, 서버 실행 시 VM 옵션(-D)이나 OS 환경변수로만 안전하게 주입받음
    @Value("${jasypt.encryptor.password}")
    private String encryptKey;

    @Bean("jasyptStringEncryptor")
    public StringEncryptor stringEncryptor() {
        // 멀티스레드 환경에서 동시 복호화 요청을 효율적으로 처리하기 위한 풀링(Pooling) 암호화 객체
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();

        // 1. 마스터 비밀키: 암·복호화에 사용할 비밀번호 지정
        config.setPassword(encryptKey);

        // 2. 암호화 알고리즘: 기존 취약한 DES/MD5 대신, 현존 최고 수준 보안인 AES-256 및 SHA-512 해시 적용
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");

        // 3. 키 생성 반복 횟수: 비밀키 유추 공격(Brute Force)을 막기 위해 1,000번 반복 해싱하여 보안 강도 극대화
        config.setKeyObtentionIterations("1000");

        // 4. 인스턴스 풀 크기: 동시 암·복호화를 수행할 프로세서 개수 (일반 웹 서버는 1로 충분)
        config.setPoolSize("1");

        // 5. 보안 프로바이더: 자바 표준 암호화 라이브러리(Java Cryptography Extension) 사용
        config.setProviderName("SunJCE");

        // 6. 솔트(Salt) 생성기: 동일한 평문이라도 암호문이 매번 다르게 나오도록 무작위 솔트값 생성
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");

        // 7. IV(초기화 벡터) 생성기: AES-256 블록 암호화의 패턴 분석 공격을 방어하기 위한 필수 무작위 난수 생성기
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");

        // 8. 출력 형식: 암호화된 바이너리 데이터를 properties 파일에 저장할 수 있도록 Base64 문자열로 인코딩
        config.setStringOutputType("base64");

        encryptor.setConfig(config);
        return encryptor;
    }
}
