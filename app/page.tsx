"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

interface GameTiming {
  game: string;
  start: string;
  end: string;
}

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userHouse, setUserHouse] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [hasPlayedCrossword, setHasPlayedCrossword] = useState(false);
  const [hasPlayedSudoku, setHasPlayedSudoku] = useState(false);
  const [hasPlayedWordle, setHasPlayedWordle] = useState(false);
  const [hasPlayedTyping, setHasPlayedTyping] = useState(false);
  const [hasPlayedMemory, setHasPlayedMemory] = useState(false);
  const [gameTimings, setGameTimings] = useState<GameTiming[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch game timings and user status
  useEffect(() => {
    const initializeData = async () => {
      setIsLoadingData(true);

      // Fetch game timings
      try {
        const response = await axios.get("/api/game-timings");
        setGameTimings(response.data);
      } catch (error) {
        console.error("Error fetching game timings:", error);
      }

      // Check user status
      const savedEmail = localStorage.getItem("userEmail");
      const savedHouse = localStorage.getItem("userHouse");

      if (savedEmail && savedHouse) {
        setUserEmail(savedEmail);
        setUserHouse(savedHouse);

        // Check if user has played crossword
        try {
          const response = await axios.get("/api/games/crossword/sessions");
          const sessions = response.data;
          const userCrosswordSession = sessions.find(
            (session: any) =>
              session.playerEmail === savedEmail && session.completed === true
          );

          if (userCrosswordSession) {
            setHasPlayedCrossword(true);
          }
        } catch (error) {
          console.error("Error checking game status:", error);
        }
      } else {
        setShowEmailModal(true);
      }

      // Data loading complete
      setIsLoadingData(false);
    };

    initializeData();
  }, []);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim().toLowerCase();

    // Validate email ends with @sadhguru.org
    if (!trimmedEmail.endsWith("@sadhguru.org")) {
      setEmailError("Email must end with @sadhguru.org");
      return;
    }

    // Fetch user data from API
    setIsSubmittingEmail(true);
    setEmailError("");

    try {
      const response = await axios.get(
        `/api/users?email=${encodeURIComponent(trimmedEmail)}`
      );
      const userData = response.data;

      if (!userData.house) {
        setEmailError(
          "Your house information is not available. Please contact the administrator."
        );
        setIsSubmittingEmail(false);
        return;
      }

      // Save email, house, and name to localStorage
      localStorage.setItem("userEmail", trimmedEmail);
      localStorage.setItem("userHouse", userData.house);
      localStorage.setItem("playerName", userData.name || trimmedEmail);
      setUserEmail(trimmedEmail);
      setUserHouse(userData.house);
      setShowEmailModal(false);
      setIsEditing(false);
      setEmailInput("");
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 404) {
        // Email not found in users sheet - assign "Other" house
        console.log("Email not found in users sheet, assigning 'Other' house");

        // Save email, house, and name to localStorage
        localStorage.setItem("userEmail", trimmedEmail);
        localStorage.setItem("userHouse", "other");
        localStorage.setItem("playerName", trimmedEmail);
        setUserEmail(trimmedEmail);
        setUserHouse("other");
        setShowEmailModal(false);
        setIsEditing(false);
        setEmailInput("");
      } else {
        setEmailError("Failed to fetch your details. Please try again.");
      }
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleEditEmail = () => {
    setEmailInput(userEmail || "");
    setEmailError("");
    setIsEditing(true);
    setShowEmailModal(true);
  };

  // Helper functions for game timing
  const getGameTiming = (gameName: string): GameTiming | undefined => {
    return gameTimings.find((t) => t.game === gameName.toLowerCase());
  };

  const isGameActive = (gameName: string): boolean => {
    const timing = getGameTiming(gameName);
    if (!timing) return true; // If no timing found, assume game is active
    const start = new Date(timing.start);
    const end = new Date(timing.end);
    return currentTime >= start && currentTime <= end;
  };

  const isGameUpcoming = (gameName: string): boolean => {
    const timing = getGameTiming(gameName);
    if (!timing) return false;
    const start = new Date(timing.start);
    return currentTime < start;
  };

  const isGameEnded = (gameName: string): boolean => {
    const timing = getGameTiming(gameName);
    if (!timing) return false;
    const end = new Date(timing.end);
    return currentTime > end;
  };

  const formatCountdown = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getCountdownToStart = (gameName: string): string => {
    const timing = getGameTiming(gameName);
    if (!timing) return "";
    const start = new Date(timing.start);
    const diff = start.getTime() - currentTime.getTime();
    return formatCountdown(diff);
  };

  const getCountdownToEnd = (gameName: string): string => {
    const timing = getGameTiming(gameName);
    if (!timing) return "";
    const end = new Date(timing.end);
    const diff = end.getTime() - currentTime.getTime();
    return formatCountdown(diff);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isEditing ? "Update Your Email" : "Welcome!"}
              </h2>
              <p className="text-gray-600">
                {isEditing
                  ? "Enter your new email address"
                  : "Enter your email to start playing and save your progress"}
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setEmailError(""); // Clear error on input change
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    emailError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="yourname@sadhguru.org"
                  required
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500">
                  Must be a @sadhguru.org email address
                </p>
              </div>
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmittingEmail}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingEmail ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Verifying...
                  </span>
                ) : isEditing ? (
                  "Update Email"
                ) : (
                  "Continue"
                )}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setIsEditing(false);
                    setEmailInput("");
                    setEmailError("");
                  }}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Header with email badge */}
      {userEmail && (
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
          {/* <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <span className="text-xl">🏆</span>
            <span className="text-sm font-semibold text-gray-900">
              Leaderboard
            </span>
          </Link> */}

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
            <span className="text-sm text-gray-600">Playing as:</span>
            <span className="text-sm font-semibold text-gray-900">
              {userEmail}
            </span>
            <button
              onClick={handleEditEmail}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Change
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-screen p-24">
        <div className="z-10 max-w-6xl w-full items-center justify-center font-mono text-sm">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🎮 All Hearts 2025 - Games
            </h1>
            <p className="text-xl text-gray-600">
              Choose your favorite game and start playing!
            </p>
          </div>

          <div className="relative">
            {/* Loading overlay */}
            {isLoadingData && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-gradient-to-br from-purple-50/80 via-blue-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                  <p className="text-lg font-semibold text-gray-900">
                    Loading games...
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Please wait</p>
                </div>
              </div>
            )}

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12 transition-all ${
                isLoadingData ? "blur-md pointer-events-none" : ""
              }`}
            >
              <Link
                href="/games/crossword"
                className={`group rounded-xl border px-6 py-8 transition-all relative overflow-hidden ${
                  hasPlayedCrossword
                    ? "border-green-300 bg-green-50"
                    : isGameUpcoming("crossword")
                    ? "border-orange-300 bg-orange-50 cursor-not-allowed"
                    : isGameEnded("crossword")
                    ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-blue-500 hover:shadow-xl hover:scale-105"
                }`}
                onClick={(e) => {
                  if (isGameUpcoming("crossword") || isGameEnded("crossword")) {
                    e.preventDefault();
                  }
                }}
              >
                {hasPlayedCrossword && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-3xl">✅</span>
                  </div>
                )}

                {/* Blurred content for upcoming games */}
                <div className={isGameUpcoming("crossword") ? "blur-md" : ""}>
                  <div className="text-5xl mb-4">🧩</div>
                  <h2 className="mb-3 text-2xl font-semibold text-gray-900">
                    Crossword{" "}
                    {!hasPlayedCrossword && isGameActive("crossword") && (
                      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        →
                      </span>
                    )}
                  </h2>
                  <p className="m-0 text-sm text-gray-600">
                    Solve crossword puzzles and test your vocabulary skills!
                  </p>
                </div>

                {/* Status badge and countdown - always visible */}
                {hasPlayedCrossword ? (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    ✓ Completed
                  </div>
                ) : isGameUpcoming("crossword") ? (
                  <div className="mt-4 space-y-2 relative z-10">
                    <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                      🔒 Locked
                    </div>
                    <div className="text-sm font-medium text-orange-700">
                      Unlocks in: {getCountdownToStart("crossword")}
                    </div>
                  </div>
                ) : isGameEnded("crossword") ? (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">
                    ⏰ Ended
                  </div>
                ) : isGameActive("crossword") ? (
                  <div className="mt-4 space-y-2">
                    <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      🔥 Active
                    </div>
                    <div className="text-sm font-medium text-blue-700">
                      Ends in: {getCountdownToEnd("crossword")}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    Available
                  </div>
                )}
              </Link>

              <Link
                href="/games/wordle"
                className={`group rounded-xl border px-6 py-8 transition-all relative overflow-hidden ${
                  hasPlayedWordle
                    ? "border-green-300 bg-green-50"
                    : isGameUpcoming("wordle")
                    ? "border-orange-300 bg-orange-50 cursor-not-allowed"
                    : isGameEnded("wordle")
                    ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-blue-500 hover:shadow-xl hover:scale-105"
                }`}
                onClick={(e) => {
                  if (isGameUpcoming("wordle") || isGameEnded("wordle")) {
                    e.preventDefault();
                  }
                }}
              >
                {hasPlayedWordle && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-3xl">✅</span>
                  </div>
                )}

                {/* Blurred content for upcoming games */}
                <div className={isGameUpcoming("wordle") ? "blur-md" : ""}>
                  <div className="text-5xl mb-4">📝</div>
                  <h2 className="mb-3 text-2xl font-semibold text-gray-900">
                    Wordle{" "}
                    {!hasPlayedWordle && isGameActive("wordle") && (
                      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        →
                      </span>
                    )}
                  </h2>
                  <p className="m-0 text-sm text-gray-600">
                    Guess the word in 6 tries or less!
                  </p>
                </div>

                {/* Status badge and countdown - always visible */}
                {hasPlayedWordle ? (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    ✓ Completed
                  </div>
                ) : isGameUpcoming("wordle") ? (
                  <div className="mt-4 space-y-2 relative z-10">
                    <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                      🔒 Locked
                    </div>
                    <div className="text-sm font-medium text-orange-700">
                      Unlocks in: {getCountdownToStart("wordle")}
                    </div>
                  </div>
                ) : isGameEnded("wordle") ? (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">
                    ⏰ Ended
                  </div>
                ) : isGameActive("wordle") ? (
                  <div className="mt-4 space-y-2">
                    <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      🔥 Active
                    </div>
                    <div className="text-sm font-medium text-blue-700">
                      Ends in: {getCountdownToEnd("wordle")}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    Available
                  </div>
                )}
              </Link>

              <Link
                href="/games/sudoku"
                className={`group rounded-xl border px-6 py-8 transition-all relative overflow-hidden ${
                  hasPlayedSudoku
                    ? "border-green-300 bg-green-50"
                    : isGameUpcoming("sudoku")
                    ? "border-orange-300 bg-orange-50 cursor-not-allowed"
                    : isGameEnded("sudoku")
                    ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-blue-500 hover:shadow-xl hover:scale-105"
                }`}
                onClick={(e) => {
                  if (isGameUpcoming("sudoku") || isGameEnded("sudoku")) {
                    e.preventDefault();
                  }
                }}
              >
                {hasPlayedSudoku && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-3xl">✅</span>
                  </div>
                )}

                {/* Blurred content for upcoming games */}
                <div className={isGameUpcoming("sudoku") ? "blur-md" : ""}>
                  <div className="text-5xl mb-4">🔢</div>
                  <h2 className="mb-3 text-2xl font-semibold text-gray-900">
                    Sudoku{" "}
                    {!hasPlayedSudoku && isGameActive("sudoku") && (
                      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        →
                      </span>
                    )}
                  </h2>
                  <p className="m-0 text-sm text-gray-600">
                    Challenge your logic with number puzzles.
                  </p>
                </div>

                {/* Status badge and countdown - always visible */}
                {hasPlayedSudoku ? (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    ✓ Completed
                  </div>
                ) : isGameUpcoming("sudoku") ? (
                  <div className="mt-4 space-y-2 relative z-10">
                    <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                      🔒 Locked
                    </div>
                    <div className="text-sm font-medium text-orange-700">
                      Unlocks in: {getCountdownToStart("sudoku")}
                    </div>
                  </div>
                ) : isGameEnded("sudoku") ? (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">
                    ⏰ Ended
                  </div>
                ) : isGameActive("sudoku") ? (
                  <div className="mt-4 space-y-2">
                    <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      🔥 Active
                    </div>
                    <div className="text-sm font-medium text-blue-700">
                      Ends in: {getCountdownToEnd("sudoku")}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    Available
                  </div>
                )}
              </Link>

              <Link
                href="/games/typing"
                className={`group rounded-xl border px-6 py-8 transition-all relative overflow-hidden ${
                  hasPlayedTyping
                    ? "border-green-300 bg-green-50"
                    : isGameUpcoming("typing")
                    ? "border-orange-300 bg-orange-50 cursor-not-allowed"
                    : isGameEnded("typing")
                    ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-blue-500 hover:shadow-xl hover:scale-105"
                }`}
                onClick={(e) => {
                  if (isGameUpcoming("typing") || isGameEnded("typing")) {
                    e.preventDefault();
                  }
                }}
              >
                {hasPlayedTyping && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-3xl">✅</span>
                  </div>
                )}

                {/* Blurred content for upcoming games */}
                <div className={isGameUpcoming("typing") ? "blur-md" : ""}>
                  <div className="text-5xl mb-4">⌨️</div>
                  <h2 className="mb-3 text-2xl font-semibold text-gray-900">
                    Typing Competition{" "}
                    {!hasPlayedTyping && isGameActive("typing") && (
                      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        →
                      </span>
                    )}
                  </h2>
                  <p className="m-0 text-sm text-gray-600">
                    Test your typing speed and accuracy!
                  </p>
                </div>

                {/* Status badge and countdown - always visible */}
                {hasPlayedTyping ? (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    ✓ Completed
                  </div>
                ) : isGameUpcoming("typing") ? (
                  <div className="mt-4 space-y-2 relative z-10">
                    <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                      🔒 Locked
                    </div>
                    <div className="text-sm font-medium text-orange-700">
                      Unlocks in: {getCountdownToStart("typing")}
                    </div>
                  </div>
                ) : isGameEnded("typing") ? (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">
                    ⏰ Ended
                  </div>
                ) : isGameActive("typing") ? (
                  <div className="mt-4 space-y-2">
                    <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      🔥 Active
                    </div>
                    <div className="text-sm font-medium text-blue-700">
                      Ends in: {getCountdownToEnd("typing")}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    Available
                  </div>
                )}
              </Link>

              <Link
                href="/games/memory"
                className={`group rounded-xl border px-6 py-8 transition-all relative overflow-hidden ${
                  hasPlayedMemory
                    ? "border-green-300 bg-green-50"
                    : isGameUpcoming("memory")
                    ? "border-orange-300 bg-orange-50 cursor-not-allowed"
                    : isGameEnded("memory")
                    ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-blue-500 hover:shadow-xl hover:scale-105"
                }`}
                onClick={(e) => {
                  if (isGameUpcoming("memory") || isGameEnded("memory")) {
                    e.preventDefault();
                  }
                }}
              >
                {hasPlayedMemory && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-3xl">✅</span>
                  </div>
                )}

                {/* Blurred content for upcoming games */}
                <div className={isGameUpcoming("memory") ? "blur-md" : ""}>
                  <div className="text-5xl mb-4">🎯</div>
                  <h2 className="mb-3 text-2xl font-semibold text-gray-900">
                    Memory Game{" "}
                    {!hasPlayedMemory && isGameActive("memory") && (
                      <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                        →
                      </span>
                    )}
                  </h2>
                  <p className="m-0 text-sm text-gray-600">
                    Match pairs and train your memory!
                  </p>
                </div>

                {/* Status badge and countdown - always visible */}
                {hasPlayedMemory ? (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    ✓ Completed
                  </div>
                ) : isGameUpcoming("memory") ? (
                  <div className="mt-4 space-y-2 relative z-10">
                    <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                      🔒 Locked
                    </div>
                    <div className="text-sm font-medium text-orange-700">
                      Unlocks in: {getCountdownToStart("memory")}
                    </div>
                  </div>
                ) : isGameEnded("memory") ? (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">
                    ⏰ Ended
                  </div>
                ) : isGameActive("memory") ? (
                  <div className="mt-4 space-y-2">
                    <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      🔥 Active
                    </div>
                    <div className="text-sm font-medium text-blue-700">
                      Ends in: {getCountdownToEnd("memory")}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    Available
                  </div>
                )}
              </Link>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
                <div className="text-5xl mb-4">🎲</div>
                <h2 className="mb-3 text-2xl font-semibold text-gray-700">
                  More Games
                </h2>
                <p className="m-0 text-sm text-gray-600">
                  Many more exciting games coming soon!
                </p>
                <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                  Coming Soon
                </div>
              </div>
            </div>
            {/* End of relative wrapper */}
          </div>
        </div>
      </div>
    </main>
  );
}
