export interface Word {
  id: string;
  word: string;
  clue: string;
  createdAt: string;
}

export interface CrosswordCell {
  x: number;
  y: number;
  letter: string;
  number?: number;
  isStart?: boolean;
}

export interface CrosswordWord {
  id: string;
  word: string;
  clue: string;
  direction: 'across' | 'down';
  startX: number;
  startY: number;
  number: number;
}

export interface CrosswordGrid {
  grid: (string | null)[][];
  words: CrosswordWord[];
  width: number;
  height: number;
}

