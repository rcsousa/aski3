export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  estimated_hours: number;
  is_published: boolean;
  created_at: string;
  sections?: Section[];
}

export interface Section {
  id: number;
  course_id: number;
  title: string;
  order_index: number;
  content: string;
  estimated_minutes: number;
  is_published: boolean;
  code_examples?: CodeExample[];
  quiz_questions?: QuizQuestion[];
}

export interface CodeExample {
  id: number;
  section_id: number;
  title: string;
  language: string;
  code: string;
  explanation: string;
  order_index: number;
}

export type QuestionType = 'multiple_choice' | 'true_false';

export interface QuizQuestion {
  id: number;
  section_id: number;
  question: string;
  question_type: QuestionType;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  order_index: number;
}

export interface UserProgress {
  id: number;
  user_id: number;
  section_id: number;
  completed: boolean;
  score: number | null;
  attempts: number;
  completed_at: string | null;
  section?: Section;
}

export interface QuizSubmission {
  answers: Record<number, string>;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  details: QuizAnswerDetail[];
}

export interface QuizAnswerDetail {
  question_id: number;
  correct: boolean;
  correct_answer: string;
  explanation: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
