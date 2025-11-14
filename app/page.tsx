"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userHouse, setUserHouse] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [selectedHouse, setSelectedHouse] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailError, setEmailError] = useState("");

  const houses = [
    { id: "fire", name: "Fire", emoji: "🔥", color: "red" },
    { id: "water", name: "Water", emoji: "💧", color: "blue" },
    { id: "earth", name: "Earth", emoji: "🌿", color: "green" },
    { id: "air", name: "Air", emoji: "💨", color: "purple" },
  ];

  useEffect(() => {
    // Check if email and house exist in localStorage
    const savedEmail = localStorage.getItem("userEmail");
    const savedHouse = localStorage.getItem("userHouse");
    if (savedEmail && savedHouse) {
      setUserEmail(savedEmail);
      setUserHouse(savedHouse);
    } else {
      setShowEmailModal(true);
    }
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim().toLowerCase();

    // Validate email ends with @sadhguru.org
    if (!trimmedEmail.endsWith("@sadhguru.org")) {
      setEmailError("Email must end with @sadhguru.org");
      return;
    }

    // Validate house is selected
    if (!selectedHouse) {
      setEmailError("Please select a house");
      return;
    }

    // Clear error and save email and house
    setEmailError("");
    localStorage.setItem("userEmail", trimmedEmail);
    localStorage.setItem("userHouse", selectedHouse);
    setUserEmail(trimmedEmail);
    setUserHouse(selectedHouse);
    setShowEmailModal(false);
    setIsEditing(false);
    setEmailInput("");
    setSelectedHouse("");
  };

  const handleEditEmail = () => {
    setEmailInput(userEmail || "");
    setSelectedHouse(userHouse || "");
    setEmailError("");
    setIsEditing(true);
    setShowEmailModal(true);
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your House
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {houses.map((house) => {
                    const isSelected = selectedHouse === house.id;
                    const colorClasses = {
                      fire: isSelected
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "",
                      water: isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "",
                      earth: isSelected
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "",
                      air: isSelected
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "",
                    };

                    return (
                      <button
                        key={house.id}
                        type="button"
                        onClick={() => {
                          setSelectedHouse(house.id);
                          setEmailError("");
                        }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? colorClasses[
                                house.id as keyof typeof colorClasses
                              ]
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-3xl mb-1">{house.emoji}</div>
                        <div
                          className={`font-semibold ${
                            isSelected ? "" : "text-gray-700"
                          }`}
                        >
                          {house.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {isEditing ? "Update Email" : "Continue"}
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

            <p className="text-xs text-gray-500 text-center mt-4">
              Your email is stored locally and used only for game progress
              tracking
            </p>
          </div>
        </div>
      )}

      {/* Header with email badge */}
      {userEmail && (
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <span className="text-xl">🏆</span>
            <span className="text-sm font-semibold text-gray-900">
              Leaderboard
            </span>
          </Link>

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
              🎮 All Hearts Games
            </h1>
            <p className="text-xl text-gray-600">
              Choose your favorite game and start playing!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <Link
              href="/games/crossword"
              className="group rounded-xl border border-gray-200 bg-white px-6 py-8 transition-all hover:border-blue-500 hover:shadow-xl hover:scale-105"
            >
              <div className="text-5xl mb-4">🧩</div>
              <h2 className="mb-3 text-2xl font-semibold text-gray-900">
                Crossword{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h2>
              <p className="m-0 text-sm text-gray-600">
                Solve crossword puzzles and test your vocabulary skills!
              </p>
              <div className="mt-4 inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Available
              </div>
            </Link>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
              <div className="text-5xl mb-4">🔢</div>
              <h2 className="mb-3 text-2xl font-semibold text-gray-700">
                Sudoku
              </h2>
              <p className="m-0 text-sm text-gray-600">
                Challenge your logic with number puzzles.
              </p>
              <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                Coming Soon
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="mb-3 text-2xl font-semibold text-gray-700">
                Wordle
              </h2>
              <p className="m-0 text-sm text-gray-600">
                Guess the word in 6 tries or less!
              </p>
              <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                Coming Soon
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
              <div className="text-5xl mb-4">⌨️</div>
              <h2 className="mb-3 text-2xl font-semibold text-gray-700">
                Typing Competition
              </h2>
              <p className="m-0 text-sm text-gray-600">
                Test your typing speed and accuracy!
              </p>
              <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                Coming Soon
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 opacity-60">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="mb-3 text-2xl font-semibold text-gray-700">
                Memory Game
              </h2>
              <p className="m-0 text-sm text-gray-600">
                Match pairs and train your memory!
              </p>
              <div className="mt-4 inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                Coming Soon
              </div>
            </div>

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
        </div>
      </div>
    </main>
  );
}
