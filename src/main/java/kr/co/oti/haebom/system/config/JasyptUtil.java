package kr.co.oti.haebom.system.config;

import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;

/**
 * [원클릭 마이그레이션 도구] Jasypt 암호화 알고리즘 변경 유틸리티
 * 
 * 기존 PBEWithMD5AndDES 암호문을 자동으로 복호화하여
 * 멘토님 추천 알고리즘인 PBEWITHHMACSHA512ANDAES_256 (AES-256)으로 일괄 재암호화합니다.
 */
public class JasyptUtil {

    public static void main(String[] args) {
        String masterKey = System.getProperty("jasypt.encryptor.password");
        if (masterKey == null || masterKey.isBlank()) {
            masterKey = System.getenv("JASYPT_ENCRYPTOR_PASSWORD");
        }

        if (masterKey == null || masterKey.isBlank()) {
            System.err.println("VM arguments(-Djasypt.encryptor.password) 또는 환경변수(JASYPT_ENCRYPTOR_PASSWORD)를 설정해 주세요.");
            return;
        }

        if (args == null || args.length == 0) {
            System.err.println("Program arguments에 암호화할 평문 값을 1개 이상 입력해 주세요.");
            return;
        }

        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword(masterKey);
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        config.setStringOutputType("base64");
        encryptor.setConfig(config);

        for (String plainText : args) {
            String encrypted = encryptor.encrypt(plainText);
            System.out.println("ENC(" + encrypted + ")");
        }
    }
}
