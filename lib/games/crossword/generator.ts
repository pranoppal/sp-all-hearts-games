import { Word, CrosswordGrid, CrosswordWord } from '@/types';

interface PlacedWord {
  word: string;
  clue: string;
  id: string;
  direction: 'across' | 'down';
  startX: number;
  startY: number;
  number: number;
}

export function generateCrossword(words: Word[]): CrosswordGrid | null {
  if (words.length === 0) return null;

  // Sort words by length (longest first) for better placement
  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);
  
  const gridSize = 20; // 20x20 grid
  const grid: (string | null)[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));
  
  const placedWords: PlacedWord[] = [];
  let wordNumber = 1;

  // Place first word horizontally in the middle
  const firstWord = sortedWords[0];
  const startX = Math.floor((gridSize - firstWord.word.length) / 2);
  const startY = Math.floor(gridSize / 2);
  
  for (let i = 0; i < firstWord.word.length; i++) {
    grid[startY][startX + i] = firstWord.word[i].toUpperCase();
  }
  
  placedWords.push({
    word: firstWord.word.toUpperCase(),
    clue: firstWord.clue,
    id: firstWord.id,
    direction: 'across',
    startX,
    startY,
    number: wordNumber++,
  });

  // Try to place remaining words
  for (let i = 1; i < sortedWords.length; i++) {
    const word = sortedWords[i];
    let placed = false;

    // Try to intersect with existing words
    for (const placedWord of placedWords) {
      if (placed) break;

      // Try to find common letters
      for (let j = 0; j < word.word.length; j++) {
        if (placed) break;

        for (let k = 0; k < placedWord.word.length; k++) {
          if (word.word[j].toUpperCase() === placedWord.word[k].toUpperCase()) {
            // Found a common letter, try to place perpendicular
            const direction = placedWord.direction === 'across' ? 'down' : 'across';
            
            let newStartX: number, newStartY: number;
            
            if (direction === 'down') {
              newStartX = placedWord.startX + k;
              newStartY = placedWord.startY - j;
            } else {
              newStartX = placedWord.startX - j;
              newStartY = placedWord.startY + k;
            }

            // Check if placement is valid
            if (canPlaceWord(grid, word.word.toUpperCase(), newStartX, newStartY, direction, gridSize)) {
              // Place the word
              placeWord(grid, word.word.toUpperCase(), newStartX, newStartY, direction);
              
              placedWords.push({
                word: word.word.toUpperCase(),
                clue: word.clue,
                id: word.id,
                direction,
                startX: newStartX,
                startY: newStartY,
                number: wordNumber++,
              });
              
              placed = true;
              break;
            }
          }
        }
      }
    }
  }

  // Trim the grid to fit placed words
  const trimmed = trimGrid(grid, placedWords);
  
  return {
    grid: trimmed.grid,
    words: placedWords.map(pw => ({
      id: pw.id,
      word: pw.word,
      clue: pw.clue,
      direction: pw.direction,
      startX: pw.startX - trimmed.offsetX,
      startY: pw.startY - trimmed.offsetY,
      number: pw.number,
    })),
    width: trimmed.width,
    height: trimmed.height,
  };
}

function canPlaceWord(
  grid: (string | null)[][],
  word: string,
  startX: number,
  startY: number,
  direction: 'across' | 'down',
  gridSize: number
): boolean {
  if (direction === 'across') {
    if (startX < 0 || startY < 0 || startY >= gridSize || startX + word.length > gridSize) {
      return false;
    }

    // Check if there's space before and after
    if (startX > 0 && grid[startY][startX - 1] !== null) return false;
    if (startX + word.length < gridSize && grid[startY][startX + word.length] !== null) return false;

    for (let i = 0; i < word.length; i++) {
      const cell = grid[startY][startX + i];
      if (cell !== null && cell !== word[i]) {
        return false;
      }
      
      // Check cells above and below (except at intersections)
      if (cell === null) {
        if (startY > 0 && grid[startY - 1][startX + i] !== null) return false;
        if (startY < gridSize - 1 && grid[startY + 1][startX + i] !== null) return false;
      }
    }
  } else {
    if (startX < 0 || startY < 0 || startX >= gridSize || startY + word.length > gridSize) {
      return false;
    }

    // Check if there's space before and after
    if (startY > 0 && grid[startY - 1][startX] !== null) return false;
    if (startY + word.length < gridSize && grid[startY + word.length][startX] !== null) return false;

    for (let i = 0; i < word.length; i++) {
      const cell = grid[startY + i][startX];
      if (cell !== null && cell !== word[i]) {
        return false;
      }
      
      // Check cells left and right (except at intersections)
      if (cell === null) {
        if (startX > 0 && grid[startY + i][startX - 1] !== null) return false;
        if (startX < gridSize - 1 && grid[startY + i][startX + 1] !== null) return false;
      }
    }
  }

  return true;
}

function placeWord(
  grid: (string | null)[][],
  word: string,
  startX: number,
  startY: number,
  direction: 'across' | 'down'
): void {
  if (direction === 'across') {
    for (let i = 0; i < word.length; i++) {
      grid[startY][startX + i] = word[i];
    }
  } else {
    for (let i = 0; i < word.length; i++) {
      grid[startY + i][startX] = word[i];
    }
  }
}

function trimGrid(
  grid: (string | null)[][],
  placedWords: PlacedWord[]
): {
  grid: (string | null)[][];
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
} {
  let minX = grid[0].length;
  let maxX = 0;
  let minY = grid.length;
  let maxY = 0;

  // Find bounds
  for (const word of placedWords) {
    minX = Math.min(minX, word.startX);
    minY = Math.min(minY, word.startY);
    
    if (word.direction === 'across') {
      maxX = Math.max(maxX, word.startX + word.word.length - 1);
      maxY = Math.max(maxY, word.startY);
    } else {
      maxX = Math.max(maxX, word.startX);
      maxY = Math.max(maxY, word.startY + word.word.length - 1);
    }
  }

  // Add padding
  minX = Math.max(0, minX - 1);
  minY = Math.max(0, minY - 1);
  maxX = Math.min(grid[0].length - 1, maxX + 1);
  maxY = Math.min(grid.length - 1, maxY + 1);

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  const trimmedGrid: (string | null)[][] = [];
  for (let y = minY; y <= maxY; y++) {
    const row: (string | null)[] = [];
    for (let x = minX; x <= maxX; x++) {
      row.push(grid[y][x]);
    }
    trimmedGrid.push(row);
  }

  return {
    grid: trimmedGrid,
    width,
    height,
    offsetX: minX,
    offsetY: minY,
  };
}

