-- ========================================================
-- [해봄(HAEBOM) 프로젝트 최신 DB 스크립트 (총 9개 테이블)]
-- ========================================================
-- 1. 외래키 제약조건 역순으로 기존 테이블 일괄 삭제
DROP TABLE IF EXISTS simulation_answer;
DROP TABLE IF EXISTS simulation_progress;
DROP TABLE IF EXISTS scenario_step;
DROP TABLE IF EXISTS scenario;
DROP TABLE IF EXISTS scenario_category;

DROP TABLE IF EXISTS qna_answer;
DROP TABLE IF EXISTS qna;
DROP TABLE IF EXISTS qna_category;

DROP TABLE IF EXISTS member;

-- ========================================================
-- 2. 회원 (member)
-- ========================================================
CREATE TABLE member (
member_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '회원 고유 번호',
login_id VARCHAR(50) NOT NULL UNIQUE COMMENT '로그인 아이디',
password VARCHAR(255) NOT NULL COMMENT '비밀번호',
email VARCHAR(50) NOT NULL COMMENT '이메일',
member_name VARCHAR(50) NOT NULL COMMENT '회원 이름',
birth_date DATE COMMENT '생년월일',
gender CHAR(1) COMMENT '성별 (M/F)',
role VARCHAR(20) DEFAULT 'USER' COMMENT '권한',
member_status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '회원 상태',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '가입일시',
withdrawn_at DATETIME COMMENT '탈퇴 일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원';
-- ========================================================
-- 3. 시나리오 카테고리 (scenario_category)
-- ========================================================
CREATE TABLE scenario_category (
scenario_category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '시나리오카테고리 고유번호',
scenario_category_name VARCHAR(50) NOT NULL COMMENT '시나리오 카테고리 이름'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시나리오 카테고리';
-- ========================================================
-- 4. 시나리오 (scenario)
-- ========================================================
CREATE TABLE scenario (
scenario_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '시나리오 고유번호',
scenario_title VARCHAR(150) NOT NULL COMMENT '시나리오 제목',
description TEXT COMMENT '설명',
estimated_minutes INT COMMENT '예상 소요시간',
is_active BOOLEAN DEFAULT TRUE COMMENT '공개 여부',
scenario_category_id INT COMMENT '시나리오 카테고리 고유번호',
CONSTRAINT fk_scenario_category
FOREIGN KEY (scenario_category_id) REFERENCES scenario_category(scenario_category_id)
ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시나리오';
-- ========================================================
-- 5. 시나리오 단계 (scenario_step)
-- ========================================================
CREATE TABLE scenario_step (
step_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '시나리오단계 고유번호',
scenario_id INT NOT NULL COMMENT '시나리오 고유번호',
step_order INT NOT NULL COMMENT '단계 순서',
step_title VARCHAR(150) NOT NULL COMMENT '단계 제목',
step_description TEXT COMMENT '단계 설명',
CONSTRAINT fk_step_scenario
FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id)
ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시나리오_단계';
-- ========================================================
-- 6. 시뮬레이션 진행 정보 (simulation_progress)
-- ========================================================
CREATE TABLE simulation_progress (
progress_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '진행 고유 번호',
scenario_id INT NOT NULL COMMENT '시나리오 고유번호',
step_id INT NOT NULL COMMENT '현재단계 고유 번호',
member_id INT NOT NULL COMMENT '회원 고유번호',
progress_status VARCHAR(20) DEFAULT 'IN_PROGRESS' COMMENT '진행 상황',
started_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '시뮬레이션 시작일',
last_saved_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '시뮬레이션 마지막 저장일',
completed_at DATETIME COMMENT '시뮬레이션 완료 일',
CONSTRAINT fk_progress_scenario
FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id)
ON DELETE CASCADE,
CONSTRAINT fk_progress_step
FOREIGN KEY (step_id) REFERENCES scenario_step(step_id)
ON DELETE CASCADE,
CONSTRAINT fk_progress_member
FOREIGN KEY (member_id) REFERENCES member(member_id)
ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시뮬레이션 진행 정보';
-- ========================================================
-- 7. 시뮬레이션 입력 정보 (simulation_answer)
-- ========================================================
CREATE TABLE simulation_answer (
answer_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '입력 정보 고유 번호',
progress_id INT NOT NULL COMMENT '진행 고유 번호',
step_id INT NOT NULL COMMENT '응답단계 고유 번호',
field_key VARCHAR(100) NOT NULL COMMENT '질문 식별 키',
answer_value TEXT COMMENT '입력 값',
CONSTRAINT fk_answer_progress
FOREIGN KEY (progress_id) REFERENCES simulation_progress(progress_id)
ON DELETE CASCADE,
CONSTRAINT fk_answer_step
FOREIGN KEY (step_id) REFERENCES scenario_step(step_id)
ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시뮬레이션 입력 정보';
-- ========================================================
-- 8. 문의 카테고리 (qna_category) - [신규]
-- ========================================================
CREATE TABLE qna_category (
qna_category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '문의 카테고리 고유 번호',
qna_category_name VARCHAR(50) NOT NULL COMMENT '문의 카테고리 이름'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='문의 카테고리';
-- ========================================================
-- 9. 문의게시판 (qna) - [신규]
-- ========================================================
CREATE TABLE qna (
qna_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '문의 고유 번호',
member_id INT NOT NULL COMMENT '회원 고유번호',
qna_category_id INT NOT NULL COMMENT '문의 카테고리 고유번호',
qna_title VARCHAR(200) NOT NULL COMMENT '문의 제목',
qna_content TEXT NOT NULL COMMENT '문의 내용',
qna_status VARCHAR(20) DEFAULT 'WAITING' COMMENT '문의 답변 상태',
qna_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '문의 작성일',
qna_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '문의 수정일',
CONSTRAINT fk_qna_member
FOREIGN KEY (member_id) REFERENCES member(member_id)
ON DELETE CASCADE,
CONSTRAINT fk_qna_category
FOREIGN KEY (qna_category_id) REFERENCES qna_category(qna_category_id)
ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='문의게시판';
-- ========================================================
-- 10. 관리자 답변 (qna_answer) - [신규]
-- ========================================================
CREATE TABLE qna_answer (
qna_answer_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '문의 답변 고유번호',
qna_id INT NOT NULL COMMENT '문의 고유번호',
member_id INT NOT NULL COMMENT '관리자 고유번호',
qna_answer_content TEXT NOT NULL COMMENT '답변 내용',
qna_answer_created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '답변 작성일',
CONSTRAINT fk_qna_answer_qna
FOREIGN KEY (qna_id) REFERENCES qna(qna_id)
ON DELETE CASCADE,
CONSTRAINT fk_qna_answer_admin
FOREIGN KEY (member_id) REFERENCES member(member_id)
ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='관리자 답변';