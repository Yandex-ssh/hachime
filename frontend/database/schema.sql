-- TMC CAREER PATHWAY VISUALIZATION TOOL - DATABASE SCHEMA (PostgreSQL)

-- Drop existing tables (for fresh install)
DROP TABLE IF EXISTS student_saved_internships CASCADE;
DROP TABLE IF EXISTS career_skills CASCADE;
DROP TABLE IF EXISTS career_subjects CASCADE;
DROP TABLE IF EXISTS student_subjects CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS alumni CASCADE;
DROP TABLE IF EXISTS industry_trends CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS careers CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS programs CASCADE;

-- 1. PROGRAMS TABLE
CREATE TABLE programs (
    program_id SERIAL PRIMARY KEY,
    program_code VARCHAR(20) UNIQUE NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    description TEXT,
    total_years INT DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENTS TABLE
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    program_id INT REFERENCES programs(program_id) ON DELETE SET NULL,
    year_level INT CHECK (year_level BETWEEN 1 AND 4),
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_students_student_number ON students(student_number);

-- 3. SUBJECTS TABLE
CREATE TABLE subjects (
    subject_id SERIAL PRIMARY KEY,
    subject_code VARCHAR(20),
    subject_name VARCHAR(255) NOT NULL,
    program_id INT REFERENCES programs(program_id) ON DELETE CASCADE,
    year_level INT CHECK (year_level BETWEEN 1 AND 4),
    semester INT CHECK (semester IN (1, 2)),
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_program_year ON subjects(program_id, year_level);

-- 4. STUDENT_SUBJECTS TABLE
CREATE TABLE student_subjects (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(subject_id) ON DELETE CASCADE,
    is_finished BOOLEAN DEFAULT FALSE,
    is_liked BOOLEAN DEFAULT FALSE,
    self_rating VARCHAR(20) CHECK (self_rating IN ('Beginner', 'Intermediate', 'Advanced')),
    completed_at TIMESTAMP,
    UNIQUE(student_id, subject_id)
);

CREATE INDEX idx_student_subjects_student ON student_subjects(student_id);

-- 5. CAREERS TABLE
CREATE TABLE careers (
    career_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    growth_rate VARCHAR(10),
    demand_level VARCHAR(20) CHECK (demand_level IN ('Low', 'Medium', 'High', 'Very High')),
    job_examples TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. CAREER_SUBJECTS TABLE
CREATE TABLE career_subjects (
    id SERIAL PRIMARY KEY,
    career_id INT REFERENCES careers(career_id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(subject_id) ON DELETE CASCADE,
    weight INT DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    UNIQUE(career_id, subject_id)
);

CREATE INDEX idx_career_subjects_career ON career_subjects(career_id);
CREATE INDEX idx_career_subjects_subject ON career_subjects(subject_id);

-- 7. SKILLS TABLE
CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    learning_resource_url TEXT
);

-- 8. CAREER_SKILLS TABLE
CREATE TABLE career_skills (
    id SERIAL PRIMARY KEY,
    career_id INT REFERENCES careers(career_id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(skill_id) ON DELETE CASCADE,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
    UNIQUE(career_id, skill_id)
);

-- 9. INTERNSHIPS TABLE
CREATE TABLE internships (
    internship_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    work_type VARCHAR(20) CHECK (work_type IN ('On-site', 'Hybrid', 'Remote')),
    duration VARCHAR(50),
    stipend_min DECIMAL(10, 2),
    stipend_max DECIMAL(10, 2),
    deadline DATE,
    description TEXT,
    requirements TEXT[],
    company_logo_url TEXT,
    apply_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_internships_active ON internships(is_active, deadline);

-- 10. STUDENT_SAVED_INTERNSHIPS TABLE
CREATE TABLE student_saved_internships (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    internship_id INT REFERENCES internships(internship_id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, internship_id)
);

CREATE TABLE alumni (
    alumni_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    program_id INT,
    batch_year INT,
    current_job_title VARCHAR(255),
    current_company VARCHAR(255),
    location VARCHAR(255),
    salary_range VARCHAR(50),
    months_to_land_job INT,
    favorite_subjects TEXT[],
    skills_used TEXT[],
    advice TEXT,
    linkedin_url TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alumni_program_id
        FOREIGN KEY (program_id)
        REFERENCES programs(program_id)
        ON DELETE SET NULL
);


-- 12. INDUSTRY_TRENDS TABLE
CREATE TABLE industry_trends (
    trend_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(10),
    growth_rate VARCHAR(10),
    demand_level VARCHAR(20),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    description TEXT,
    top_roles TEXT[],
    top_skills TEXT[],
    top_companies TEXT[],
    insight TEXT,
    year INT DEFAULT (date_part('year', CURRENT_DATE))::INT,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data Inserts
INSERT INTO programs (program_code, program_name, description) VALUES
('BSIT', 'Bachelor of Science in Information Technology', 'Focuses on software development, networking, and IT infrastructure'),
('BSCRIM', 'Bachelor of Science in Criminology', 'Study of crime, criminal behavior, and law enforcement'),
('BSED', 'Bachelor of Science in Education', 'Preparation for teaching careers'),
('BSOA', 'Bachelor of Science in Office Administration', 'Business and office management'),
('BSPOL.SCI', 'Bachelor of Science in Political Science', 'Study of government and political systems');

INSERT INTO subjects (subject_code, subject_name, program_id, year_level, semester, category) VALUES
('IT 101', 'Computer Concepts and Fundamentals', 1, 1, 1, 'Core'),
('IT 102', 'Computer Programming 1', 1, 1, 1, 'Programming'),
('IT 103', 'Application and Productivity Tools', 1, 1, 1, 'Tools'),
('GE 1', 'Purposive Communication', 1, 1, 1, 'General Education'),
('IT 104', 'HTML and Internet Fundamentals', 1, 1, 2, 'Web'),
('IT 105', 'Computer Programming 2', 1, 1, 2, 'Programming'),
('IT 106', 'Human-Computer Interaction', 1, 1, 2, 'Design'),
('GE 2', 'Understanding the Self', 1, 1, 2, 'General Education');

INSERT INTO students (student_number, name, program_id, year_level, password_hash) VALUES
('2024-00123', 'Juan Dela Cruz', 1, 2, '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FRh.Jb0t3GBTEuPELmNpb3fK5qJz/6u');

INSERT INTO careers (title, icon, description, salary_min, salary_max, growth_rate, demand_level, job_examples) VALUES
('Software Engineer', '💻', 'Design, build, and maintain software systems', 30000, 80000, '+18%', 'Very High', ARRAY['Frontend Developer', 'Backend Developer', 'Full Stack Developer']),
('Data Analyst', '📊', 'Analyze data to help businesses make decisions', 25000, 60000, '+25%', 'High', ARRAY['Business Analyst', 'BI Analyst', 'Data Scientist']),
('Web Developer', '🌐', 'Create and maintain websites and web applications', 25000, 70000, '+15%', 'High', ARRAY['Frontend Developer', 'UI/UX Developer', 'React Developer']);

INSERT INTO skills (skill_name, category, learning_resource_url) VALUES
('JavaScript', 'Programming', 'https://javascript.info'),
('Python', 'Programming', 'https://python.org'),
('React', 'Web Development', 'https://react.dev'),
('SQL', 'Data & Analytics', 'https://sqlzoo.net'),
('Git & GitHub', 'Tools & Soft Skills', 'https://github.com');

INSERT INTO career_skills (career_id, skill_id, priority) VALUES
(1, 1, 'high'),
(1, 3, 'high'),
(1, 5, 'high'),
(2, 2, 'high'),
(2, 4, 'high'),
(3, 1, 'high'),
(3, 3, 'high');