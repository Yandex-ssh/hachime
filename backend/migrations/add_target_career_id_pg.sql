-- Migration: Add target_career_id to students (Career Goals)
-- Run: psql -U user -d database -f add_target_career_id_pg.sql

ALTER TABLE students ADD COLUMN target_career_id INT NULL;
ALTER TABLE students ADD CONSTRAINT fk_students_target_career
  FOREIGN KEY (target_career_id) REFERENCES careers(career_id) ON DELETE SET NULL;
