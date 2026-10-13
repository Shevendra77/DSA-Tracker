```sql
-- =====================================================
-- DSA TRACKER DATABASE - SQL NOTES
-- Database: dsa_tracker
-- Table: dsa_questions
-- =====================================================


-- 1. Show all databases
SHOW DATABASES;


-- 2. Select your DSA Tracker database
USE dsa_tracker;


-- 3. Show all tables in the database
SHOW TABLES;


-- 4. View the structure of the questions table
DESCRIBE dsa_questions;


-- 5. Display all questions
SELECT *
FROM dsa_questions
ORDER BY id;


-- 6. Display important question details
SELECT id, topic, title, difficulty, solved, last_solved_at
FROM dsa_questions
ORDER BY id;


-- 7. Count total questions
SELECT COUNT(*) AS total_questions
FROM dsa_questions;


-- 8. Count solved questions
-- solved = 1 means the question is solved
SELECT COUNT(*) AS solved_questions
FROM dsa_questions
WHERE solved = 1;


-- 9. Count pending questions
-- solved = 0 means the question is pending
SELECT COUNT(*) AS pending_questions
FROM dsa_questions
WHERE solved = 0;


-- 10. Complete progress summary
-- Shows total, solved, pending, and completion percentage
SELECT
    COUNT(*) AS total_questions,
    COALESCE(SUM(solved = 1), 0) AS solved_questions,
    COALESCE(SUM(solved = 0), 0) AS pending_questions,
    CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(SUM(solved = 1) * 100.0 / COUNT(*), 2)
    END AS completion_percentage
FROM dsa_questions;


-- 11. Topic-wise progress
-- Shows progress separately for each topic
SELECT
    topic,
    COUNT(*) AS total_questions,
    SUM(solved = 1) AS solved_questions,
    SUM(solved = 0) AS pending_questions,
    ROUND(SUM(solved = 1) * 100.0 / COUNT(*), 2)
        AS completion_percentage
FROM dsa_questions
GROUP BY topic
ORDER BY topic;


-- 12. Display only solved questions
SELECT id, topic, title, difficulty, last_solved_at
FROM dsa_questions
WHERE solved = 1
ORDER BY id;


-- 13. Display only pending questions
SELECT id, topic, title, difficulty
FROM dsa_questions
WHERE solved = 0
ORDER BY id;


-- 14. Search questions by title
-- Replace 'Array' with any keyword
SELECT *
FROM dsa_questions
WHERE title LIKE '%Array%';


-- 15. Display questions from one topic
-- Change 'Arrays' to another topic name as needed
SELECT *
FROM dsa_questions
WHERE topic = 'Arrays'
ORDER BY id;


-- 16. Filter questions by difficulty
-- Other possible values: Medium, Hard
SELECT *
FROM dsa_questions
WHERE difficulty = 'Easy'
ORDER BY id;


-- 17. View recently solved questions
SELECT id, title, topic, last_solved_at
FROM dsa_questions
WHERE solved = 1
ORDER BY last_solved_at DESC;


-- 18. Find solved questions with a missing timestamp
-- Ideally, this query should return zero rows
SELECT id, title, last_solved_at
FROM dsa_questions
WHERE solved = 1
  AND last_solved_at IS NULL;


-- 19. Find pending questions with a timestamp
-- Useful for checking inconsistent data
SELECT id, title, solved, last_solved_at
FROM dsa_questions
WHERE solved = 0
  AND last_solved_at IS NOT NULL;


-- 20. Check for duplicate question titles within a topic
-- Ideally, this query should return zero rows
SELECT topic, title, COUNT(*) AS duplicate_count
FROM dsa_questions
GROUP BY topic, title
HAVING COUNT(*) > 1;


-- 21. Find a question using its ID
-- Replace 3 with the required question ID
SELECT *
FROM dsa_questions
WHERE id = 3;


-- 22. Count questions in each difficulty level
SELECT difficulty, COUNT(*) AS total_questions
FROM dsa_questions
GROUP BY difficulty
ORDER BY difficulty;


-- 23. Count solved questions in each topic
SELECT topic, COUNT(*) AS solved_count
FROM dsa_questions
WHERE solved = 1
GROUP BY topic
ORDER BY topic;


-- 24. Count pending questions in each topic
SELECT topic, COUNT(*) AS pending_count
FROM dsa_questions
WHERE solved = 0
GROUP BY topic
ORDER BY topic;


-- 25. Check the currently selected database
SELECT DATABASE() AS current_database;


-- =====================================================
-- OPTIONAL DATA CHANGES
-- Use your application's checkbox when possible so that
-- Spring Boot also handles the solved timestamp.
-- The following statements are commented out for safety.
-- =====================================================


-- 26. Mark question ID 3 as solved
-- UPDATE dsa_questions
-- SET solved = 1, last_solved_at = NOW()
-- WHERE id = 3;


-- 27. Mark question ID 3 as pending
-- UPDATE dsa_questions
-- SET solved = 0, last_solved_at = NULL
-- WHERE id = 3;


-- =====================================================
-- IMPORTANT NOTES
-- solved = 1  -> Solved
-- solved = 0  -> Pending
-- NOW()       -> Current MySQL date and time
-- IS NULL     -> Checks whether a value is missing
-- COUNT(*)    -> Counts rows
-- GROUP BY    -> Groups records for summaries
-- =====================================================
```