package kr.co.oti.haebom.system.security;

import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MfaSecretCrypto {

	private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH_BITS = 128;
    
    private final SecretKeySpec key;
    private final SecureRandom secureRandom = new SecureRandom();
    
    public MfaSecretCrypto(@Value("${app.security.mfa-encryption-key}") String base64Key) {
        
    	byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        
    	if (keyBytes.length != 32) {
            throw new IllegalArgumentException("MFA 암호화 키는 32바이트 AES-256 키여야 합니다.");
        }
        
    	this.key = new SecretKeySpec(keyBytes, "AES");
    }
    
    public String encrypt(String plainText) {
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] encrypted = cipher.doFinal(plainText.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            ByteBuffer buffer = ByteBuffer.allocate(iv.length + encrypted.length);
            buffer.put(iv).put(encrypted);
            return Base64.getEncoder().encodeToString(buffer.array());
        } catch (Exception e) {
            throw new IllegalStateException("MFA secret 암호화에 실패했습니다.", e);
        }
    }

    public String decrypt(String ciphertext) {
        try {
            byte[] packed = Base64.getDecoder().decode(ciphertext);
            ByteBuffer buffer = ByteBuffer.wrap(packed);
            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv);
            byte[] encrypted = new byte[buffer.remaining()];
            buffer.get(encrypted);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] plain = cipher.doFinal(encrypted);
            return new String(plain, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("MFA secret 복호화에 실패했습니다.", e);
        }
    }
}
