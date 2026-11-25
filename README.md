<div align="center">

# 🏛️ 해봄 (HAEBOM)
### 처음이라 막막한 공공 행정, 미리 연습 '해봄'
**공공 행정 시뮬레이션 & 지자체 맞춤 정책 연계 플랫폼**

<br/>

![HaeBom Header Banner](docs/slides/슬라이드1.PNG)

<br/>

[![Java](https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-2.7.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![eGovFrame](https://img.shields.io/badge/eGovFrame-4.3.0-004ea2?style=flat-square)](https://www.egovframe.go.kr/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20S3%20%7C%20RDS-232F3E?style=flat-square&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)](LICENSE)

</div>

<br/>

---

## 📌 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [팀원 구성 및 역할](#2-팀원-구성-및-역할)
3. [기술 스택](#3-기술-스택)
4. [시스템 아키텍처 및 데이터 모델링](#4-시스템-아키텍처-및-데이터-모델링)
5. [주요 기능](#5-주요-기능)
6. [기술적 트러블슈팅 및 최적화](#6-기술적-트러블슈팅-및-최적화)
7. [실행 가이드](#7-실행-가이드)
8. [발표 자료](#8-발표-자료)

---

<br/>

## 1. 프로젝트 개요

### 1) 기획 배경
![Project Background](docs/slides/슬라이드4.PNG)
- 정부24를 통한 온라인 민원 서비스가 일상화되었지만, 생소한 공공 행정 용어와 복잡한 신청 요건으로 인해 디지털 취약계층의 진입 장벽이 여전히 높습니다.
- 실제 정부24에서는 한 번의 입력 실수가 공식 민원 접수로 이어지기 때문에 부담 없이 연습해볼 수 있는 공간이 부족하며, 결국 주민센터를 직접 방문하게 되는 비효율이 발생합니다.

### 2) 서비스 목표
![Project Vision](docs/slides/슬라이드5.PNG)
- 실제 정부24의 민원 신청 흐름을 기반으로, 법적 효력이나 실수 부담 없이 자유롭게 연습할 수 있는 안전한 시뮬레이션 환경을 제공합니다.
- 단순 모의체험에 그치지 않고, 사용자가 입력한 거주 지역 데이터를 바탕으로 놓치기 쉬운 지자체 맞춤 지원 혜택을 실시간 발굴·추천합니다.

---

<br/>

## 2. 팀원 구성 및 역할

![Team Roles](docs/slides/슬라이드3.PNG)

| 팀원 | 역할 | 담당 업무 및 핵심 기여 내용 |
| :--- | :---: | :--- |
| **구필우** | **회원 서비스 & 사용자 플랫폼** | • 회원가입, 로그인, 아이디/비밀번호 찾기, 이메일 인증 공통화 (`EmailCodeService`)<br/>• Google Authenticator (TOTP) 기반 관리자 2단계 보안 인증 구현<br/>• 카카오 맵 REST API 기반 지역별 행정기관 조회 및 마커 필터링<br/>• 마이페이지 시뮬레이션 진행 이력 관리 및 저장/복원 |
| **박진희** | **통합 관리자 · 정책 추천 · 다층 보안** | • 관리자 통계 대시보드 구축 및 순수 SVG 반응형 추이 차트 구현, 본인 계정 잠금 방어<br/>• 1:1 고객 문의(Q&A) 비밀글 403 인가 통제 및 409 무결성 방어, POI 엑셀 다운로드<br/>• 보조금24 지자체 맞춤 정책 추천 엔진 구축 (1·2순위 정밀 필터링, Fallback 안전망, 무상태 시드 난수)<br/>• 네이버 루시(Lucy) XSS 서블릿 필터 전역 방어, Jasypt AES-256 마이그레이션 및 JUnit/SonarLint 이중 검증 |
| **정채빈** | **모의체험 엔진 & 클라우드 인프라** | • 주요 민원 3종(전입신고, 신분증 재발급, 등본 발급) 단계별 동적 분기 및 폼 상태 관리<br/>• 공공 API 연계를 통한 행정정보 조회 및 SGIS 행정구역 증분 갱신 최적화<br/>• AWS S3 SDK 연동을 통한 계약서·증명사진 안전 업로드 및 검증<br/>• AWS EC2, RDS 운영 및 GitHub Actions OIDC 기반 CI/CD 무중단 자동 배포 파이프라인 구축 |

---

<br/>

## 3. 기술 스택

![Tech Stack](docs/slides/슬라이드6.PNG)

| 분류 | 기술 스택 | 상세 활용 내용 |
| :--- | :--- | :--- |
| **Backend** | `Java 17`, `eGovFrame 4.3.0`, `Spring Boot 2.7.x`, `MyBatis 2.3`, `WebClient`, `Caffeine Cache`, `Apache POI 5.2`, `Swagger 1.8` | 전자정부 표준 프레임워크 4.3 기반 비즈니스 로직, 비동기 API 통신 및 24시간 지역 코드 캐싱, 관리자 엑셀 보고서 생성 |
| **Frontend** | `JSP/JSTL 1.2`, `Apache Tiles 3.0`, `HTML5 / CSS3 / JavaScript (ES6)`, `Bootstrap 5.3`, `AdminLTE 4.10`, `SVG` | 반응형 모바일·데스크톱 레이아웃, 모듈형 모의체험 폼 UI, 라이브러리 프리 경량 SVG 통계 차트 |
| **Security & Auth** | `Spring Security`, `BCrypt`, `Jasypt 3.0.5 (AES-256)`, `NAVER Lucy XSS Filter 2.0`, `Google TOTP 1.7` | 비밀번호 및 공공 API 키 단방향/양방향 암호화, 요청 최전선 XSS 스크립트 전역 정제, CSRF 토큰 인터셉터, 관리자 2단계 MFA |
| **DB & Infra** | `MySQL 8.0`, `AWS EC2`, `AWS S3`, `AWS RDS`, `Nginx (Reverse Proxy & SSL)`, `GitHub Actions` | 정형 데이터 관리 및 관계 정규화, 클라우드 객체 스토리지, OIDC 임시 권한 기반 자동 빌드/배포 |
| **Open APIs** | `행정안전부 보조금24 API`, `도로명주소 검색 API`, `통계청 SGIS 지리정보 API`, `카카오 맵 API`, `Gmail SMTP` | 실시간 맞춤 정책 연계, 주소 정제, 행정동 경계 매핑, 행정기관 지도 렌더링, 인증코드 메일 발송 |

---

<br/>

## 4. 시스템 아키텍처 및 데이터 모델링

### 1) 시스템 아키텍처
![System Architecture](docs/slides/슬라이드7.PNG)
- **Client**: 사용자 및 관리자 브라우저에 경량 SVG 및 반응형 인터페이스 제공
- **Nginx**: SSL/HTTPS 암호화 통신 및 리버스 프록시 포트 포워딩 중계
- **Security**: 서블릿 필터(NAVER Lucy) 최전선 XSS 전수 차단 및 Spring Security 세션 인가, 관리자 TOTP 2단계 인증
- **Backend**: eGovFrame 4.3 기반 비즈니스 엔진, WebClient 비동기 통신 및 24시간 Caffeine 캐싱
- **Storage**: MySQL 정형 데이터베이스 및 AWS S3 파일 스토리지 격리 운영

### 2) 데이터 모델링 (ERD)
![Database Modeling](docs/slides/슬라이드8.PNG)
- **회원 & 보안 도메인**: 비식별 식별자 분리 및 세션 격리, 관리자 활동 감사 추적 로깅 (`admin_log`)
- **시뮬레이션 코어 도메인**: 진행 이력(`simulation_progress`)과 단계별 응답 데이터(`simulation_answer`)를 1:N으로 정규화 분리하여 중단 후 이어하기 및 단계별 복원 보장
- **고객 소통 도메인**: 문의글(`qna`)과 답변(`qna_answer`)을 1:1 구조로 물리 분리하여 데이터 무결성 및 답변 상태 추적 보장

---

<br/>

## 5. 주요 기능

### 1) 회원 서비스 및 사용자 플랫폼 (구필우)
#### (1) 공통 이메일 인증 서비스
![Email Verification Service](docs/slides/슬라이드10.PNG)
- **인증 로직 공통 컴포넌트화**: 회원가입, 아이디/비밀번호 찾기 메일 인증 로직을 단일 서비스(`EmailCodeService`)로 추상화
- **무차별 대입 및 남용 방어**: 유효시간(5분), 최대 입력 횟수(5회), 재전송 간격(30초) 및 IP 발송량 제한 적용
- **목적별 상태 격리**: SIGNUP, FIND_ID, FIND_PASSWORD 요청 목적별 상태를 분리하여 인증 코드 혼선 방지

#### (2) Google Authenticator 기반 관리자 2단계 인증 (TOTP)
![Admin Step-Up Authentication](docs/slides/슬라이드11.PNG)
- **단계별 보안 승격 (Step-Up)**: 1차 비밀번호 성공 시 대기 세션만 발급하고, OTP 2차 검증 통과 후에만 관리자 최종 세션 및 `ROLE_ADMIN` 인가
- **RFC 6238 표준 적용**: 30초 주기로 변경되는 6자리 보안 코드를 검증하며, 등록 비밀키는 AES-GCM으로 안전하게 암호화 보관
- **무차별 대입 방어**: 5회 실패 시 세션 대기 정보를 영구 파기하고 초기 로그인 화면으로 강제 이동

#### (3) 공공데이터 기반 위치별 행정기관 조회 & 마이페이지
![Administrative Center Map](docs/slides/슬라이드12.PNG)
- **카카오 Local API 연계**: 행정안전부 공공데이터 및 카카오 맵 API를 연계하여 전국 행정복지센터 위치 조회
- **시·도/시·군·구 2단계 필터링**: 지역 선택 시 DB에 등록된 기관 목록 및 지도 마커를 클러스터로 시각화
- **시뮬레이션 이력 관리**: 마이페이지에서 사용자의 시뮬레이션 진행 상황 조회 및 이어하기 지원

<br/>

### 2) 통합 관리자 시스템 및 연계 서비스 (박진희)
#### (1) 통합 관리자 관제 대시보드 & 계정 보안
![Admin Dashboard](docs/slides/슬라이드16.PNG)
- **라이브러리 프리 SVG 차트**: 외부 무거운 라이브러리 없이 웹 표준 3차 베지어 곡선(C 커맨드)으로 렌더링한 경량 통계 차트
- **대용량 I/O 스트리밍**: 대용량 회원 데이터 다운로드 시 서버 메모리 고갈(OOM)을 방지하는 CSV I/O 스트리밍 처리
- **관리자 계정 자기보호**: 최고 관리자(admin) 및 접속 중인 본인 계정의 비활성화 시도 원천 차단 (`403 Forbidden`)
- **감사 로그 추적**: 관리자 활동 내역(`admin_log`) 실시간 기록 및 감사 추적 체계 구축

#### (2) 1:1 고객 문의(Q&A) & 권한 인가 시스템
![Inquiry System](docs/slides/슬라이드17.PNG)
- **비밀글 인가 통제**: 작성자 본인 및 관리자 외 비밀 문의글 접근 차단 (`403 Forbidden`)
- **답변 무결성 보장**: 관리자 답변이 완료된 문의글의 사용자 임의 수정 및 삭제 방어 (`409 Conflict`)
- **보고서 엑셀 내보내기**: 관리자 분석 및 보고 업무를 위한 Apache POI 기반 다중 스타일 엑셀 다운로드 연동

#### (3) 시뮬레이션 연계 지자체 맞춤 정책 추천 엔진
![Policy Engine](docs/slides/슬라이드18.PNG)
- **공공 API 실시간 연동**: 행안부 보조금24 Open API 연계를 통한 이사 지역 기반 맞춤 정책 자동 수집
- **2단계 정밀 지역 필터링**: 시·군·구 1순위, 광역 시·도 2순위 정밀 필터링으로 타 지자체 정책 혼선 방지
- **무상태(Stateless) 시드 난수**: 시뮬레이션 ID 기반 시드 난수 설계로 새로고침 및 PDF 인쇄 시 일관된 결과 보장
- **Fallback 안전망**: 공공 API 지연·장애 발생 시 실존 공공 정책 5종(LH, HUG 등)으로 즉시 전환되는 장애 격리 체계

<br/>

### 3) 행정절차 모의체험 엔진 & 클라우드 인프라 (정채빈)
#### (1) 주요 민원 3종 단계별 인터랙티브 시뮬레이션
![Simulation Engine](docs/slides/슬라이드22.PNG)
- **핵심 민원 3종 시뮬레이션**: 전입신고, 주민등록증 재발급, 등본·초본 발급 등 생활 밀착형 공공 행정 절차 구현
- **동적 분기 & 이어하기**: 사용자 선택 조건에 따른 맞춤형 폼 구성 및 단계별 데이터 임시 저장·복원 지원
- **실시간 접수증 발급**: 시뮬레이션 완료 시 실제 행정 양식 기반의 실시간 PDF 접수증 출력 제공

#### (2) 공공 API 연계를 통한 행정정보 조회 및 활용
![Public API Integration](docs/slides/슬라이드23.PNG)
- **행정안전부 도로명주소 검색**: 키워드 기반 실시간 주소 검색, 도로명/지번/우편번호 자동 완성 연동
- **SGIS 행정구역 매핑**: 통계청 SGIS 지리정보 API를 연계하여 전국 시·도 및 시·군·구 행정구역 데이터 수집
- **스케줄러 기반 안정성 강화**: Spring Scheduler를 통한 정기 데이터 갱신 및 API 일시 장애 시 자동 재시도 적용

#### (3) AWS 클라우드 인프라 & CI/CD 자동화
![AWS Infra](docs/slides/슬라이드24.PNG)
- **보안 파일 스토리지 (S3)**: AWS S3 SDK 연동을 통한 증명사진 및 임대차 계약서 안전 업로드 및 격리
- **무중단 CI/CD 파이프라인**: GitHub Actions 기반 WAR 빌드 및 AWS EC2 자동 배포 체계 구축
- **OIDC 보안 강화**: 장기 AWS 자격증명 노출을 원천 방지하는 GitHub Actions OIDC 기반 임시 자격증명 연동

---

<br/>

## 6. 기술적 트러블슈팅 및 최적화

### 1) [구필우] 카카오 Local API 기반 행정기관 검색 확장 및 중복 제거
![Kakao Map Troubleshooting](docs/slides/슬라이드13.PNG)

- **문제 배경**: 기존 등록 데이터에 한정된 기관 조회로 인해 신규 기관 누락 및 부정확한 위치 정보 오류 발생
- **기술적 조치**: 전국 데이터 사전 수집 방식 대신 사용자가 선택한 지역을 카카오 Local API 키워드로 실시간 조회하고, 장소 ID(Place ID) 기반 중복 제거
- **최적화 성과**: 기관명·카테고리·제외어·좌표 검증 공통 필터를 적용하여 단순 행정복지센터에서 종합 행정기관 지도로 탐색 범위 확장

### 2) [박진희] Jasypt 암호화 규격 AES-256 마이그레이션 및 정적·동적 이중 검증
![Jasypt Troubleshooting](docs/slides/슬라이드20.PNG)

- **문제 배경**: Jasypt 기본 `PBEWithMD5AndDES` 알고리즘의 56비트 암호화 한계 및 공공 보안 규격 미달 경고
- **기술적 조치**: 전자정부 및 NIST 표준인 `PBEWITHHMACSHA512ANDAES_256` 규격 전환 및 `RandomIvGenerator` 무작위 난수 적용
- **보안 격리**: 마스터 키는 이클립스 실행 VM 옵션(`-Djasypt.encryptor.password`)으로 외부 주입하여 Git 평문 유출 차단
- **이중 검증**: JUnit 단위 테스트(암호문 56자 ➔ 88자 확장, 무작위성 3/3 통과) 및 SonarLint 정적 분석 결함 0건(Clean) 완료

### 3) [정채빈] SGIS 행정구역 데이터 증분 갱신 & DB 처리 시간 62.4% 단축
![SGIS Incremental Update](docs/slides/슬라이드26.PNG)

- **문제 배경**: 여러 시나리오에서 SGIS 행정구역 API가 중복 호출되고, 전체 삭제 후 재등록(DELETE ➔ INSERT) 방식으로 인해 갱신 중 사용자 조회 지연 발생
- **기술적 조치**: DB 기반 조회 전환 및 새벽 3시 정기 스케줄러 적용, 변경된 데이터만 식별하여 UPDATE/INSERT하는 증분 갱신(Incremental Update) 로직 구현
- **최적화 성과**: 기존 3,828건의 행정구역 데이터 안정 유지 및 DB 갱신 처리 시간을 194ms에서 73ms로 약 62.4% 단축

---

<br/>

## 7. 실행 가이드

### 1) 요구 사항
- Java 17 (OpenJDK 17 권장)
- Maven 3.8+
- MySQL 8.0+

### 2) VM 옵션 설정
보안을 위해 마스터 키는 소스 코드에 포함되어 있지 않습니다. 애플리케이션 실행 시 VM 인수로 마스터 키를 주입해야 합니다.

```bash
# 이클립스 / STS: Run Configurations -> Arguments -> VM arguments 입력
-Djasypt.encryptor.password=YOUR_MASTER_ENCRYPTION_KEY
```

### 3) 로컬 빌드 및 실행
```bash
# 1. 저장소 복제
git clone https://github.com/dev-jinhee/Project_Haebom.git
cd Project_Haebom

# 2. 메이븐 빌드 (테스트 실행 포함)
mvn clean package -Djasypt.encryptor.password=YOUR_MASTER_ENCRYPTION_KEY

# 3. 애플리케이션 실행
java -Djasypt.encryptor.password=YOUR_MASTER_ENCRYPTION_KEY -jar target/HaeBom-1.0.0.war
```

---

<br/>

## 8. 발표 자료

본 프로젝트의 전체 발표 슬라이드(31장)는 본 저장소의 [`docs/slides/`](docs/slides/) 디렉터리에서 고화질 이미지로 확인하실 수 있습니다.

- [PART 01: 프로젝트 개요 및 기획 배경 (슬라이드 1 ~ 8)](docs/slides/슬라이드1.PNG)
- [PART 02: 회원 서비스 및 사용자 플랫폼 - 구필우 (슬라이드 9 ~ 14)](docs/slides/슬라이드9.PNG)
- [PART 03: 통합 관리자 시스템 및 연계 서비스 - 박진희 (슬라이드 15 ~ 20)](docs/slides/슬라이드15.PNG)
- [PART 04: 인터랙티브 시뮬레이션 엔진 - 정채빈 (슬라이드 21 ~ 26)](docs/slides/슬라이드21.PNG)
- [PART 05 & 06: 통합 서비스 시연 및 프로젝트 성과 회고 (슬라이드 27 ~ 31)](docs/slides/슬라이드27.PNG)

---

<div align="center">

**Project HaeBom © 2026 최강 1조**  
*구필우 · 박진희 · 정채빈*

</div>
