-- Simplified BSIT Curriculum (Major Subjects Only)
-- Removed: General Education, PE, NSTP, Student Development, and basic Math/Science/Management.

-- Clear existing BSIT subjects to avoid duplicates
DELETE FROM subjects WHERE program_id = 1;

-- 1st Year - 1st Semester
INSERT INTO subjects (subject_code, subject_name, program_id, year_level, semester, category) VALUES
('IT 101', 'Computer Concepts and Fundamentals', 1, 1, 1, 'Core'),
('IT 102', 'Computer Programming 1', 1, 1, 1, 'Programming'),
('IT 103', 'Application and Productivity Tools', 1, 1, 1, 'Core');

-- 1st Year - 2nd Semester
INSERT INTO subjects (subject_code, subject_name, program_id, year_level, semester, category) VALUES
('IT 104', 'HTML and Internet Fundamentals', 1, 1, 2, 'Web'),
('IT 105', 'Computer Programming 2', 1, 1, 2, 'Programming'),
('IT 106', 'Human-Computer Interaction', 1, 1, 2, 'Core');

-- 2nd Year - 1st Semester
INSERT INTO subjects (subject_code, subject_name, program_id, year_level, semester, category) VALUES
('IT 207', 'Data Structures and Algorithms', 1, 2, 1, 'Programming'),
('IT 208', 'Prof. Ethics in IT w/ Quality Consciousness & Habits', 1, 2, 1, 'Core'),
('IT 209', 'Object-Oriendted Programming 1', 1, 2, 1, 'Programming'),
('IT 210', 'Discrete Maths', 1, 2, 1, 'Math');

-- 2nd Year - 2nd Semester
INSERT INTO subjects (subject_code, subject_name, program_id, year_level, semester, category) VALUES
('IT 211', 'Object-Oriented Programming 2', 1, 2, 2, 'Programming'),
('IT 212', 'Operating System', 1, 2, 2, 'Core'),
('IT 213', 'Database System', 1, 2, 2, 'Database'),
('IT 214', 'System Analysis and Design', 1, 2, 2, 'Core');

-- 3rd Year - 1st Semester
INSERT INTO subjects (subject_code, subject_name, program_id, year_level, semester, category) VALUES
('IT 315', 'Web Information System', 1, 3, 1, 'Web'),
('IT 316', 'ICT Trends', 1, 3, 1, 'Core'),
('IT 317', 'C#.Net Programming', 1, 3, 1, 'Programming'),
('IT 318', 'VB.Net Programming', 1, 3, 1, 'Programming'),
('IT 319', 'Project Management for IT', 1, 3, 1, 'Core'),
('IT Elect 1', 'IT Elective 1', 1, 3, 1, 'Core');

-- 3rd Year - 2nd Semester
INSERT INTO subjects (subject_code, subject_name, program_id, year_level, semester, category) VALUES
('IT 320', 'Applications Development and Emerging Technologies', 1, 3, 2, 'Programming'),
('IT 321', 'Data Communication and Networking', 1, 3, 2, 'Networking'),
('IT 322', 'System Management Administrations', 1, 3, 2, 'Core'),
('IT 323', 'Multimedia Concept', 1, 3, 2, 'Core'),
('IT Elect 2', 'IT Elective 2', 1, 3, 2, 'Core'),
('Free Elect 1', 'Free Elective 1', 1, 3, 2, 'Core'),
('Research 1', 'Methodology', 1, 3, 2, 'Core');

-- 4th Year - 1st Semester
INSERT INTO subjects (subject_code, subject_name, program_id, year_level, semester, category) VALUES
('IT 425', 'Computer Graphics Design', 1, 4, 1, 'Core'),
('IT 426', 'Video Editing', 1, 4, 1, 'Core'),
('IT 427', 'Practicum 1', 1, 4, 1, 'Core'),
('IT 428', 'Capstone Project 1', 1, 4, 1, 'Core'),
('IT Elect 3', 'IT Elective 3', 1, 4, 1, 'Core'),
('Free Elect 2', 'Free Elective 2', 1, 4, 1, 'Core');

-- 4th Year - 2nd Semester
INSERT INTO subjects (subject_code, subject_name, program_id, year_level, semester, category) VALUES
('IT 429', 'Advanced Networking', 1, 4, 2, 'Networking'),
('IT 430', 'Capstone Project 2', 1, 4, 2, 'Core'),
('IT 431', 'Practicum 2', 1, 4, 2, 'Core'),
('IT Elect 4', 'IT Elective 4', 1, 4, 2, 'Core'),
('Free Elect 3', 'Free Elective 3', 1, 4, 2, 'Core');