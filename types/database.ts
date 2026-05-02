export type Level = "intern" | "junior" | "mid" | "senior" | "lead";
export type SessionStatus = "pending" | "in_progress" | "completed" | "abandoned";
export type QuestionType = "behavioral" | "technical" | "culture_fit" | "situational";
export type AnswerType = "text" | "audio" | "video";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Segment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  industry: string | null;
  segment_id: string | null;
  location: string | null;
  description: string | null;
  culture_notes: string | null;
  notable_facts: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  title: string;
  company_id: string | null;
  segment_id: string | null;
  level: Level;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  created_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  company_id: string;
  position_id: string;
  status: SessionStatus;
  overall_score: number | null;
  question_count: number;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  session_id: string;
  question_text: string;
  question_type: QuestionType;
  order_index: number;
  generated_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  session_id: string;
  answer_type: AnswerType;
  text_content: string | null;
  storage_path: string | null;
  score: number | null;
  feedback: string | null;
  strengths: string[] | null;
  improvements: string[] | null;
  evaluated_at: string | null;
  submitted_at: string;
}

export interface SessionWithDetails extends InterviewSession {
  company: Company;
  position: Position;
  questions?: QuestionWithAnswer[];
}

export interface QuestionWithAnswer extends Question {
  answer?: Answer;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      segments: { Row: Segment; Insert: Partial<Segment>; Update: Partial<Segment> };
      companies: { Row: Company; Insert: Partial<Company>; Update: Partial<Company> };
      positions: { Row: Position; Insert: Partial<Position>; Update: Partial<Position> };
      interview_sessions: { Row: InterviewSession; Insert: Partial<InterviewSession>; Update: Partial<InterviewSession> };
      questions: { Row: Question; Insert: Partial<Question>; Update: Partial<Question> };
      answers: { Row: Answer; Insert: Partial<Answer>; Update: Partial<Answer> };
    };
  };
}
