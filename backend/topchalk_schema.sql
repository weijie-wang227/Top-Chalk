DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username varchar(255) NOT NULL UNIQUE,
  password varchar(255) NOT NULL,
  mode varchar(255) NOT NULL
);

DROP TABLE IF EXISTS categoriesdown CASCADE;
CREATE TABLE categoriesdown (
  id SERIAL PRIMARY KEY,
  name varchar(100) NOT NULL
);

DROP TABLE IF EXISTS categoriesup CASCADE;
CREATE TABLE categoriesup (
  id SERIAL PRIMARY KEY,
  name varchar(100) NOT NULL
);

DROP TABLE IF EXISTS downvotes CASCADE;
CREATE TABLE downvotes (
  id integer NOT NULL,
  downvote_id integer NOT NULL,
  count integer NOT NULL,
  CONSTRAINT unique_downVote UNIQUE (id, downvote_id),
  CONSTRAINT downvotes_ibfk_1 FOREIGN KEY (id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT downvotes_ibfk_2 FOREIGN KEY (downvote_id) REFERENCES subcategoriesdown (id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS faculties CASCADE;
CREATE TABLE faculties (
  id SERIAL PRIMARY KEY,
  name varchar(100) NOT NULL
);

DROP TABLE IF EXISTS sessions CASCADE;
CREATE TABLE sessions (
  session_id varchar(255) PRIMARY KEY,
  user_id integer NOT NULL,
  mode varchar(50) NOT NULL,
  expires_at timestamp NOT NULL,
  CONSTRAINT sessions_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id)
);

DROP TABLE IF EXISTS subcategoriesdown CASCADE;
CREATE TABLE subcategoriesdown (
  id SERIAL PRIMARY KEY,
  name varchar(100) NOT NULL,
  category_id integer NOT NULL,
  CONSTRAINT subcategoriesdown_ibfk_1 FOREIGN KEY (category_id) REFERENCES categoriesdown (id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS teachers CASCADE;
CREATE TABLE teachers (
  id integer NOT NULL,
  faculty_id integer NOT NULL,
  name varchar(255) NOT NULL,
  avatar_url varchar(255),
  CONSTRAINT teachers_ibfk_1 FOREIGN KEY (id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT teachers_ibfk_2 FOREIGN KEY (faculty_id) REFERENCES faculties (id) ON DELETE CASCADE
);



DROP TABLE IF EXISTS votes CASCADE;
CREATE TABLE votes (
  id integer NOT NULL,
  category_id integer NOT NULL,
  count integer NOT NULL,
  CONSTRAINT unique_vote UNIQUE (id, category_id),
  CONSTRAINT votes_ibfk_1 FOREIGN KEY (id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT votes_ibfk_2 FOREIGN KEY (category_id) REFERENCES categoriesup (id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS weeklytracker CASCADE;
CREATE TABLE weeklytracker (
  student_id integer NOT NULL,
  teacher_id integer NOT NULL,
  isUpvote boolean NOT NULL,
  CONSTRAINT student_id_unique UNIQUE (student_id, teacher_id, isUpvote),
  CONSTRAINT weeklytracker_ibfk_1 FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT weeklytracker_ibfk_2 FOREIGN KEY (teacher_id) REFERENCES users (id) ON DELETE CASCADE
);
