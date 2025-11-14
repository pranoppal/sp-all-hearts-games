import { NextResponse } from 'next/server';
import { getGameTimings } from '@/lib/shared/googleSheets';

export async function GET() {
  try {
    const timings = await getGameTimings();
    
    // Convert to plain object for JSON serialization
    const serializedTimings = timings.map((timing) => ({
      game: timing.game,
      start: timing.start.toISOString(),
      end: timing.end.toISOString(),
    }));

    return NextResponse.json(serializedTimings);
  } catch (error) {
    console.error('Error fetching game timings:', error);
    return NextResponse.json({ error: 'Failed to fetch game timings' }, { status: 500 });
  }
}

