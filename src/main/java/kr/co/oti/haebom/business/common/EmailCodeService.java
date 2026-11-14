package kr.co.oti.haebom.business.common;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.EnumMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailCodeService {

    private static final long VALID_MILLIS = 5 * 60 * 1000L;
    private static final long RESEND_COOLDOWN_MILLIS = 30 * 1000L;
    private static final long SEND_WINDOW_MILLIS = 60 * 60 * 1000L;
    private static final int MAX_SENDS_PER_WINDOW = 10;

    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, SendLimit> sendLimits = new ConcurrentHashMap<>();

    @Value("${spring.mail.username}")
    private String senderAddress;

    public enum Purpose {
        SIGNUP("signup", "[해봄] 회원가입 인증번호"),
        FIND_ID("find-id", "[해봄] 아이디 찾기 인증번호"),
        FIND_PASSWORD("find-password", "[해봄] 비밀번호 찾기 인증번호");

        private final String sessionKey;
        private final String subject;

        Purpose(String sessionKey, String subject) {
            this.sessionKey = sessionKey;
            this.subject = subject;
        }

        public String getSessionKey() {
            return sessionKey;
        }

        public String getSubject() {
            return subject;
        }
    }

    public void sendCode(Purpose purpose, String email, HttpSession session) {
        String normalizedEmail = normalize(email);
        long now = Instant.now().toEpochMilli();
        SendLimit limit = sendLimits.computeIfAbsent(normalizedEmail, key -> new SendLimit(now));

        // 이메일별로 발송을 직렬화해 동시에 여러 번 요청해도 제한 횟수를 넘기지 않게 합니다.
        synchronized (limit) {
            long retryAfterSeconds = limit.getRetryAfterSeconds(purpose, now);
            if (retryAfterSeconds > 0) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "인증번호 요청 제한에 걸렸습니다. " + retryAfterSeconds + "초 후 다시 시도해 주세요.");
            }

            String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderAddress);
            message.setTo(normalizedEmail);
            message.setSubject(purpose.getSubject());
            message.setText("안녕하세요, 해봄입니다.\n"
                    + "요청하신 인증번호입니다.\n\n"
                    + code + "\n\n"
                    + "인증번호를 타인에게 알려주지 마세요.");
            mailSender.send(message);

            // 메일 발송에 성공한 경우에만 쿨다운과 시간당 횟수를 기록합니다.
            limit.recordSuccessfulSend(purpose, Instant.now().toEpochMilli());
            clear(purpose, session);
            String prefix = prefix(purpose);
            session.setAttribute(prefix + "email", normalizedEmail);
            session.setAttribute(prefix + "code", code);
            session.setAttribute(prefix + "expiresAt", Instant.now().toEpochMilli() + VALID_MILLIS);
        }
    }

    public boolean verifyCode(Purpose purpose, String email, String code, HttpSession session) {
        String prefix = prefix(purpose);
        Object savedEmail = session.getAttribute(prefix + "email");
        Object savedCode = session.getAttribute(prefix + "code");
        Object expiresAt = session.getAttribute(prefix + "expiresAt");

        if (!(savedEmail instanceof String)
                || !(savedCode instanceof String)
                || !(expiresAt instanceof Long)
                || !normalize(email).equals(savedEmail)
                || code == null
                || !code.equals(savedCode)) {
            return false;
        }

        if (Instant.now().toEpochMilli() > (Long) expiresAt) {
            clear(purpose, session);
            return false;
        }

        // 인증 성공 코드는 재사용하지 못하도록 즉시 폐기합니다.
        clear(purpose, session);
        return true;
    }

    public void clear(Purpose purpose, HttpSession session) {
        String prefix = prefix(purpose);
        session.removeAttribute(prefix + "email");
        session.removeAttribute(prefix + "code");
        session.removeAttribute(prefix + "expiresAt");
    }

    public String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String prefix(Purpose purpose) {
        return "common.emailCode." + purpose.getSessionKey() + ".";
    }

    private static class SendLimit {
        private long windowStartedAt;
        private int sendCount;
        private final Map<Purpose, Long> lastSentAtByPurpose = new EnumMap<>(Purpose.class);

        private SendLimit(long now) {
            this.windowStartedAt = now;
        }

        private long getRetryAfterSeconds(Purpose purpose, long now) {
            if (sendCount > 0 && now - windowStartedAt >= SEND_WINDOW_MILLIS) {
                windowStartedAt = now;
                sendCount = 0;
            }

            if (sendCount >= MAX_SENDS_PER_WINDOW) {
                return secondsUntil(windowStartedAt + SEND_WINDOW_MILLIS, now);
            }

            Long lastSentAt = lastSentAtByPurpose.get(purpose);
            if (lastSentAt != null && now < lastSentAt + RESEND_COOLDOWN_MILLIS) {
                return secondsUntil(lastSentAt + RESEND_COOLDOWN_MILLIS, now);
            }
            return 0;
        }

        private void recordSuccessfulSend(Purpose purpose, long now) {
            if (sendCount == 0 || now - windowStartedAt >= SEND_WINDOW_MILLIS) {
                windowStartedAt = now;
                sendCount = 0;
            }
            sendCount++;
            lastSentAtByPurpose.put(purpose, now);
        }

        private long secondsUntil(long deadline, long now) {
            return Math.max(1, (deadline - now + 999) / 1000);
        }
    }
}
