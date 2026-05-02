-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Profiles: users own their own row
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Segments: public read
CREATE POLICY "Segments are publicly readable"
  ON public.segments FOR SELECT
  USING (true);

-- Companies: public read
CREATE POLICY "Companies are publicly readable"
  ON public.companies FOR SELECT
  USING (true);

-- Positions: public read
CREATE POLICY "Positions are publicly readable"
  ON public.positions FOR SELECT
  USING (true);

-- Interview sessions: users own their sessions
CREATE POLICY "Users can view own sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Questions: accessible through session ownership
CREATE POLICY "Users can view questions for own sessions"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE id = questions.session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert questions for own sessions"
  ON public.questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Answers: accessible through session ownership
CREATE POLICY "Users can view answers for own sessions"
  ON public.answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE id = answers.session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert answers for own sessions"
  ON public.answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update answers for own sessions"
  ON public.answers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions
      WHERE id = answers.session_id AND user_id = auth.uid()
    )
  );
