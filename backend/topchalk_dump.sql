-- users
INSERT INTO users (id, username, password, mode) VALUES
(1, 'admin123', '123', 'student'),
(2, 'Jaundice', '123', 'teacher'),
(3, 'Yam', '123', 'teacher'),
(4, 'Perk', '123', 'teacher'),
(5, 'Zwee', '123', 'teacher'),
(6, 'June', '123', 'teacher'),
(7, 'Tai', '123', 'teacher'),
(8, 'Grah', '123', 'teacher'),
(9, 'Shooby', '123', 'teacher'),
(10, 'Shazam', '123', 'teacher'),
(11, 'user', 'user', 'student'),
(12, 'student', 'Password', 'student'),
(13, 'student1', '1234', 'student'),
(14, 'student2', '1234', 'student'),
(15, 'student3', '1234', 'student'),
(16, 'student4', '123', 'student'),
(17, 'student5', '123', 'student'),
(18, 'student6', '123', 'student'),
(19, 'student7', '123', 'student'),
(20, 'student8', '123', 'student'),
(21, 'student9', '123', 'student'),
(22, 'student10', '123', 'student');


-- categoriesdown
INSERT INTO categoriesdown (id, name) VALUES
(1, 'Pace'),
(2, 'Delivery'),
(3, 'Content'),
(4, 'Engagement');

-- categoriesup
INSERT INTO categoriesup (id, name) VALUES
(1, 'Funniest'),
(2, 'Most Approachable'),
(3, 'Most Iconic');

-- downvotes
INSERT INTO downvotes (id, downvote_id, count) VALUES
(5, 10, 1),
(6, 6, 1),
(6, 7, 1),
(6, 9, 1),
(7, 9, 2),
(10, 1, 7),
(10, 4, 1),
(10, 5, 3),
(10, 6, 3),
(10, 8, 2),
(10, 9, 3),
(10, 10, 1);

-- faculties
INSERT INTO faculties (id, name) VALUES
(1, 'Medicine'),
(2, 'Business'),
(3, 'Nursing');

-- sessions
INSERT INTO sessions (session_id, user_id, mode, expires_at) VALUES
('1ddf1cd7-edb9-494d-972b-0c48ecd7102d', 1, 'student', '2025-06-22 15:32:04'),
('4950a719-97d6-4497-9838-ec37224f2a9e', 1, 'student', '2025-06-15 15:16:36'),
('929f5556-231a-4619-9f68-5178d578d6b7', 10, 'teacher', '2025-06-20 00:06:12'),
('c192325e-870f-4bdd-a3b2-fba7a730b723', 22, 'student', '2025-06-30 23:31:42'),
('c5693c98-38b8-423f-aaa3-e9b894d7484e', 1, 'student', '2025-06-23 15:47:58'),
('d047de1e-c695-48a5-bcaa-a4c5d1ebfac2', 1, 'student', '2025-06-16 21:39:11');

-- subcategoriesdown
INSERT INTO subcategoriesdown (id, name, category_id) VALUES
(1, 'Goes through slides too quickly', 1),
(2, 'Spends too much time on simple concepts', 1),
(3, 'Inconsistent pacing', 1),
(4, 'Hard to understand due to poor enunciation or mumbling', 2),
(5, 'Jumping between topics with no clear structure.', 2),
(6, 'Slides are cluttered or hard to read during lectures.', 2),
(7, 'Slides are outdated or missing key information.', 3),
(8, 'Too much irrelevant theory, not enough practical examples.', 3),
(9, 'Classes feel monotonous and boring.', 4),
(10, 'Purely reads from slides.', 4);

-- teachers
INSERT INTO teachers (id, faculty_id, name, avatar_url) VALUES
(2, 1, 'Jaundice', 'https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/2-63901d32-082d-4fe7-a7db-ec972023245b.jpeg'),
(3, 1, 'Yam', 'https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/3-3aeaac94-fc5d-4725-a738-7d664457b7ea.jpg'),
(4, 1, 'Perk', NULL),
(5, 2, 'Zwee', 'https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/5-a736ea69-8775-4c97-b6de-cd75fe3d271f.jpg'),
(6, 2, 'June', 'https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/6-4c421843-8b90-41fa-9661-dba48fce1aff.webp'),
(7, 2, 'Tai', NULL),
(8, 3, 'Grah', NULL),
(9, 3, 'Shooby', NULL),
(10, 3, 'Shazam', 'https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/10-ac80bea2-bc96-42e7-9942-230712154a0e.jpeg');

-- votes
INSERT INTO votes (id, category_id, count) VALUES
(2, 3, 1),
(3, 1, 1),
(4, 1, 1),
(4, 2, 3),
(5, 1, 1),
(6, 1, 7),
(6, 2, 1),
(6, 3, 1),
(7, 1, 1),
(7, 3, 1),
(8, 3, 1),
(9, 1, 1),
(10, 1, 9),
(10, 2, 2),
(10, 3, 2);

-- weeklytracker (convert tinyint to boolean)
INSERT INTO weeklytracker (student_id, teacher_id, isUpvote) VALUES
(17, 6, FALSE),
(17, 6, TRUE),
(13, 10, FALSE),
(13, 10, TRUE),
(14, 10, FALSE),
(14, 10, TRUE),
(15, 10, FALSE),
(15, 10, TRUE),
(19, 10, FALSE),
(19, 10, TRUE),
(20, 10, FALSE),
(20, 10, TRUE);
