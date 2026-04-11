-- Add/Update Careers with MySQL JSON format
INSERT INTO careers (career_id, title, icon, description, salary_min, salary_max, growth_rate, demand_level, job_examples) VALUES
(1, 'Software Engineer', '💻', 'Design, build, and maintain software systems', 30000, 80000, '+18%', 'Very High', '["Frontend Developer","Backend Developer","Full Stack Developer"]'),
(2, 'Data Analyst', '📊', 'Analyze data to help businesses make decisions', 25000, 60000, '+25%', 'High', '["Business Analyst","BI Analyst","Data Scientist"]'),
(3, 'Web Developer', '🌐', 'Create and maintain websites and web applications', 25000, 70000, '+15%', 'High', '["Frontend Developer","UI/UX Developer","React Developer"]'),
(4, 'Network Engineer', '🧤', 'Design and implement network configurations, troubleshoot problems, and maintain network infrastructure.', 30000, 75000, '+12%', 'High', '["Network Administrator","Systems Engineer","Network Architect"]'),
(5, 'Mobile Developer', '📱', 'Develop applications for mobile devices like smartphones and tablets, focusing on iOS or Android platforms.', 35000, 90000, '+22%', 'Very High', '["iOS Developer","Android Developer","React Native Developer"]')
ON DUPLICATE KEY UPDATE 
  title = VALUES(title), 
  icon = VALUES(icon),
  description = VALUES(description),
  salary_min = VALUES(salary_min),
  salary_max = VALUES(salary_max),
  growth_rate = VALUES(growth_rate),
  demand_level = VALUES(demand_level),
  job_examples = VALUES(job_examples);

-- Clear existing mappings
DELETE FROM career_subjects;

-- Move student subjects forward to MySQL (if any)
DELETE FROM student_subjects WHERE student_id = 1;
INSERT INTO student_subjects (student_id, subject_id, is_finished)
SELECT 1, subject_id, 1 FROM subjects WHERE subject_code IN ('IT 102', 'IT 105');

-- Map Subjects to Careers in MySQL
-- Career 1: Software Engineer
INSERT INTO career_subjects (career_id, subject_id, weight, is_required)
SELECT 1, subject_id, 15, 1 FROM subjects WHERE subject_code IN ('IT 102', 'IT 105', 'IT 207', 'IT 209', 'IT 211', 'IT 317', 'IT 318', 'IT 320');

-- Career 2: Data Analyst
INSERT INTO career_subjects (career_id, subject_id, weight, is_required)
SELECT 2, subject_id, 20, 1 FROM subjects WHERE subject_code IN ('IT 213', 'IT 210', 'MAT 111', 'IT 102', 'IT 105');

-- Career 3: Web Developer
INSERT INTO career_subjects (career_id, subject_id, weight, is_required)
SELECT 3, subject_id, 20, 1 FROM subjects WHERE subject_code IN ('IT 104', 'IT 315', 'IT 102', 'IT 105', 'IT 209');

-- Career 4: Network Engineer
INSERT INTO career_subjects (career_id, subject_id, weight, is_required)
SELECT 4, subject_id, 25, 1 FROM subjects WHERE subject_code IN ('IT 321', 'IT 429', 'IT 212', 'IT 322');

-- Career 5: Mobile Developer
INSERT INTO career_subjects (career_id, subject_id, weight, is_required)
SELECT 5, subject_id, 20, 1 FROM subjects WHERE subject_code IN ('IT 320', 'IT 207', 'IT 102', 'IT 105', 'IT 209', 'IT 211');
