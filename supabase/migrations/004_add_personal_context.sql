ALTER TABLE public.interview_sessions
  ADD COLUMN IF NOT EXISTS personal_context text;
