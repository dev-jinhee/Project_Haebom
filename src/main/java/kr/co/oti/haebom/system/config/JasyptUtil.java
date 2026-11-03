package kr.co.oti.haebom.system.config;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;

public class JasyptUtil {

    public static void main(String[] args) {
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        
        // 진짜 비밀번호 대신 가짜 예시로 되돌려놓기!
        String masterKey = "your-secret-key"; 
        String plainText = "your-password";

        encryptor.setPassword(masterKey);
        encryptor.setAlgorithm("PBEWithMD5AndDES");
        
        // 암호화 실행
        String encryptedText = encryptor.encrypt(plainText);
        System.out.println("==================================================");
        System.out.println("원문 (Plaintext) : " + plainText);
        System.out.println("암호문 (Jasypt)  : ENC(" + encryptedText + ")");
        System.out.println("==================================================");

        // 복호화 검증
        String decryptedText = encryptor.decrypt(encryptedText);
        System.out.println("복호화 검증 결과 : " + decryptedText);
        System.out.println("==================================================");
    }
}