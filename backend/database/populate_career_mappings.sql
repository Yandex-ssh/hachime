-- Add New Careers
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

-- Map Subjects to Careers
-- (Assuming subject_ids match the previous query results)

-- Career 1: Software Engineer
INSERT INTO career_subjects (career_id, subject_id, weight, is_required) VALUES
(1, 2, 10, true),   -- IT 102 (Programming 1)
(1, 15, 10, true),  -- IT 105 (Programming 2)
(1, 34, 15, true),  -- IT 207 (DSA)
(1, 36, 15, true),  -- IT 209 (OOP 1)
(1, 38, 15, true),  -- IT 211 (OOP 2)
(1, 47, 10, true),  -- IT 317 (C#)
(1, 48, 10, true),  -- IT 318 (VB.Net)
(1, 53, 15, true);  -- IT 320 (App Dev)

-- Career 2: Data Analyst
INSERT INTO career_subjects (career_id, subject_id, weight, is_required) VALUES
(2, 40, 20, true),  -- IT 213 (Database)
(2, 37, 15, true),  -- IT 210 (Discrete Math)
(2, 25, 15, true),  -- MAT 111 (Algebra)
(2, 2, 10, true),   -- IT 102 (Programming 1)
(2, 15, 10, true);  -- IT 105 (Programming 2)

-- Career 3: Web Developer
INSERT INTO career_subjects (career_id, subject_id, weight, is_required) VALUES
(3, 14, 20, true),  -- IT 104 (HTML)
(3, 45, 20, true),  -- IT 315 (Web Info Sys)
(3, 2, 10, true),   -- IT 102 (Programming 1)
(3, 15, 10, true),  -- IT 105 (Programming 2)
(3, 36, 15, true);  -- IT 209 (OOP 1)

-- Career 4: Network Engineer
INSERT INTO career_subjects (career_id, subject_id, weight, is_required) VALUES
(4, 54, 25, true),  -- IT 321 (Data Comm)
(4, 66, 25, true),  -- IT 429 (Adv Networking)
(4, 39, 15, true),  -- IT 212 (OS)
(4, 55, 15, true);  -- IT 322 (Sys Mgmt Admin)

-- Career 5: Mobile Developer
INSERT INTO career_subjects (career_id, subject_id, weight, is_required) VALUES
(5, 53, 25, true),  -- IT 320 (App Dev)
(5, 34, 15, true),  -- IT 207 (DSA)
(5, 2, 10, true),   -- IT 102 (Programming 1)
(5, 15, 10, true),  -- IT 105 (Programming 2)
(5, 36, 15, true),  -- IT 209 (OOP 1)
(5, 38, 15, true);  -- IT 211 (OOP 2)
