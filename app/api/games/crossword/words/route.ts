import { NextRequest, NextResponse } from 'next/server';
import { getWords, addWord, deleteWord } from '@/lib/games/crossword/storage';
import { Word } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Force dynamic rendering - don't cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const words = await getWords();
    return NextResponse.json(words);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, clue } = body;

    if (!word || !clue) {
      return NextResponse.json({ error: 'Word and clue are required' }, { status: 400 });
    }

    const newWord: Word = {
      id: uuidv4(),
      word: word.toLowerCase(),
      clue,
      createdAt: new Date().toISOString(),
    };

    await addWord(newWord);
    return NextResponse.json(newWord, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add word' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await deleteWord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 });
  }
}

