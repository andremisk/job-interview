-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Segments (industry categories)
CREATE TABLE public.segments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  slug        text NOT NULL UNIQUE,
  description text,
  created_at  timestamptz DEFAULT now()
);

-- Companies
CREATE TABLE public.companies (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  slug           text NOT NULL UNIQUE,
  website        text,
  industry       text,
  segment_id     uuid REFERENCES public.segments(id),
  location       text,
  description    text,
  culture_notes  text,
  notable_facts  text,
  logo_url       text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- Positions
CREATE TABLE public.positions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  company_id       uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  segment_id       uuid REFERENCES public.segments(id),
  level            text NOT NULL CHECK (level IN ('intern','junior','mid','senior','lead')),
  description      text,
  responsibilities text,
  requirements     text,
  created_at       timestamptz DEFAULT now()
);

-- Interview sessions
CREATE TABLE public.interview_sessions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id     uuid NOT NULL REFERENCES public.companies(id),
  position_id    uuid NOT NULL REFERENCES public.positions(id),
  status         text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','abandoned')),
  overall_score  numeric(5,2),
  question_count int NOT NULL DEFAULT 5,
  started_at     timestamptz,
  completed_at   timestamptz,
  notes          text,
  created_at     timestamptz DEFAULT now()
);

-- Questions
CREATE TABLE public.questions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     uuid NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question_text  text NOT NULL,
  question_type  text NOT NULL CHECK (question_type IN ('behavioral','technical','culture_fit','situational')),
  order_index    int NOT NULL,
  generated_at   timestamptz DEFAULT now()
);

-- Answers
CREATE TABLE public.answers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  session_id    uuid NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  answer_type   text NOT NULL CHECK (answer_type IN ('text','audio','video')),
  text_content  text,
  storage_path  text,
  score         numeric(5,2),
  feedback      text,
  strengths     text[],
  improvements  text[],
  evaluated_at  timestamptz,
  submitted_at  timestamptz DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Indexes for common queries
CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_questions_session_id ON public.questions(session_id);
CREATE INDEX idx_answers_session_id ON public.answers(session_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);
CREATE INDEX idx_companies_segment_id ON public.companies(segment_id);
CREATE INDEX idx_positions_company_id ON public.positions(company_id);
