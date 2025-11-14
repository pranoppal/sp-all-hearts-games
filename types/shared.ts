export interface GameSession {
  id: string;
  playerName: string;
  playerEmail?: string; // Optional for backward compatibility
  house?: string; // 'fire', 'water', 'earth', 'air'
  gameType: string; // 'crossword', 'sudoku', 'wordle', 'typing', etc.
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
  completed: boolean;
  correctAnswers: number;
  totalWords: number;
}

export interface House {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface PlayerAnswer {
  wordId: string;
  answer: string;
  correct: boolean;
}

