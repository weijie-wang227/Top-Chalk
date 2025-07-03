--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categoriesdown; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoriesdown (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.categoriesdown OWNER TO postgres;

--
-- Name: categoriesdown_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categoriesdown_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoriesdown_id_seq OWNER TO postgres;

--
-- Name: categoriesdown_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categoriesdown_id_seq OWNED BY public.categoriesdown.id;


--
-- Name: categoriesup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoriesup (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.categoriesup OWNER TO postgres;

--
-- Name: categoriesup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categoriesup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoriesup_id_seq OWNER TO postgres;

--
-- Name: categoriesup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categoriesup_id_seq OWNED BY public.categoriesup.id;


--
-- Name: downvotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.downvotes (
    id integer NOT NULL,
    downvote_id integer NOT NULL,
    count integer NOT NULL
);


ALTER TABLE public.downvotes OWNER TO postgres;

--
-- Name: faculties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculties (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.faculties OWNER TO postgres;

--
-- Name: faculties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faculties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faculties_id_seq OWNER TO postgres;

--
-- Name: faculties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faculties_id_seq OWNED BY public.faculties.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    session_id character varying(255) NOT NULL,
    user_id integer NOT NULL,
    mode character varying(50) NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: subcategoriesdown; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subcategoriesdown (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE public.subcategoriesdown OWNER TO postgres;

--
-- Name: subcategoriesdown_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subcategoriesdown_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subcategoriesdown_id_seq OWNER TO postgres;

--
-- Name: subcategoriesdown_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subcategoriesdown_id_seq OWNED BY public.subcategoriesdown.id;


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers (
    id integer NOT NULL,
    faculty_id integer NOT NULL,
    name character varying(255) NOT NULL,
    avatar_url character varying(255)
);


ALTER TABLE public.teachers OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    mode character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.votes (
    id integer NOT NULL,
    category_id integer NOT NULL,
    count integer NOT NULL
);


ALTER TABLE public.votes OWNER TO postgres;

--
-- Name: weeklytracker; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weeklytracker (
    student_id integer NOT NULL,
    teacher_id integer NOT NULL,
    isupvote boolean NOT NULL
);


ALTER TABLE public.weeklytracker OWNER TO postgres;

--
-- Name: categoriesdown id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoriesdown ALTER COLUMN id SET DEFAULT nextval('public.categoriesdown_id_seq'::regclass);


--
-- Name: categoriesup id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoriesup ALTER COLUMN id SET DEFAULT nextval('public.categoriesup_id_seq'::regclass);


--
-- Name: faculties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties ALTER COLUMN id SET DEFAULT nextval('public.faculties_id_seq'::regclass);


--
-- Name: subcategoriesdown id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategoriesdown ALTER COLUMN id SET DEFAULT nextval('public.subcategoriesdown_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: categoriesdown; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoriesdown (id, name) FROM stdin;
1	Pace
2	Delivery
3	Content
4	Engagement
\.


--
-- Data for Name: categoriesup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoriesup (id, name) FROM stdin;
1	Funniest
2	Most Approachable
3	Most Iconic
\.


--
-- Data for Name: downvotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.downvotes (id, downvote_id, count) FROM stdin;
5	10	1
6	6	1
6	7	1
6	9	1
7	9	2
10	1	7
10	4	1
10	5	3
10	6	3
10	8	2
10	9	3
10	10	1
2	2	1
\.


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculties (id, name) FROM stdin;
1	Medicine
2	Business
3	Nursing
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (session_id, user_id, mode, expires_at) FROM stdin;
1ddf1cd7-edb9-494d-972b-0c48ecd7102d	1	student	2025-06-22 15:32:04
4950a719-97d6-4497-9838-ec37224f2a9e	1	student	2025-06-15 15:16:36
929f5556-231a-4619-9f68-5178d578d6b7	10	teacher	2025-06-20 00:06:12
c192325e-870f-4bdd-a3b2-fba7a730b723	22	student	2025-06-30 23:31:42
c5693c98-38b8-423f-aaa3-e9b894d7484e	1	student	2025-06-23 15:47:58
d047de1e-c695-48a5-bcaa-a4c5d1ebfac2	1	student	2025-06-16 21:39:11
b23c081f-c547-4848-9ee1-cd441f251140	23	student	2025-07-04 21:52:18.84874
\.


--
-- Data for Name: subcategoriesdown; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subcategoriesdown (id, name, category_id) FROM stdin;
1	Goes through slides too quickly	1
2	Spends too much time on simple concepts	1
3	Inconsistent pacing	1
4	Hard to understand due to poor enunciation or mumbling	2
5	Jumping between topics with no clear structure.	2
6	Slides are cluttered or hard to read during lectures.	2
7	Slides are outdated or missing key information.	3
8	Too much irrelevant theory, not enough practical examples.	3
9	Classes feel monotonous and boring.	4
10	Purely reads from slides.	4
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teachers (id, faculty_id, name, avatar_url) FROM stdin;
2	1	Jaundice	https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/2-63901d32-082d-4fe7-a7db-ec972023245b.jpeg
3	1	Yam	https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/3-3aeaac94-fc5d-4725-a738-7d664457b7ea.jpg
4	1	Perk	\N
5	2	Zwee	https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/5-a736ea69-8775-4c97-b6de-cd75fe3d271f.jpg
6	2	June	https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/6-4c421843-8b90-41fa-9661-dba48fce1aff.webp
7	2	Tai	\N
8	3	Grah	\N
9	3	Shooby	\N
10	3	Shazam	https://pub-760701a0839c4a9ebce469a6b5cbd2c6.r2.dev/avatars/10-b36bff28-2e30-4792-930e-9d86d8d23bd6.jpeg
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, mode) FROM stdin;
1	admin123	123	student
2	Jaundice	123	teacher
3	Yam	123	teacher
4	Perk	123	teacher
5	Zwee	123	teacher
6	June	123	teacher
7	Tai	123	teacher
8	Grah	123	teacher
9	Shooby	123	teacher
10	Shazam	123	teacher
11	user	user	student
12	student	Password	student
13	student1	1234	student
14	student2	1234	student
15	student3	1234	student
16	student4	123	student
17	student5	123	student
18	student6	123	student
19	student7	123	student
20	student8	123	student
21	student9	123	student
22	student10	123	student
23	student30	123	student
\.


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.votes (id, category_id, count) FROM stdin;
2	3	1
3	1	1
4	1	1
4	2	3
5	1	1
6	1	7
6	2	1
6	3	1
7	1	1
7	3	1
8	3	1
9	1	1
10	1	9
10	2	2
10	3	2
2	1	1
\.


--
-- Data for Name: weeklytracker; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weeklytracker (student_id, teacher_id, isupvote) FROM stdin;
17	6	f
17	6	t
13	10	f
13	10	t
14	10	f
14	10	t
15	10	f
15	10	t
19	10	f
19	10	t
20	10	f
20	10	t
23	2	t
23	2	f
\.


--
-- Name: categoriesdown_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categoriesdown_id_seq', 1, false);


--
-- Name: categoriesup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categoriesup_id_seq', 1, false);


--
-- Name: faculties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faculties_id_seq', 1, false);


--
-- Name: subcategoriesdown_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subcategoriesdown_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 23, true);


--
-- Name: categoriesdown categoriesdown_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoriesdown
    ADD CONSTRAINT categoriesdown_pkey PRIMARY KEY (id);


--
-- Name: categoriesup categoriesup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoriesup
    ADD CONSTRAINT categoriesup_pkey PRIMARY KEY (id);


--
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (session_id);


--
-- Name: weeklytracker student_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklytracker
    ADD CONSTRAINT student_id_unique UNIQUE (student_id, teacher_id, isupvote);


--
-- Name: subcategoriesdown subcategoriesdown_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategoriesdown
    ADD CONSTRAINT subcategoriesdown_pkey PRIMARY KEY (id);


--
-- Name: downvotes unique_downvote; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.downvotes
    ADD CONSTRAINT unique_downvote UNIQUE (id, downvote_id);


--
-- Name: votes unique_vote; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT unique_vote UNIQUE (id, category_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: downvotes downvotes_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.downvotes
    ADD CONSTRAINT downvotes_ibfk_1 FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_ibfk_1 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: subcategoriesdown subcategoriesdown_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategoriesdown
    ADD CONSTRAINT subcategoriesdown_ibfk_1 FOREIGN KEY (category_id) REFERENCES public.categoriesdown(id) ON DELETE CASCADE;


--
-- Name: teachers teachers_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_ibfk_1 FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teachers teachers_ibfk_2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_ibfk_2 FOREIGN KEY (faculty_id) REFERENCES public.faculties(id) ON DELETE CASCADE;


--
-- Name: votes votes_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_ibfk_1 FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: votes votes_ibfk_2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_ibfk_2 FOREIGN KEY (category_id) REFERENCES public.categoriesup(id) ON DELETE CASCADE;


--
-- Name: weeklytracker weeklytracker_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklytracker
    ADD CONSTRAINT weeklytracker_ibfk_1 FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: weeklytracker weeklytracker_ibfk_2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weeklytracker
    ADD CONSTRAINT weeklytracker_ibfk_2 FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

