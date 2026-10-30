-- ========================================================
-- 회원 관련 초기 데이터 (전원 비밀번호: kosa1004)
-- BCrypt 해시: $2a$10$WjepDBVe32Z2bgWZ2EFZeu0eZ//Ln4CSCekG2YekhOP7T3hMDJtOy
-- ========================================================

-- 1. 관리자 계정 (ID: admin / PW: kosa1004)
INSERT INTO member (
    member_id,
    login_id,
    password,
    member_name,
    email,
    role,
    member_status
)
VALUES (1, 'admin', '$2a$10$WjepDBVe32Z2bgWZ2EFZeu0eZ//Ln4CSCekG2YekhOP7T3hMDJtOy', '관리자1', 'admin@haebom.co.kr', 'ADMIN', 'ACTIVE');

-- 2. 일반 회원 샘플 데이터 (전원 비밀번호: kosa1004 / 남4, 여4 / 10대~60대)
INSERT INTO member (
    member_id,
    login_id,
    password,
    email,
    member_name,
    birth_date,
    gender,
    role,
    member_status,
    created_at
) VALUES 
(2, 'user_teen', '$2a$10$WjepDBVe32Z2bgWZ2EFZeu0eZ//Ln4CSCekG2YekhOP7T3hMDJtOy', 'teen@haebom.co.kr', '이지은', '2008-03-12', 'F', 'USER', 'ACTIVE', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(3, 'user_young_m', '$2a$10$WjepDBVe32Z2bgWZ2EFZeu0eZ//Ln4CSCekG2YekhOP7T3hMDJtOy', 'young_m@haebom.co.kr', '김민수', '1998-07-25', 'M', 'USER', 'ACTIVE', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(4, 'user_young_f', '$2a$10$WjepDBVe32Z2bgWZ2EFZeu0eZ//Ln4CSCekG2YekhOP7T3hMDJtOy', 'young_f@haebom.co.kr', '박서연', '2001-11-04', 'F', 'USER', 'ACTIVE', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(5, 'user_thirty_m', '$2a$10$WjepDBVe32Z2bgWZ2EFZeu0eZ//Ln4CSCekG2YekhOP7T3hMDJtOy', 'thirty_m@haebom.co.kr', '홍길동', '1994-05-15', 'M', 'USER', 'ACTIVE', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(6, 'user_thirty_f', '$2a$10$WjepDBVe32Z2bgWZ2EFZeu0eZ//Ln4CSCekG2YekhOP7T3hMDJtOy', 'thirty_f@haebom.co.kr', '최유진', '1990-09-30', 'F', 'USER', 'ACTIVE', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(7, 'user_forty_m', '$2a$10$WjepDBVe32Z2bgWZ2EFZeu0eZ//Ln4CSCekG2YekhOP7T3hMDJtOy', 'forty_m@haebom.co.kr', '정우성', '1981-12-18', 'M', 'USER', 'ACTIVE', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(8, 'user_fifty_m', '$2a$10$WjepDBVe32Z2bgWZ2EFZeu0eZ//Ln4CSCekG2YekhOP7T3hMDJtOy', 'fifty_m@haebom.co.kr', '강동원', '1972-04-05', 'M', 'USER', 'ACTIVE', DATE_SUB(NOW(), INTERVAL 60 DAY)),
(9, 'user_senior_f', '$2a$10$WjepDBVe32Z2bgWZ2EFZeu0eZ//Ln4CSCekG2YekhOP7T3hMDJtOy', 'senior_f@haebom.co.kr', '윤여정', '1958-06-22', 'F', 'USER', 'ACTIVE', DATE_SUB(NOW(), INTERVAL 70 DAY));