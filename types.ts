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
  additionalInfo: string; 
  visualPrompt: string; 
  section?: string;
  sourceExam?: string; // e.g. "AP DSC SGT"
  sourceYear?: string; // e.g. "2018"
}

export interface QuizConfig {
  mode: 'practice' | 'exam';
  post: PostType;
  language: Language;
  subject: string;
  topic: string; 
  difficulty: Difficulty;
  questionCount: number;
  isPYQ: boolean; 
  timeLimit: number;
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