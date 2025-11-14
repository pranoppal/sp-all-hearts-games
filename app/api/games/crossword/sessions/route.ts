import { NextRequest, NextResponse } from "next/server";
import { getScoresByGame, addScoreToSheet } from "@/lib/shared/googleSheets";

// Force dynamic rendering - don't cache
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const scores = await getScoresByGame("crossword");

    // Transform scores to session format for backward compatibility
    const sessions = scores.map((score, index) => ({
      id: `${score.email}-${score.duration}-${index}`, // Generate ID from data
      playerName: score.email.split("@")[0],
      playerEmail: score.email,
      house: score.house,
      gameType: "crossword",
      startTime: new Date().toISOString(), // We don't have this data
      completed: true,
      correctAnswers: Math.round((score.score / 100) * 10), // Approximate
      totalWords: 10, // Approximate
      duration: score.duration,
    }));

    // Sort by duration (fastest first) for leaderboard
    const sorted = sessions.sort((a, b) => a.duration - b.duration);
    return NextResponse.json(sorted, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerEmail, house, totalWords } = body;

    if (!playerEmail) {
      return NextResponse.json(
        { error: "Player email is required" },
        { status: 400 }
      );
    }

    // Return a temporary session ID - we'll save to sheet on PATCH
    const newSession = {
      id: `temp-${Date.now()}`,
      playerName: playerEmail.split("@")[0],
      playerEmail,
      house: house || undefined,
      gameType: "crossword",
      startTime: new Date().toISOString(),
      completed: false,
      correctAnswers: 0,
      totalWords: totalWords || 0,
    };

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, endTime, completed, correctAnswers, ...sessionData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Extract data from the temporary session
    // The session data should be passed in the request or stored temporarily
    const playerEmail = body.playerEmail || "";
    const house = body.house || "";
    const totalWords = body.totalWords || 0;
    const startTime = body.startTime || "";

    // Calculate duration
    let duration = 0;
    if (endTime && startTime) {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      duration = Math.floor((end - start) / 1000);
    }

    // Calculate score percentage
    const score =
      totalWords > 0 ? Math.round((correctAnswers / totalWords) * 100) : 0;

    // Save to Google Sheet
    if (completed && playerEmail && house) {
      await addScoreToSheet({
        email: playerEmail,
        house: house,
        game: "crossword",
        duration: duration,
        score: score,
      });
    }

    const updatedSession = {
      id,
      playerEmail,
      house,
      gameType: "crossword",
      startTime,
      endTime,
      duration,
      completed,
      correctAnswers,
      totalWords,
    };

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
