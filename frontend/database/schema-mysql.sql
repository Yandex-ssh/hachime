-- ═══════════════════════════════════════════════════════════════════════════
-- TMC CAREER PATHWAY VISUALIZATION TOOL - DATABASE SCHEMA (MySQL/MariaDB)
-- Creates 12 tables: programs, students, subjects, student_subjects, careers,
-- career_subjects, skills, career_skills, internships, student_saved_internships,
-- alumni, industry_trends
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing tables (for fresh install)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS student_saved_resources;
DROP TABLE IF EXISTS development_resources;
DROP TABLE IF EXISTS student_saved_jobs;
DROP TABLE IF EXISTS job_listings;
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
    target_career_id INT NULL,
    year_level INT CHECK (year_level BETWEEN 1 AND 4),
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    profile_picture_url LONGTEXT NULL,
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
    program_id INT NULL,
    FOREIGN KEY (program_id) REFERENCES programs(program_id),
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

ALTER TABLE students ADD CONSTRAINT fk_students_target_career
    FOREIGN KEY (target_career_id) REFERENCES careers(career_id) ON DELETE SET NULL;

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
-- 8b. SUBJECT_SKILLS TABLE (SUBJECTS ↔ SKILLS MAPPING)
-- Enables deriving student skill inventory from finished subjects.
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE subject_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    skill_id INT NOT NULL,
    weight INT DEFAULT 1,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
    UNIQUE KEY unique_subject_skill (subject_id, skill_id),
    INDEX idx_subject_skills_subject (subject_id),
    INDEX idx_subject_skills_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 9a. JOB LISTINGS TABLE (Entry-level roles)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE job_listings (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    work_type ENUM('On-site', 'Hybrid', 'Remote'),
    employment_type ENUM('Full-time', 'Part-time', 'Contract') DEFAULT 'Full-time',
    experience_level ENUM('Entry-level', 'Junior', 'Mid', 'Senior') DEFAULT 'Entry-level',
    program_id INT NULL,
    career_id INT NULL,
    description TEXT,
    requirements JSON,
    required_subject_ids JSON,
    apply_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline DATE,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE SET NULL,
    FOREIGN KEY (career_id) REFERENCES careers(career_id) ON DELETE SET NULL,
    INDEX idx_jobs_active (is_active, deadline),
    INDEX idx_jobs_program (program_id),
    INDEX idx_jobs_career (career_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 9b. STUDENT_SAVED_JOBS TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE student_saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES job_listings(job_id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_job (student_id, job_id),
    INDEX idx_student_saved_jobs_student (student_id)
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
    required_subject_ids JSON,
    company_logo_url TEXT,
    apply_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_internships_active (is_active, deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 10a. DEVELOPMENT_RESOURCES TABLE (courses/certs/roadmaps)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE development_resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('Course', 'Certification', 'Roadmap', 'Article', 'Bootcamp') NOT NULL,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    url TEXT NOT NULL,
    description TEXT,
    program_id INT NULL,
    skill_ids JSON,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    cost_type ENUM('Free', 'Paid', 'Freemium') DEFAULT 'Free',
    certificate_offered BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE SET NULL,
    INDEX idx_resources_active (is_active),
    INDEX idx_resources_program (program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ───────────────────────────────────────────────────────────────────────────
-- 10b. STUDENT_SAVED_RESOURCES TABLE
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE student_saved_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    resource_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES development_resources(resource_id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_resource (student_id, resource_id),
    INDEX idx_student_saved_resources_student (student_id)
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
    graduated_year INT,
    current_job_title VARCHAR(255),
    current_company VARCHAR(255),
    location VARCHAR(255),
    salary_range VARCHAR(50),
    months_to_land_job INT,
    favorite_subjects JSON,
    skills_used JSON,
    internships JSON,
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

-- Link careers to key subjects (so goal progress + roadmap + gap analysis work)
-- NOTE: subject_id values rely on the insert order above (first BSIT subjects).
INSERT INTO career_subjects (career_id, subject_id, weight, is_required) VALUES
-- Software Engineer
(1, 2, 2, TRUE),  -- Computer Programming 1
(1, 6, 2, TRUE),  -- Computer Programming 2
(1, 5, 1, TRUE),  -- HTML and Internet Fundamentals
(1, 1, 1, TRUE),  -- Computer Concepts and Fundamentals
-- Data Analyst
(2, 1, 1, TRUE),  -- Computer Concepts and Fundamentals
(2, 2, 1, TRUE),  -- Computer Programming 1
-- Web Developer
(3, 5, 2, TRUE),  -- HTML and Internet Fundamentals
(3, 2, 1, TRUE),  -- Computer Programming 1
(3, 6, 1, TRUE);  -- Computer Programming 2

-- Map subjects to skills (enables real "skill inventory" from completed subjects)
INSERT INTO subject_skills (subject_id, skill_id, weight) VALUES
(2, 1, 2),  -- Programming 1 -> JavaScript (baseline)
(6, 1, 2),  -- Programming 2 -> JavaScript
(5, 3, 2),  -- HTML -> React (web track proxy)
(2, 5, 1),  -- Programming 1 -> Git
(3, 5, 1),  -- Productivity Tools -> Git (tools practice proxy)
(1, 2, 1),  -- Concepts -> Python (logic proxy)
(1, 4, 1);  -- Concepts -> SQL (data proxy)

-- Seed Alumni (user-side browseable without admin)
INSERT INTO alumni
(name, program_id, batch_year, graduated_year, current_job_title, current_company, location, salary_range, months_to_land_job, favorite_subjects, skills_used, internships, advice, linkedin_url, is_visible)
VALUES
('Mark Reyes', 1, 2022, 2022, 'Full Stack Developer', 'Accenture Philippines', 'Taguig, Metro Manila', '₱45,000/mo', 4,
 JSON_ARRAY('Web Information System','OOP 1 & 2','Software Engineering'),
 JSON_ARRAY('React','Node.js','MySQL','Docker'),
 JSON_ARRAY(JSON_OBJECT('role_title','Software Developer Intern','company_name','Accenture Philippines','location','Taguig, Metro Manila','year',2021)),
 'Master the basics deeply. Many devs rush frameworks but struggle with fundamentals.',
 'https://www.linkedin.com', TRUE),
('Patricia Santos', 1, 2021, 2021, 'Data Analyst', 'UnionBank of the Philippines', 'Pasig City', '₱38,000/mo', 2,
 JSON_ARRAY('Database System','Advanced Statistics','Methodology'),
 JSON_ARRAY('SQL','Python','Tableau','Excel'),
 JSON_ARRAY(JSON_OBJECT('role_title','Data Analytics Intern','company_name','UnionBank of the Philippines','location','Pasig City','year',2020)),
 'Don’t underestimate Statistics and Database — those define what I do daily.',
 'https://www.linkedin.com', TRUE);

-- Seed Industry Trends (user-side browseable without admin)
INSERT INTO industry_trends
(title, icon, growth_rate, demand_level, salary_min, salary_max, description, top_roles, top_skills, top_companies, insight, `year`, is_active)
VALUES
('Artificial Intelligence & Machine Learning', '🤖', '+35%', 'Very High', 50000, 150000,
 'AI and ML continue to dominate the tech industry across many sectors.',
 JSON_ARRAY('ML Engineer','AI Researcher','Data Scientist','Prompt Engineer'),
 JSON_ARRAY('Python','TensorFlow','PyTorch','Statistics','Data Modeling'),
 JSON_ARRAY('Google','Microsoft','Accenture','IBM'),
 'Generative AI is creating new roles and rapidly changing required skills.', 2025, TRUE),
('Cloud Computing', '☁️', '+22%', 'High', 40000, 100000,
 'Businesses are moving to cloud infrastructure, increasing demand for cloud talent.',
 JSON_ARRAY('Cloud Engineer','DevOps Engineer','Cloud Architect','Site Reliability Engineer'),
 JSON_ARRAY('AWS','Docker','Kubernetes','CI/CD','Linux'),
 JSON_ARRAY('Amazon','Microsoft','Accenture'),
 'Cloud certifications can significantly increase starting salaries.', 2025, TRUE);

-- ═══════════════════════════════════════════════════════════════════════════
-- OPPORTUNITIES PORTAL SEED DATA (User-side browsing)
-- - internships
-- - job_listings
-- - development_resources
-- ═══════════════════════════════════════════════════════════════════════════

-- Seed Internships
INSERT INTO internships
(company_name, role_title, location, work_type, duration, stipend_min, stipend_max, deadline, description, requirements, required_subject_ids, apply_url, is_active)
VALUES
('Accenture Philippines', 'Software Developer Intern', 'Taguig, Metro Manila', 'Hybrid', '6 months', 12000, 18000, '2026-04-20',
 'Join an agile team and help build web features. Great for students who enjoy programming + web subjects.',
 JSON_OBJECT('skills', JSON_ARRAY('JavaScript','React','Git'), 'nice_to_have', JSON_ARRAY('REST APIs')),
 JSON_ARRAY(2,5),
 'https://example.com/apply/accenture-intern', TRUE),
('Globe Telecom', 'IT Infrastructure Intern', 'Bonifacio Global City', 'On-site', '3 months', 8000, 12000, '2026-04-05',
 'Assist in basic network monitoring, endpoint setup, and documentation. Ideal for IT infrastructure tracks.',
 JSON_OBJECT('skills', JSON_ARRAY('Networking','Linux','Troubleshooting')),
 JSON_ARRAY(1),
 'https://example.com/apply/globe-infra-intern', TRUE),
('UnionBank of the Philippines', 'Data Analytics Intern', 'Pasig City', 'Hybrid', '3 months', 9000, 13000, '2026-05-10',
 'Support reporting and dashboard work. Learn SQL and data storytelling with a real analytics team.',
 JSON_OBJECT('skills', JSON_ARRAY('SQL','Excel','Data Visualization'), 'nice_to_have', JSON_ARRAY('Python')),
 JSON_ARRAY(1,2),
 'https://example.com/apply/unionbank-analytics-intern', TRUE),
('Sprout Solutions', 'Full Stack Developer Intern', 'Remote', 'Remote', '6 months', 10000, 15000, '2026-05-01',
 'Work on real product features with mentorship. Good for web-focused students.',
 JSON_OBJECT('skills', JSON_ARRAY('React','Node.js','Git'), 'nice_to_have', JSON_ARRAY('MySQL')),
 JSON_ARRAY(2,6),
 'https://example.com/apply/sprout-fullstack-intern', TRUE);

-- Seed Job Listings
INSERT INTO job_listings
(company_name, role_title, location, work_type, employment_type, experience_level, program_id, career_id, description, requirements, required_subject_ids, apply_url, is_active, deadline)
VALUES
('Accenture Philippines', 'Junior Frontend Developer', 'Taguig, Metro Manila', 'Hybrid', 'Full-time', 'Entry-level', 1, 3,
 'Build UI features for enterprise apps. Strong fit if you like web + programming subjects.',
 JSON_OBJECT('skills', JSON_ARRAY('JavaScript','React','Git')),
 JSON_ARRAY(2,5,6),
 'https://example.com/jobs/accenture-jr-frontend', TRUE, '2026-04-25'),
('UnionBank of the Philippines', 'Data Analyst (Entry-level)', 'Pasig City', 'On-site', 'Full-time', 'Entry-level', 1, 2,
 'Assist with reporting and dashboards. Great start for analytics-minded students.',
 JSON_OBJECT('skills', JSON_ARRAY('SQL','Excel'), 'nice_to_have', JSON_ARRAY('Python')),
 JSON_ARRAY(1,2),
 'https://example.com/jobs/unionbank-data-analyst', TRUE, '2026-05-15'),
('Globe Telecom', 'IT Support Technician', 'Bonifacio Global City', 'On-site', 'Contract', 'Junior', 1, NULL,
 'Support internal systems and troubleshooting. Entry role for infrastructure-focused careers.',
 JSON_OBJECT('skills', JSON_ARRAY('Troubleshooting','Networking','Windows')),
 JSON_ARRAY(1),
 'https://example.com/jobs/globe-it-support', TRUE, '2026-04-01'),
('Sprout Solutions', 'Backend Developer (Junior)', 'Remote', 'Remote', 'Full-time', 'Junior', 1, 1,
 'Work on APIs and databases. Ideal if you’ve finished programming subjects and want to grow quickly.',
 JSON_OBJECT('skills', JSON_ARRAY('Node.js','MySQL','REST APIs','Git')),
 JSON_ARRAY(2,6),
 'https://example.com/jobs/sprout-backend-junior', TRUE, '2026-05-05');

-- Seed Development Resources
INSERT INTO development_resources
(type, title, provider, url, description, program_id, skill_ids, difficulty, cost_type, certificate_offered, is_active)
VALUES
('Certification', 'Google Data Analytics Professional Certificate', 'Coursera / Google',
 'https://example.com/resources/google-data-analytics',
 'A structured path to analytics fundamentals: spreadsheets, SQL, visualization, and storytelling.',
 1, JSON_ARRAY(4,2), 'Beginner', 'Freemium', TRUE, TRUE),
('Course', 'Modern React with TypeScript', 'Udemy',
 'https://example.com/resources/react-typescript',
 'Build production-grade React apps with components, hooks, state patterns, and TypeScript.',
 1, JSON_ARRAY(3,1,5), 'Intermediate', 'Paid', TRUE, TRUE),
('Roadmap', 'Backend Developer Roadmap', 'Community',
 'https://example.com/resources/backend-roadmap',
 'A step-by-step learning checklist for backend fundamentals: APIs, databases, auth, and deployment.',
 1, JSON_ARRAY(5,4,2), 'Beginner', 'Free', FALSE, TRUE),
('Course', 'Linux for IT Support', 'Linux Foundation',
 'https://example.com/resources/linux-it-support',
 'Practical Linux basics: CLI, permissions, processes, networking, and troubleshooting.',
 1, JSON_ARRAY(5), 'Beginner', 'Free', TRUE, TRUE);
