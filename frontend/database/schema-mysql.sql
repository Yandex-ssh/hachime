-- ═══════════════════════════════════════════════════════════════════════════
-- TMC CAREER PATHWAY VISUALIZATION TOOL - DATABASE SCHEMA (MySQL/MariaDB)
-- Creates 12 tables: programs, students, subjects, student_subjects, careers,
-- career_subjects, skills, career_skills, internships, student_saved_internships,
-- alumni, industry_trends
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing tables (for fresh install)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS student_saved_internships;
DROP TABLE IF EXISTS career_skills;
DROP TABLE IF EXISTS career_subjects;
DROP TABLE IF EXISTS student_subjects;
DROP TABLE IF EXISTS internships;
DROP TABLE IF EXISTS alumni;
DROP TABLE IF EXISTS industry_trends;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS careers;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS programs;
SET FOREIGN_KEY_CHECKS = 1;

-- ───────────────────────────────────────────────────────────────────────────
-- 1. PROGRAMS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE programs (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    program_code VARCHAR(20) UNIQUE NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    description TEXT,
    total_years INT DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. STUDENTS TABLE (Authentication + Profile)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    program_id INT,
    year_level INT CHECK (year_level BETWEEN 1 AND 4),
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE SET NULL,
    INDEX idx_students_student_number (student_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. SUBJECTS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20),
    subject_name VARCHAR(255) NOT NULL,
    program_id INT,
    year_level INT CHECK (year_level BETWEEN 1 AND 4),
    semester INT CHECK (semester IN (1, 2)),
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE,
    INDEX idx_subjects_program_year (program_id, year_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 4. STUDENT_SUBJECTS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE student_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject_id INT,
    is_finished BOOLEAN DEFAULT FALSE,
    is_liked BOOLEAN DEFAULT FALSE,
    self_rating ENUM('Beginner', 'Intermediate', 'Advanced'),
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_subject (student_id, subject_id),
    INDEX idx_student_subjects_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 5. CAREERS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE careers (
    career_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    growth_rate VARCHAR(10),
    demand_level ENUM('Low', 'Medium', 'High', 'Very High'),
    job_examples JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 6. CAREER_SUBJECTS TABLE (THE KEY TABLE)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE career_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    career_id INT,
    subject_id INT,
    weight INT DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (career_id) REFERENCES careers(career_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    UNIQUE KEY unique_career_subject (career_id, subject_id),
    INDEX idx_career_subjects_career (career_id),
    INDEX idx_career_subjects_subject (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 7. SKILLS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    learning_resource_url TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 8. CAREER_SKILLS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE career_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    career_id INT,
    skill_id INT,
    priority ENUM('low', 'medium', 'high'),
    FOREIGN KEY (career_id) REFERENCES careers(career_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
    UNIQUE KEY unique_career_skill (career_id, skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 9. INTERNSHIPS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE internships (
    internship_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    work_type ENUM('On-site', 'Hybrid', 'Remote'),
    duration VARCHAR(50),
    stipend_min DECIMAL(10, 2),
    stipend_max DECIMAL(10, 2),
    deadline DATE,
    description TEXT,
    requirements JSON,
    company_logo_url TEXT,
    apply_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_internships_active (is_active, deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 10. STUDENT_SAVED_INTERNSHIPS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE student_saved_internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    internship_id INT,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(internship_id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_internship (student_id, internship_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 11. ALUMNI TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE alumni (
    alumni_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program_id INT,
    batch_year INT,
    current_job_title VARCHAR(255),
    current_company VARCHAR(255),
    location VARCHAR(255),
    salary_range VARCHAR(50),
    months_to_land_job INT,
    favorite_subjects JSON,
    skills_used JSON,
    advice TEXT,
    linkedin_url TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 12. INDUSTRY_TRENDS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE industry_trends (
    trend_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(10),
    growth_rate VARCHAR(10),
    demand_level VARCHAR(20),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    description TEXT,
    top_roles JSON,
    top_skills JSON,
    top_companies JSON,
    insight TEXT,
    `year` INT DEFAULT NULL COMMENT 'e.g. YEAR(CURDATE()) in app or 2024',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ═══════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA INSERTS
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert Programs
INSERT INTO programs (program_code, program_name, description) VALUES
('BSIT', 'Bachelor of Science in Information Technology', 'Focuses on software development, networking, and IT infrastructure'),
('BSCRIM', 'Bachelor of Science in Criminology', 'Study of crime, criminal behavior, and law enforcement'),
('BSED', 'Bachelor of Science in Education', 'Preparation for teaching careers'),
('BSOA', 'Bachelor of Science in Office Administration', 'Business and office management'),
('BSPOL.SCI', 'Bachelor of Science in Political Science', 'Study of government and political systems');

-- Insert Sample Subjects (BSIT - 1st Year)
INSERT INTO subjects (subject_code, subject_name, program_id, year_level, semester, category) VALUES
('IT 101', 'Computer Concepts and Fundamentals', 1, 1, 1, 'Core'),
('IT 102', 'Computer Programming 1', 1, 1, 1, 'Programming'),
('IT 103', 'Application and Productivity Tools', 1, 1, 1, 'Tools'),
('GE 1', 'Purposive Communication', 1, 1, 1, 'General Education'),
('IT 104', 'HTML and Internet Fundamentals', 1, 1, 2, 'Web'),
('IT 105', 'Computer Programming 2', 1, 1, 2, 'Programming'),
('IT 106', 'Human-Computer Interaction', 1, 1, 2, 'Design'),
('GE 2', 'Understanding the Self', 1, 1, 2, 'General Education');

-- Insert Sample Student (password is 'password123')
-- NOTE: Use bcrypt in production!
INSERT INTO students (student_number, name, program_id, year_level, password_hash) VALUES
('2024-00123', 'Juan Dela Cruz', 1, 2, '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FRh.Jb0t3GBTEuPELmNpb3fK5qJz/6u');

-- Insert Sample Careers
INSERT INTO careers (title, icon, description, salary_min, salary_max, growth_rate, demand_level, job_examples) VALUES
('Software Engineer', '💻', 'Design, build, and maintain software systems', 30000, 80000, '+18%', 'Very High', 
 JSON_ARRAY('Frontend Developer', 'Backend Developer', 'Full Stack Developer')),
('Data Analyst', '📊', 'Analyze data to help businesses make decisions', 25000, 60000, '+25%', 'High',
 JSON_ARRAY('Business Analyst', 'BI Analyst', 'Data Scientist')),
('Web Developer', '🌐', 'Create and maintain websites and web applications', 25000, 70000, '+15%', 'High',
 JSON_ARRAY('Frontend Developer', 'UI/UX Developer', 'React Developer'));

-- Insert Sample Skills
INSERT INTO skills (skill_name, category, learning_resource_url) VALUES
('JavaScript', 'Programming', 'https://javascript.info'),
('Python', 'Programming', 'https://python.org'),
('React', 'Web Development', 'https://react.dev'),
('SQL', 'Data & Analytics', 'https://sqlzoo.net'),
('Git & GitHub', 'Tools & Soft Skills', 'https://github.com');

-- Link careers to skills
INSERT INTO career_skills (career_id, skill_id, priority) VALUES
(1, 1, 'high'),
(1, 3, 'high'),
(1, 5, 'high'),
(2, 2, 'high'),
(2, 4, 'high'),
(3, 1, 'high'),
(3, 3, 'high');
