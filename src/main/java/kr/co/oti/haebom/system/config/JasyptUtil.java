package kr.co.oti.haebom.system.config;

import java.util.LinkedHashMap;
import java.util.Map;

import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;

/**
 * [원클릭 마이그레이션 도구] Jasypt 암호화 알고리즘 변경 유틸리티
 * 
 * 기존 PBEWithMD5AndDES 암호문을 자동으로 복호화하여
 * 멘토님 추천 알고리즘인 PBEWITHHMACSHA512ANDAES_256 (AES-256)으로 일괄 재암호화합니다.
 */
public class JasyptUtil {

    public static void main(String[] args) {

        // ========================================================
        // 1. VM arguments(-Djasypt.encryptor.password)에 등록된 마스터 비밀키 입력
        // ========================================================
    	String masterKey = "your-secret-key"; 

        if (masterKey == null || masterKey.isBlank()) {
            System.err.println("masterKey 변수에 실제 마스터 비밀키를 입력한 후 실행해 주세요!");
            return;
        }

        // ========================================================
        // 2. [기존 방식] 구형 암호문 복호화기 (MD5 + DES)
        // 기존 properties에 저장된 암호문을 원문으로 풀기 위해 사용
        // ========================================================
        StandardPBEStringEncryptor oldDecryptor = new StandardPBEStringEncryptor();
        oldDecryptor.setPassword(masterKey);
        oldDecryptor.setAlgorithm("PBEWithMD5AndDES");
        // ========================================================
        // 3. [멘토님 피드백 반영] 최신 규격 재암호화기 (HMAC-SHA512 + AES-256 + IV)
        // 보안 취약점을 해결하기 위해 강력한 알고리즘과 Random IV 적용
        // ========================================================
        PooledPBEStringEncryptor newEncryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig newConfig = new SimpleStringPBEConfig();
        newConfig.setPassword(masterKey);
        newConfig.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        newConfig.setKeyObtentionIterations("1000");
        newConfig.setPoolSize("1");
        newConfig.setProviderName("SunJCE");
        newConfig.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        newConfig.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        newConfig.setStringOutputType("base64");
        newEncryptor.setConfig(newConfig);

        // ========================================================
        // 4. application.properties에 등록된 기존 암호문 9개 목록
        // ========================================================
        Map<String, String> oldEncryptedMap = new LinkedHashMap<>();
        oldEncryptedMap.put("spring.datasource.password", "MIwsOYK6wXORQeMezLr2PPhZuAGe4Zvl");
        oldEncryptedMap.put("sgis.consumer-key", "xI8BFqeX8aC0JcurdcwshxTEwHIrGqebAfQ8VyLx3KE=");
        oldEncryptedMap.put("sgis.consumer-secret", "KDeUWl6hoUTXIsfCTnXKT4p0Mx39qCyqaGEloCOV1No=");
        oldEncryptedMap.put("juso.confirm-key", "AU/XOOnjHnua2UUQlZTvpIZaHyNmK0KaOesO7lPDHvXS4uFLxYaUCehrhiMoEqo8J3n4yzqZLKU=");
        oldEncryptedMap.put("spring.mail.username", "zpglHgG/8tcUxMMBdaeCmzpx41J3k4OUVLVui+dlAsg=");
        oldEncryptedMap.put("spring.mail.password", "iL4bXRWpTHD2RrTsEgQyLnAgX32eyBRX+aj5Mjqw4TY=");
        oldEncryptedMap.put("app.google.maps.browser-key", "p5yUEqODeWu9GYVy21rgb9Di2zUtzDlrYuIFd2tfr+u1q3Zjoya3pU/VEdB9yUXH");
        oldEncryptedMap.put("app.google.maps.server-key", "JxVdxGapUHMHGxyQM4LpzgLAJU7P3n9xP0MAkUqWpOkvKUx31YsE7aG48TLCEk0w");
        oldEncryptedMap.put("gov24.api.service-key", "BBPKbBKcuBSiulWayTu5N1WMYlcjh3MRmadHQ4yqM5HbDvCvwlTSNE3CCrxDy5CocCFK7A8H9h/1NViYEoXMJAJhzgAvL1bDWivY0btqxzU=");

        System.out.println("================================================================================");
        System.out.println("[AES-256 신규 암호화 결과] 아래 내용을 복사해서 application.properties에 붙여넣으세요!");
        System.out.println("================================================================================\n");

        for (Map.Entry<String, String> entry : oldEncryptedMap.entrySet()) {
            String propKey = entry.getKey();
            String oldCipher = entry.getValue();

            try {
                // 1) 기존 구형 알고리즘으로 원문 복호화
                String plainText = oldDecryptor.decrypt(oldCipher);

                // 2) 신형 AES-256 알고리즘으로 새 암호문 생성
                String newCipher = newEncryptor.encrypt(plainText);

                // 3) properties 형식으로 출력
                System.out.println(propKey + "=ENC(" + newCipher + ")");
            } catch (Exception e) {
                System.err.println("❌ [" + propKey + "] 복호화/암호화 실패: 마스터 키가 올바른지 확인하세요! (" + e.getMessage() + ")");
            }
        }

        System.out.println("\n================================================================================");
        System.out.println("일괄 재암호화 변환이 완료되었습니다!");
        System.out.println("================================================================================");
    }
}
