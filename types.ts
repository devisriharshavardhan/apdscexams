export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum Language {
  English = 'English',
  Telugu = 'Telugu',
  Hindi = 'Hindi',
  Urdu = 'Urdu',
  Tamil = 'Tamil',
  Kannada = 'Kannada',
  Odiya = 'Odiya',
  Sanskrit = 'Sanskrit',
}

export enum PostType {
  SGT = 'Secondary Grade Teacher (SGT)',
  SA = 'School Assistant (SA)',
  TGT = 'Trained Graduate Teacher (TGT)',
  PGT = 'Post Graduate Teacher (PGT)',
  Principal = 'Principal',
  PET = 'Physical Education Teacher (PET)',
  SpecialEducationTeacher = 'Special Education Teacher',
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  additionalInfo: string; // Interesting fact or deeper context
  visualPrompt: string; // English prompt to generate an image
  section?: string; // The section/subject this question belongs to (e.g. GK, Psychology)
}

export interface QuizConfig {
  mode: 'practice' | 'exam';
  post: PostType;
  language: Language;
  subject: string; // In practice mode: selected subject. In exam mode: selected stream (if applicable)
  topic: string; 
  difficulty: Difficulty;
  questionCount: number;
  isPYQ: boolean; // Previous Year Question mode
  timeLimit: number; // Time limit in minutes
}

export interface QuizState {
  status: 'idle' | 'generating' | 'active' | 'completed' | 'error';
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, number>; 
  score: number;
  errorMessage?: string;
  timeLimit?: number;
  language?: Language;
}