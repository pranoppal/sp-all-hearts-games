"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function AdminHub() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated (password stored in session storage)
    const savedAuth = sessionStorage.getItem("adminAuthenticated");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    try {
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (response.ok) {
        // Save authentication to session storage
        sessionStorage.setItem("adminAuthenticated", "true");
        setIsAuthenticated(true);
        setPasswordInput("");
      } else {
        setPasswordError("Incorrect password. Please try again.");
        setPasswordInput("");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setPasswordError("An error occurred. Please try again.");
    }
  };

  if (isChecking) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Access Required
              </h2>
              <p className="text-gray-600">
                Enter the admin password to continue
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter password"
                  required
                  autoFocus
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Unlock Admin Panel
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      <div className="z-10 max-w-6xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎮 Admin Panel
          </h1>
          <p className="text-xl text-gray-600">
            Manage games, words, and view statistics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          <Link
            href="/admin/crossword"
            className="group rounded-xl border border-gray-200 bg-white px-6 py-8 transition-all hover:border-blue-500 hover:shadow-xl hover:scale-105"
          >
            <div className="text-5xl mb-4">🧩</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              Crossword{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              Manage words, clues, and view crossword game statistics
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Add/Delete Words</div>
              <div>• View Leaderboard</div>
              <div>• Player Statistics</div>
            </div>
          </Link>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
            <div className="text-5xl mb-4">🔢</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-700">
              Sudoku
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              Manage sudoku puzzles and difficulty levels
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Create Puzzles</div>
              <div>• Difficulty Settings</div>
              <div>• Player Stats</div>
            </div>
            <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
              Coming Soon
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-700">
              Wordle
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              Manage word lists and game settings
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Word Database</div>
              <div>• Daily Challenges</div>
              <div>• Success Rates</div>
            </div>
            <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
              Coming Soon
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
            <div className="text-5xl mb-4">⌨️</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-700">
              Typing Competition
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              Manage typing tests and passages
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Test Passages</div>
              <div>• Difficulty Levels</div>
              <div>• WPM Statistics</div>
            </div>
            <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
              Coming Soon
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-700">
              Memory Game
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              Manage card sets and themes
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Card Collections</div>
              <div>• Theme Management</div>
              <div>• Match Statistics</div>
            </div>
            <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
              Coming Soon
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-6 py-8">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="mb-3 text-2xl font-semibold text-gray-900">
              Global Stats
            </h2>
            <p className="m-0 text-sm text-gray-600 mb-4">
              View platform-wide statistics
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Total Players</div>
              <div>• Games Played</div>
              <div>• Popular Games</div>
            </div>
            <div className="mt-4 inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
              Future Feature
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Games
          </Link>
          <p className="text-sm text-gray-500">
            Select a game above to manage its content and view statistics
          </p>
        </div>
      </div>
    </main>
  );
}
