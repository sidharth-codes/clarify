export type DifficultyLevel = 
  | '5-Year-Old/ELI5' 
  | 'High School' 
  | 'Undergraduate' 
  | 'Domain Expert';

export type ToneStyle = 
  | 'Analogy-Heavy' 
  | 'Plain & Direct' 
  | 'Humorous & Casual';

export interface ExplanationOptions {
  text: string;
  difficulty: DifficultyLevel;
  tone: ToneStyle;
  customFocus?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResponse {
  quiz: QuizQuestion[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

export interface FlashcardsResponse {
  flashcards: Flashcard[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SampleConcept {
  id: string;
  title: string;
  category: string;
  text: string;
  difficulty: DifficultyLevel;
  tone: ToneStyle;
  iconName: string;
}
