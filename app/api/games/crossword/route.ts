import { NextResponse } from 'next/server';
import { getWords } from '@/lib/games/crossword/storage';
import { generateCrossword } from '@/lib/games/crossword/generator';

export async function GET() {
  try {
    const words = await getWords();
    
    if (words.length === 0) {
      return NextResponse.json({ error: 'No words available. Please add words in the admin panel.' }, { status: 404 });
    }

    const crossword = generateCrossword(words);
    
    if (!crossword) {
      return NextResponse.json({ error: 'Failed to generate crossword' }, { status: 500 });
    }

    return NextResponse.json(crossword);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate crossword' }, { status: 500 });
  }
}

