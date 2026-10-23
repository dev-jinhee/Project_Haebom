-- ========================================================
-- [해봄(HAEBOM) 프로젝트 DB 스크립트 - v5.0 최종 설계 반영 (총 14개 테이블)] 
-- ========================================================

-- 1. 외래키 제약조건 역순으로 기존 테이블 일괄 삭제
DROP TABLE IF EXISTS admin_log_qna;
DROP TABLE IF EXISTS admin_log_scenario;
DROP TABLE IF EXISTS admin_log_member;
DROP TABLE IF EXISTS admin_log;

DROP TABLE IF EXISTS qna_answer;
DROP TABLE IF EXISTS qna;
DROP TABLE IF EXISTS qna_category;

DROP TABLE IF EXISTS simulation_family;
DROP TABLE IF EXISTS simulation_answer;
DROP TABLE IF EXISTS simulation_progress;
DROP TABLE IF EXISTS scenario_step;
DROP TABLE IF EXISTS scenario;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS scenario_category;

DROP TABLE IF EXISTS member;

-- ========================================================
-- ① 회원 (member)
-- ========================================================
CREATE TABLE member (
    member_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '회원 고유 번호',
    login_id VARCHAR(50) UNIQUE COMMENT '로그인 아이디',
    password VARCHAR(255) COMMENT '비밀번호',
    email VARCHAR(50) UNIQUE COMMENT '이메일',
    member_name VARCHAR(50) COMMENT '회원 이름',
    birth_date DATE COMMENT '생년월일',
    gender CHAR(1) COMMENT '성별 (M/F)',
    role VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '권한',
    member_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '회원 상태',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입일시',
    withdrawn_at DATETIME COMMENT '탈퇴 일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원';

-- ========================================================
-- ⑦ 시나리오 카테고리 (category)
-- ========================================================
CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '시나리오카테고리 고유번호',
    category_name VARCHAR(50) NOT NULL COMMENT '시나리오 카테고리 이름'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시나리오 카테고리';

-- ========================================================
-- ② 시나리오 (scenario)
-- ========================================================
CREATE TABLE scenario (
    scenario_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '시나리오 고유번호',
    scenario_code VARCHAR(50) NOT NULL UNIQUE COMMENT '시나리오 고정 식별 코드',
    scenario_title VARCHAR(150) NOT NULL COMMENT '시나리오 제목',
    description TEXT COMMENT '설명',
    estimated_minutes INT COMMENT '예상 소요시간',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '공개 여부',
    category_id INT NOT NULL COMMENT '시나리오 카테고리 고유번호',
    CONSTRAINT fk_scenario_category
        FOREIGN KEY (category_id) REFERENCES category(category_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시나리오';

-- ========================================================
-- ③ 시나리오 단계 (scenario_step)
-- ========================================================
CREATE TABLE scenario_step (
    step_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '시나리오단계 고유번호',
    scenario_id INT NOT NULL COMMENT '시나리오 고유번호',
    step_order INT NOT NULL COMMENT '단계 순서',
    step_title VARCHAR(150) NOT NULL COMMENT '단계 제목',
    step_description TEXT COMMENT '단계 설명',
    CONSTRAINT uq_scenario_step_order UNIQUE (scenario_id, step_order),
    CONSTRAINT fk_step_scenario
        FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시나리오 단계';

-- ========================================================
-- ④ 시뮬레이션 진행 이력 (simulation_progress)
-- ========================================================
CREATE TABLE simulation_progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '진행 고유 번호',
    member_id INT NOT NULL COMMENT '회원 고유번호',
    scenario_id INT NOT NULL COMMENT '시나리오 고유번호',
    step_id INT COMMENT '현재단계 고유 번호',
    progress_status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS' COMMENT '진행 상황',
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '시뮬레이션 시작일',
    last_saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '시뮬레이션 마지막 저장일',
    completed_at DATETIME COMMENT '시뮬레이션 완료 일',
    CONSTRAINT fk_progress_member
        FOREIGN KEY (member_id) REFERENCES member(member_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_progress_scenario
        FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_progress_step
        FOREIGN KEY (step_id) REFERENCES scenario_step(step_id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시뮬레이션 진행 이력';

-- ========================================================
-- ⑤ 시뮬레이션 입력정보 (simulation_answer)
-- ========================================================
CREATE TABLE simulation_answer (
    answer_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '입력 정보 고유 번호',
    progress_id INT NOT NULL COMMENT '진행 고유 번호',
    step_id INT NOT NULL COMMENT '응답단계 고유 번호',
    field_key VARCHAR(100) NOT NULL COMMENT '질문 식별 키',
    answer_value TEXT COMMENT '입력 값',
    CONSTRAINT uq_simulation_answer UNIQUE (progress_id, step_id, field_key),
    CONSTRAINT fk_answer_progress
        FOREIGN KEY (progress_id) REFERENCES simulation_progress(progress_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_answer_step
        FOREIGN KEY (step_id) REFERENCES scenario_step(step_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시뮬레이션 입력정보';

-- ========================================================
-- ⑥ 시뮬레이션 가족정보 (simulation_family)
-- ========================================================
CREATE TABLE simulation_family (
    family_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '가족 고유 번호',
    progress_id INT NOT NULL COMMENT '진행 고유 번호',
    family_name VARCHAR(50) NOT NULL COMMENT '가족 이름',
    birth_date DATE NOT NULL COMMENT '가족 생일',
    gender CHAR(1) NOT NULL COMMENT '가족 성별',
    phone_num VARCHAR(20) COMMENT '가족 전화번호',
    is_applicant BOOLEAN NOT NULL DEFAULT FALSE COMMENT '신청인 본인 여부',
    is_original_head BOOLEAN NOT NULL DEFAULT FALSE COMMENT '최초 세대주 여부',
    original_relationship VARCHAR(20) NOT NULL COMMENT '최초 세대주와의 관계',
    is_household_head BOOLEAN NOT NULL DEFAULT FALSE COMMENT '현재 세대주 여부',
    relationship VARCHAR(20) COMMENT '현재 세대주와의 관계',
    move_status VARCHAR(20) DEFAULT NULL COMMENT '가족의 이사 여부 (MOVE/REMAIN)',
    CONSTRAINT fk_family_progress
        FOREIGN KEY (progress_id) REFERENCES simulation_progress(progress_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시뮬레이션 가족정보';

-- ========================================================
-- ⑨ 문의 카테고리 (qna_category)
-- ========================================================
CREATE TABLE qna_category (
    qna_category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '문의 카테고리 고유 번호',
    qna_category_name VARCHAR(50) NOT NULL COMMENT '문의 카테고리 이름'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='문의 카테고리';

-- ========================================================
-- ⑧ 문의게시판 (qna) - [논리적 삭제 is_deleted 반영]
-- ========================================================
CREATE TABLE qna (
    qna_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '문의 고유 번호',
    member_id INT NOT NULL COMMENT '회원 고유번호',
    qna_category_id INT NOT NULL COMMENT '문의 카테고리 고유번호',
    qna_title VARCHAR(200) NOT NULL COMMENT '문의 제목',
    qna_content TEXT NOT NULL COMMENT '문의 내용',
    qna_status VARCHAR(20) NOT NULL DEFAULT 'WAITING' COMMENT '문의 답변 상태 (WAITING/ANSWERING/ANSWERED)',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 여부 (논리적 삭제)',
    qna_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '문의 작성일',
    qna_updated_at DATETIME COMMENT '문의 수정일',
    CONSTRAINT fk_qna_member
        FOREIGN KEY (member_id) REFERENCES member(member_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_qna_category
        FOREIGN KEY (qna_category_id) REFERENCES qna_category(qna_category_id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='문의게시판';

-- ========================================================
-- ⑩ 문의 답변 (qna_answer)
-- ========================================================
CREATE TABLE qna_answer (
    qna_answer_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '문의 답변 고유번호',
    qna_id INT NOT NULL COMMENT '문의 고유번호',
    member_id INT NOT NULL COMMENT '관리자 고유번호',
    qna_answer_content TEXT NOT NULL COMMENT '답변 내용',
    qna_answer_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '답변 작성일',
    CONSTRAINT fk_qna_answer_qna
        FOREIGN KEY (qna_id) REFERENCES qna(qna_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_qna_answer_admin
        FOREIGN KEY (member_id) REFERENCES member(member_id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='문의 답변';

-- ========================================================
-- ⑪ 관리자 공통 로그 (admin_log) - [BIGINT / action_type(30) 반영]
-- ========================================================
CREATE TABLE admin_log (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '로그 고유 번호',
    admin_id INT COMMENT '작업 수행 관리자 고유 번호',
    log_type VARCHAR(20) NOT NULL COMMENT '로그 유형 (MEMBER/SCENARIO/QNA)',
    action_type VARCHAR(30) NOT NULL COMMENT '작업 유형 (CREATE/UPDATE 등)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '로그 생성 일시',
    CONSTRAINT fk_admin_log_member
        FOREIGN KEY (admin_id) REFERENCES member(member_id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='관리자 공통 로그';

-- ========================================================
-- ⑫ 회원 관리 로그 상세 (admin_log_member)
-- ========================================================
CREATE TABLE admin_log_member (
    log_id BIGINT PRIMARY KEY COMMENT '로그 고유 번호',
    member_id INT COMMENT '대상 회원 고유 번호',
    CONSTRAINT fk_admin_log_member_log
        FOREIGN KEY (log_id) REFERENCES admin_log(log_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_admin_log_member_member
        FOREIGN KEY (member_id) REFERENCES member(member_id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='회원 관리 로그 상세';

-- ========================================================
-- ⑬ 시나리오 관리 로그 상세 (admin_log_scenario)
-- ========================================================
CREATE TABLE admin_log_scenario (
    log_id BIGINT PRIMARY KEY COMMENT '로그 고유 번호',
    scenario_id INT COMMENT '대상 시나리오 고유 번호',
    CONSTRAINT fk_admin_log_scenario_log
        FOREIGN KEY (log_id) REFERENCES admin_log(log_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_admin_log_scenario_scenario
        FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='시나리오 관리 로그 상세';

-- ========================================================
-- ⑭ 문의 관리 로그 상세 (admin_log_qna) - [qna_id FK 반영]
-- ========================================================
CREATE TABLE admin_log_qna (
    log_id BIGINT PRIMARY KEY COMMENT '로그 고유 번호',
    qna_id INT COMMENT '대상 문의 고유 번호',
    CONSTRAINT fk_admin_log_qna_log
        FOREIGN KEY (log_id) REFERENCES admin_log(log_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_admin_log_qna_qna
        FOREIGN KEY (qna_id) REFERENCES qna(qna_id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='문의 관리 로그 상세';