package kr.co.oti.haebom.system.config;

import com.navercorp.lucy.security.xss.servletfilter.defender.Defender;

/*
 * [해봄 공통 보안] 전역 XSS 방어 커스텀 디펜더
 * - 악성 스크립트 실행의 핵심인 HTML 태그(<, >)와 속성 탈출 큰따옴표(")는 안전하게 치환!
 * - 일반 문맥에서 빈번하게 쓰이는 작은따옴표(')는 보존하여 팀원 화면 깨짐 원천 방지!
 */
public class SafeXssDefender implements Defender {

    @Override
    public void init(String[] args) {
        // 초기화 필요 시 사용 (기본 비워둠)
    }

    @Override
    public String doFilter(String value) {
        if (value == null) {
            return null;
        }

        // <, >, "는 철저히 소독하여 해킹 차단
        return value.replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;");
    }
}