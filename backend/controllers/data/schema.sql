-- ============================================
-- 0. CLEANUP (optional if re-running)
-- ============================================
DROP TABLE IF EXISTS student_warnings, exam_monitoring_logs, student_scores, essay_answers, student_answers, questions, section_takers, exam_sessions, examinations, sections, year_levels, courses, users CASCADE;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_initial CHAR(1) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  gender VARCHAR(20) DEFAULT 'N/A',
  college VARCHAR(50),
  school_id BIGINT UNIQUE,
  role TEXT CHECK (role IN ('student', 'admin', 'superadmin')) NOT NULL DEFAULT 'student',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. COURSES, YEAR LEVELS, AND SECTIONS
-- ============================================

-- 2.1 COURSES TABLE
CREATE TABLE courses (
  course_id SERIAL PRIMARY KEY,
  course_code VARCHAR(6) UNIQUE NOT NULL,
  course_name TEXT NOT NULL
);

INSERT INTO courses (course_code, course_name)
VALUES
  ('BSIT', 'Bachelor of Science in Information Technology'),
  ('BSCS', 'Bachelor of Science in Computer Science'),
  ('BSIS', 'Bachelor of Science in Information Systems');

-- 2.2 YEAR LEVELS TABLE
CREATE TABLE year_levels (
  year_level_id SERIAL PRIMARY KEY,
  year_number INT CHECK (year_number BETWEEN 1 AND 4) UNIQUE NOT NULL
);

INSERT INTO year_levels (year_number)
VALUES (1), (2), (3), (4);

-- 2.3 SECTIONS TABLE
CREATE TABLE sections (
  section_id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
  year_level_id INT REFERENCES year_levels(year_level_id) ON DELETE CASCADE,
  section_name VARCHAR(10) NOT NULL,
  UNIQUE (course_id, year_level_id, section_name)
);

-- Section Inserts
INSERT INTO sections (course_id, year_level_id, section_name)
VALUES
-- BSIT Year 1–4
(1,1,'A'),(1,1,'B'),(1,1,'C'),(1,1,'D'),(1,1,'E'),(1,1,'F'),(1,1,'G'),(1,1,'H'),(1,1,'I'),(1,1,'J'),(1,1,'K'),(1,1,'L'),(1,1,'M'),
(1,2,'A'),(1,2,'B'),(1,2,'C'),(1,2,'D'),(1,2,'E'),(1,2,'F'),(1,2,'G'),(1,2,'H'),(1,2,'I'),(1,2,'J'),(1,2,'K'),(1,2,'L'),
(1,3,'A'),(1,3,'B'),(1,3,'C'),(1,3,'D'),(1,3,'E'),(1,3,'F'),(1,3,'G'),(1,3,'H'),(1,3,'I'),(1,3,'J'),(1,3,'K'),(1,3,'L'),
(1,4,'A'),(1,4,'B'),(1,4,'C'),(1,4,'D'),(1,4,'E'),(1,4,'F'),(1,4,'G'),(1,4,'H'),(1,4,'I'),(1,4,'J'),(1,4,'K'),
-- BSCS Year 1–4
(2,1,'A'),(2,1,'B'),(2,2,'A'),(2,2,'B'),(2,3,'A'),(2,3,'B'),(2,4,'A'),(2,4,'B'),
-- BSIS Year 1–4
(3,1,'A'),(3,1,'B'),(3,1,'C'),(3,1,'D'),(3,1,'E'),
(3,2,'A'),(3,2,'B'),(3,2,'C'),(3,2,'D'),
(3,3,'A'),(3,3,'B'),(3,3,'C'),(3,3,'D'),
(3,4,'A'),(3,4,'B'),(3,4,'C');

-- ============================================
-- 3. EXAMINATIONS AND SESSION TABLES
-- ============================================

-- 3.1 EXAMINATIONS TABLE
CREATE TABLE examinations (
  exam_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  exam_code TEXT,
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  timer_question INT,
  exam_duration INT,
  passing_score INT DEFAULT 0,
  total_points INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 SECTION TAKERS TABLE (fixed sequence)
CREATE TABLE section_takers (
  id SERIAL PRIMARY KEY,
  section_id INT REFERENCES sections(section_id) ON DELETE CASCADE,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  is_finalized BOOLEAN DEFAULT FALSE
);

-- 3.3 EXAM_SESSIONS TABLE
CREATE TABLE exam_sessions (
  session_id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  student_school_id BIGINT REFERENCES users(school_id) ON DELETE CASCADE ON UPDATE CASCADE,
  status TEXT CHECK (status IN ('in-progress', 'submitted')) DEFAULT 'in-progress',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  question_order JSONB,
  current_index INT DEFAULT 0,
  time_remaining INT
);

-- ============================================
-- 4. QUESTIONS AND STUDENT ANSWERS
-- ============================================

-- 4.1 QUESTIONS TABLE
CREATE TABLE questions (
  question_id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  question_type TEXT CHECK (question_type IN ('multiplechoice', 'truefalse', 'identification', 'essay')) NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT,
  points INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.2 STUDENT_ANSWERS TABLE
CREATE TABLE student_answers (
  answer_id SERIAL PRIMARY KEY,
  session_id INT REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(question_id) ON DELETE CASCADE,
  student_school_id BIGINT REFERENCES users(school_id) ON DELETE CASCADE ON UPDATE CASCADE,
  student_answer TEXT,
  is_correct BOOLEAN
);

-- 4.3 ESSAY_ANSWERS TABLE
CREATE TABLE essay_answers (
  answer_id SERIAL PRIMARY KEY,
  session_id INT REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(question_id) ON DELETE CASCADE,
  student_school_id BIGINT REFERENCES users(school_id) ON DELETE CASCADE ON UPDATE CASCADE,
  student_answer TEXT,
  essay_score INT DEFAULT 0
);

-- 4.4 STUDENT_SCORES TABLE
CREATE TABLE student_scores (
  score_id SERIAL PRIMARY KEY,
  session_id INT REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  student_school_id BIGINT REFERENCES users(school_id) ON DELETE CASCADE ON UPDATE CASCADE,
  total_score INT DEFAULT 0,
  objective_score INT DEFAULT 0,
  essay_score INT DEFAULT 0,
  deduction INT DEFAULT 0,
  section_name TEXT,
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (exam_id, student_school_id)
);

-- ============================================
-- 5. MONITORING & WARNINGS
-- ============================================

-- 5.1 EXAM_MONITORING_TABLE
CREATE TABLE exam_monitoring (
  monitor_id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  session_id INT REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
  student_school_id BIGINT REFERENCES users(school_id) ON DELETE CASCADE ON UPDATE CASCADE,

  event_type VARCHAR(50) NOT NULL,      -- 'tab_switch', 'resize', 'face_away'
  is_warning BOOLEAN DEFAULT FALSE,     -- TRUE if this event triggered an official warning

  details TEXT,                         -- e.g. "Resized window for 4.2s"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 6. SYSTEM LOG
-- ============================================


CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,  -- link to users.user_id
  action TEXT NOT NULL,                                              -- description of the action
  target_id INT,                                                     -- optional: affected exam/user/etc.
  created_at TIMESTAMP DEFAULT NOW()                                 -- timestamp of the action
);
