package kr.co.oti.haebom.util;

import java.util.regex.Pattern;
import org.springframework.web.util.HtmlUtils;

/**
 * XSS(Cross-Site Scripting) 방어 유틸리티 클래스
 * - 전자정부 표준프레임워크 및 KISA 소프트웨어 보안약점 진단 가이드 준수
 * - 악의적인 스크립트 태그, 인라인 이벤트 핸들러, 의사 프로토콜 무력화
 */
public final class XssUtils {

    private XssUtils() {
        // 인스턴스화 방지
    }

    // 악성 스크립트 정규식 패턴 (대소문자 무관, 여러 줄 매칭)
    private static final Pattern[] XSS_PATTERNS = {
        // <script> 태그 및 내부 내용
        Pattern.compile("(?i)<script[^>]*>(.*?)</script>", Pattern.DOTALL),
        // 닫는 태그 없는 <script> 단독 태그
        Pattern.compile("(?i)<script[^>]*>", Pattern.DOTALL),
        Pattern.compile("(?i)</script>", Pattern.DOTALL),
        // <iframe>, <object>, <embed>, <applet>, <meta>, <style>, <link> 태그
        Pattern.compile("(?i)<iframe[^>]*>(.*?)</iframe>", Pattern.DOTALL),
        Pattern.compile("(?i)<iframe[^>]*>", Pattern.DOTALL),
        Pattern.compile("(?i)<object[^>]*>(.*?)</object>", Pattern.DOTALL),
        Pattern.compile("(?i)<object[^>]*>", Pattern.DOTALL),
        Pattern.compile("(?i)<embed[^>]*>(.*?)</embed>", Pattern.DOTALL),
        Pattern.compile("(?i)<embed[^>]*>", Pattern.DOTALL),
        // javascript:, vbscript: 의사 프로토콜
        Pattern.compile("(?i)javascript\\s*:", Pattern.DOTALL),
        Pattern.compile("(?i)vbscript\\s*:", Pattern.DOTALL),
        // 인라인 이벤트 핸들러 (onload=, onerror=, onclick= 등)
        Pattern.compile("(?i)\\bon[a-z]+\\s*=\\s*(\"[^\"]*\"|'[^']*'|[^\\s>]+)", Pattern.DOTALL)
    };

    /**
     * 위험한 스크립트 요소를 제거(Sanitize)하여 안전한 텍스트로 정제합니다.
     * 일반 텍스트 및 줄바꿈을 유지하면서 악의적인 코드만 선별 제거합니다.
     */
    public static String clean(String value) {
        if (value == null) {
            return null;
        }

        String cleaned = value;
        for (Pattern pattern : XSS_PATTERNS) {
            cleaned = pattern.matcher(cleaned).replaceAll("");
        }
        return cleaned.trim();
    }

    /**
     * HTML 특수문자(<, >, &, ", ')를 HTML 엔티티 코드로 변환(Escape)합니다.
     * Spring의 HtmlUtils를 활용합니다.
     */
    public static String escape(String value) {
        if (value == null) {
            return null;
        }
        return HtmlUtils.htmlEscape(value);
    }
}
