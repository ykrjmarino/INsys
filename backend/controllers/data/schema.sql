-- ========================
-- 1. USERS TABLE
-- ========================
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  contact_number VARCHAR(15),
  gender VARCHAR(20) DEFAULT 'N/A',
  college VARCHAR(50),
  school_id BIGINT UNIQUE,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')) NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- 2. EXAMINATIONS TABLE
-- ========================
CREATE TABLE examinations (
  exam_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  title TEXT NOT NULL,
  schedule DATE,
  status TEXT DEFAULT 'draft',
  exam_code TEXT,
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  timer_question INT,
  exam_duration INT,
  total_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- 3. EXAM_SESSIONS TABLE
-- ========================
CREATE TABLE exam_sessions (
  session_id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  student_school_id BIGINT REFERENCES users(school_id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('in-progress', 'submitted')) DEFAULT 'in-progress',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP,
  question_order JSONB,
  current_index INT DEFAULT 0,
  time_remaining INT
);

-- ========================
-- 4. SECTION TAKERS TABLE
-- ========================
CREATE TABLE section_takers (
  section_id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  is_finalized BOOLEAN DEFAULT FALSE
);

-- ========================
-- 5. QUESTIONS TABLE
-- ========================
CREATE TABLE questions (
  question_id SERIAL PRIMARY KEY,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  user_id INT REFERENCES users(user_id),
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

-- ========================
-- 6. STUDENT ANSWERS TABLE
-- ========================
CREATE TABLE student_answers (
  answer_id SERIAL PRIMARY KEY,
  session_id INT REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(question_id) ON DELETE CASCADE,
  student_school_id BIGINT REFERENCES users(school_id) ON DELETE CASCADE,
  student_answer TEXT,
  is_correct BOOLEAN
);

-- ========================
-- 7. ESSAY ANSWERS TABLE
-- ========================
CREATE TABLE essay_answers (
  answer_id SERIAL PRIMARY KEY,
  session_id INT REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(question_id) ON DELETE CASCADE,
  student_school_id BIGINT REFERENCES users(school_id) ON DELETE CASCADE,
  student_answer TEXT,
  essay_score INT DEFAULT 0
);

-- ========================
-- 8. STUDENT SCORES TABLE
-- ========================
CREATE TABLE student_scores (
  score_id SERIAL PRIMARY KEY,
  session_id INT REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
  exam_id INT REFERENCES examinations(exam_id) ON DELETE CASCADE,
  student_school_id BIGINT REFERENCES users(school_id) ON DELETE CASCADE,
  total_score INT DEFAULT 0,
  objective_score INT DEFAULT 0,
  essay_score INT DEFAULT 0,
  section_name TEXT,
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (exam_id, student_school_id)
);

-- ========================
-- 9. EXAM MONITORING LOGS
-- ========================
CREATE TABLE exam_monitoring_logs (
  log_id SERIAL PRIMARY KEY,
  session_id INT REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(question_id),
  event_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- 10. STUDENT WARNINGS
-- ========================
CREATE TABLE student_warnings (
  warning_id SERIAL PRIMARY KEY,
  session_id INT REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(question_id),
  warning_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- 11. COURSES TABLE
-- ========================
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

-- ========================
-- 12. YEAR LEVELS
-- ========================
CREATE TABLE year_levels (
  year_level_id SERIAL PRIMARY KEY,
  year_number INT CHECK (year_number BETWEEN 1 AND 4) UNIQUE NOT NULL
);

INSERT INTO year_levels (year_number) VALUES (1),(2),(3),(4);

-- ========================
-- 13. SECTIONS
-- ========================
CREATE TABLE sections (
  section_id SERIAL PRIMARY KEY,
  course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
  year_level_id INT REFERENCES year_levels(year_level_id) ON DELETE CASCADE,
  section_name VARCHAR(10) NOT NULL,
  UNIQUE (course_id, year_level_id, section_name)
);

-- Example: Insert sections (BSIT Year 1–4, BSCS Year 1–4, BSIS Year 1–4)
INSERT INTO sections (course_id, year_level_id, section_name) VALUES
(1,1,'A'),(1,1,'B'),(1,1,'C'),(1,1,'D'),(1,1,'E'),(1,1,'F'),(1,1,'G'),(1,1,'H'),(1,1,'I'),(1,1,'J'),(1,1,'K'),(1,1,'L'),(1,1,'M'),
(1,2,'A'),(1,2,'B'),(1,2,'C'),(1,2,'D'),(1,2,'E'),(1,2,'F'),(1,2,'G'),(1,2,'H'),(1,2,'I'),(1,2,'J'),(1,2,'K'),(1,2,'L'),
(1,3,'A'),(1,3,'B'),(1,3,'C'),(1,3,'D'),(1,3,'E'),(1,3,'F'),(1,3,'G'),(1,3,'H'),(1,3,'I'),(1,3,'J'),(1,3,'K'),(1,3,'L'),
(1,4,'A'),(1,4,'B'),(1,4,'C'),(1,4,'D'),(1,4,'E'),(1,4,'F'),(1,4,'G'),(1,4,'H'),(1,4,'I'),(1,4,'J'),(1,4,'K'),
(2,1,'A'),(2,1,'B'),(2,2,'A'),(2,2,'B'),(2,3,'A'),(2,3,'B'),(2,4,'A'),(2,4,'B'),
(3,1,'A'),(3,1,'B'),(3,1,'C'),(3,1,'D'),(3,1,'E'),
(3,2,'A'),(3,2,'B'),(3,2,'C'),(3,2,'D'),
(3,3,'A'),(3,3,'B'),(3,3,'C'),(3,3,'D'),
(3,4,'A'),(3,4,'B'),(3,4,'C');
