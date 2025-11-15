"use client";

import { useState, useEffect, useCallback } from "react";
import { CrosswordGrid, CrosswordWord, GameSession } from "@/types";
import Link from "next/link";
import axios from "axios";

interface Props {
  playerEmail: string;
  playerHouse: string;
  playerName: string;
}

export default function CrosswordGame({
  playerEmail,
  playerHouse,
  playerName,
}: Props) {
  const [crossword, setCrossword] = useState<CrosswordGrid | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionData, setSessionData] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [selectedWord, setSelectedWord] = useState<CrosswordWord | null>(null);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [gameCompleted, setGameCompleted] = useState(false);

  // Timer
  useEffect(() => {
    if (!gameCompleted) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameCompleted]);

  // Load crossword and create session
  useEffect(() => {
    const initGame = async () => {
      try {
        // Fetch crossword
        const crosswordResponse = await axios.get("/api/games/crossword");
        const crosswordData = crosswordResponse.data;
        setCrossword(crosswordData);

        // Create session
        const sessionResponse = await axios.post(
          "/api/games/crossword/sessions",
          {
            playerName: playerName || playerEmail.split("@")[0], // Use email username as player name
            playerEmail: playerEmail,
            house: playerHouse,
            gameType: "crossword",
            totalWords: crosswordData.words.length,
          }
        );
        const newSessionData = sessionResponse.data;
        setSessionId(newSessionData.id);
        setSessionData(newSessionData);

        // Initialize answers
        const initialAnswers: { [key: string]: string } = {};
        crosswordData.words.forEach((word: CrosswordWord) => {
          initialAnswers[word.id] = "";
        });
        setAnswers(initialAnswers);

        setLoading(false);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Failed to load game. Please try again."
        );
        setLoading(false);
      }
    };

    initGame();
  }, [playerEmail, playerHouse]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (wordId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [wordId]: value.toUpperCase(),
    }));
  };

  const checkAnswers = useCallback(() => {
    if (!crossword) return 0;

    let correct = 0;
    crossword.words.forEach((word) => {
      if (answers[word.id]?.toUpperCase() === word.word.toUpperCase()) {
        correct++;
      }
    });
    return correct;
  }, [crossword, answers]);

  const handleSubmit = async () => {
    if (!crossword || !sessionId || !sessionData) return;

    const correctAnswers = checkAnswers();
    // const completed = correctAnswers === crossword.words.length;
    const completed = true;

    setSubmitting(true);
    try {
      const endTimeIST = new Date();

      await axios.patch("/api/games/crossword/sessions", {
        id: sessionId,
        playerEmail: sessionData.playerEmail,
        house: sessionData.house,
        name: sessionData.playerName,
        startTime: sessionData.startTime,
        totalWords: crossword.words.length,
        endTime: endTimeIST,
        completed,
        correctAnswers,
      });

      setGameCompleted(true);
    } catch (err: any) {
      console.error("Error submitting game:", err);
      setError(
        err.response?.data?.error || "Failed to submit score. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading crossword...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (gameCompleted && crossword) {
    const correctAnswers = checkAnswers();
    const totalWords = crossword.words.length;
    const score = Math.round((correctAnswers / totalWords) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Game Complete!
          </h2>
          <p className="text-gray-600 mb-6">Great job, {playerName}!</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatTime(timer)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Score:</span>
              <span className="text-2xl font-bold text-green-600">
                {correctAnswers}/{totalWords} ({score}%)
              </span>
            </div>
          </div>

          {/* <div className="space-y-3">
            <Link
              href="/leaderboard"
              className="block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Visit Leaderboard
            </Link>
          </div> */}
        </div>
      </div>
    );
  }

  if (!crossword) return null;

  return (
    <>
      {/* Submitting Loader */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Submitting Your Score...
            </h3>
            <p className="text-gray-600">
              Please wait while we save your results
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Player: {playerName}
                </h2>
                <p className="text-sm text-gray-500">{playerEmail}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-blue-600">
                  {formatTime(timer)}
                </div>
                <div className="text-xl text-gray-600">
                  {checkAnswers()}/{crossword.words.length} correct
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crossword Grid */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Crossword Puzzle</h3>
              <div className="inline-block">
                <div
                  className="grid gap-0 border-2 border-gray-800"
                  style={{
                    gridTemplateColumns: `repeat(${crossword.width}, 28px)`,
                  }}
                >
                  {crossword.grid.map((row, y) =>
                    row.map((cell, x) => {
                      // Find BOTH across and down words at this position
                      const acrossWord = crossword.words.find(
                        (w) =>
                          w.direction === "across" &&
                          w.startY === y &&
                          x >= w.startX &&
                          x < w.startX + w.word.length
                      );

                      const downWord = crossword.words.find(
                        (w) =>
                          w.direction === "down" &&
                          w.startX === x &&
                          y >= w.startY &&
                          y < w.startY + w.word.length
                      );

                      const isStart = crossword.words.some(
                        (w) => w.startX === x && w.startY === y
                      );

                      const number = isStart
                        ? crossword.words.find(
                            (w) => w.startX === x && w.startY === y
                          )?.number
                        : undefined;

                      // Get the letter to display from the user's answer
                      // Check both across and down words for this cell
                      let displayLetter = "";
                      if (cell) {
                        if (acrossWord) {
                          const letterIndex = x - acrossWord.startX;
                          const userAnswer = answers[acrossWord.id] || "";
                          displayLetter = userAnswer[letterIndex] || "";
                        }
                        // If no letter from across, try down word
                        if (!displayLetter && downWord) {
                          const letterIndex = y - downWord.startY;
                          const userAnswer = answers[downWord.id] || "";
                          displayLetter = userAnswer[letterIndex] || "";
                        }
                      }

                      return (
                        <div
                          key={`${x}-${y}`}
                          className={`w-7 h-7 border border-gray-300 flex items-center justify-center relative ${
                            cell ? "bg-white" : "bg-gray-800"
                          }`}
                        >
                          {number && (
                            <span className="absolute top-0 left-0 text-[10px] font-bold text-gray-600 pl-0.5">
                              {number}
                            </span>
                          )}
                          {displayLetter && (
                            <span className="text-sm font-semibold text-gray-900">
                              {displayLetter}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Submit Answers
              </button>
            </div>

            {/* Clues */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Clues & Answers</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">
                    Across
                  </h4>
                  <div className="space-y-3">
                    {crossword.words
                      .filter((w) => w.direction === "across")
                      .sort((a, b) => a.number - b.number)
                      .map((word) => (
                        <div key={word.id} className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            {word.number}. {word.clue}
                          </label>
                          <input
                            type="text"
                            value={answers[word.id] || ""}
                            onChange={(e) =>
                              handleAnswerChange(word.id, e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                              answers[word.id]?.toUpperCase() ===
                              word.word.toUpperCase()
                                ? "border-green-500 bg-green-50"
                                : "border-gray-300"
                            }`}
                            placeholder={`${word.word.length} letters`}
                            maxLength={word.word.length}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 text-gray-900">
                    Down
                  </h4>
                  <div className="space-y-3">
                    {crossword.words
                      .filter((w) => w.direction === "down")
                      .sort((a, b) => a.number - b.number)
                      .map((word) => (
                        <div key={word.id} className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            {word.number}. {word.clue}
                          </label>
                          <input
                            type="text"
                            value={answers[word.id] || ""}
                            onChange={(e) =>
                              handleAnswerChange(word.id, e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                              answers[word.id]?.toUpperCase() ===
                              word.word.toUpperCase()
                                ? "border-green-500 bg-green-50"
                                : "border-gray-300"
                            }`}
                            placeholder={`${word.word.length} letters`}
                            maxLength={word.word.length}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
