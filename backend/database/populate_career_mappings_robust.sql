-- Clear existing mappings to avoid duplicates
DELETE FROM career_subjects;

-- Add/Update Careers
INSERT INTO careers (career_id, title, icon, description, salary_min, salary_max, growth_rate, demand_level, job_examples) VALUES
(4, 'Network Engineer', '🧤', 'Design and implement network configurations, troubleshoot problems, and maintain network infrastructure.', 30000, 75000, '+12%', 'High', '{"Network Administrator","Systems Engineer","Network Architect"}'),
(5, 'Mobile Developer', '📱', 'Develop applications for mobile devices like smartphones and tablets, focusing on iOS or Android platforms.', 35000, 90000, '+22%', 'Very High', '{"iOS Developer","Android Developer","React Native Developer"}')
ON CONFLICT (career_id) DO UPDATE SET
  title = EXCLUDED.title,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  growth_rate = EXCLUDED.growth_rate,
  demand_level = EXCLUDED.demand_level,
  job_examples = EXCLUDED.job_examples;

-- Helper Function / Block to insert mappings by code
DO $$
BEGIN
    -- Career 1: Software Engineer
    INSERT INTO career_subjects (career_id, subject_id, weight, is_required)
    SELECT 1, subject_id, 15, true FROM subjects WHERE subject_code IN ('IT 102', 'IT 105', 'IT 207', 'IT 209', 'IT 211', 'IT 317', 'IT 318', 'IT 320');

    -- Career 2: Data Analyst
    INSERT INTO career_subjects (career_id, subject_id, weight, is_required)
    SELECT 2, subject_id, 20, true FROM subjects WHERE subject_code IN ('IT 213', 'IT 210', 'MAT 111', 'IT 102', 'IT 105');

    -- Career 3: Web Developer
    INSERT INTO career_subjects (career_id, subject_id, weight, is_required)
    SELECT 3, subject_id, 20, true FROM subjects WHERE subject_code IN ('IT 104', 'IT 315', 'IT 102', 'IT 105', 'IT 209');

    -- Career 4: Network Engineer
    INSERT INTO career_subjects (career_id, subject_id, weight, is_required)
    SELECT 4, subject_id, 25, true FROM subjects WHERE subject_code IN ('IT 321', 'IT 429', 'IT 212', 'IT 322');

    -- Career 5: Mobile Developer
    INSERT INTO career_subjects (career_id, subject_id, weight, is_required)
    SELECT 5, subject_id, 20, true FROM subjects WHERE subject_code IN ('IT 320', 'IT 207', 'IT 102', 'IT 105', 'IT 209', 'IT 211');
END $$;
