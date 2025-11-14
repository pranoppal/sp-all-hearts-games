"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { GameSession } from "@/types";
import { HOUSES, getHouseById } from "@/lib/shared/houses";

interface HouseScore {
  houseId: string;
  totalPoints: number;
  totalGames: number;
  averageScore: number;
}

export default function LeaderboardPage() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [userHouse, setUserHouse] = useState<string | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedHouse = localStorage.getItem("userHouse");
    setUserHouse(savedHouse);
    setSelectedHouse(savedHouse); // Default to user's house
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get("/api/games/crossword/sessions");
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate house scores
  const calculateHouseScores = (): HouseScore[] => {
    const houseData: { [key: string]: { points: number; games: number } } = {};

    // Initialize all houses
    HOUSES.forEach((house) => {
      houseData[house.id] = { points: 0, games: 0 };
    });

    // Calculate points for each completed session
    sessions.forEach((session) => {
      if (session.completed && session.house && houseData[session.house]) {
        const scorePercentage =
          (session.correctAnswers / session.totalWords) * 100;
        const timeBonus = session.duration
          ? Math.max(0, 300 - session.duration)
          : 0; // Bonus for speed
        const points = Math.round(scorePercentage + timeBonus / 10);

        houseData[session.house].points += points;
        houseData[session.house].games += 1;
      }
    });

    return HOUSES.map((house) => ({
      houseId: house.id,
      totalPoints: houseData[house.id].points,
      totalGames: houseData[house.id].games,
      averageScore:
        houseData[house.id].games > 0
          ? Math.round(houseData[house.id].points / houseData[house.id].games)
          : 0,
    })).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  // Get players from selected house
  const getHousePlayers = (houseId: string | null) => {
    if (!houseId) return [];

    return sessions
      .filter((s) => s.house === houseId && s.completed)
      .map((session) => ({
        ...session,
        score: Math.round((session.correctAnswers / session.totalWords) * 100),
      }))
      .sort((a, b) => {
        // Sort by score first, then by duration
        if (b.score !== a.score) return b.score - a.score;
        return (a.duration || 999999) - (b.duration || 999999);
      });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const houseScores = calculateHouseScores();
  const housePlayers = getHousePlayers(selectedHouse);
  const selectedHouseData = getHouseById(selectedHouse || "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Games
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600">
            House competition & individual rankings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - House Scores */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              🏠 House Standings
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Click on a house to view individual rankings →
            </p>
            <div className="space-y-4">
              {houseScores.map((houseScore, index) => {
                const house = getHouseById(houseScore.houseId);
                if (!house) return null;
                const isSelected = selectedHouse === house.id;

                return (
                  <button
                    key={house.id}
                    onClick={() => setSelectedHouse(house.id)}
                    className={`w-full p-6 rounded-lg border-2 transition-all text-left relative ${
                      house.bgColor
                    } ${house.borderColor} ${
                      isSelected
                        ? "ring-4 ring-blue-400 shadow-xl scale-105"
                        : "hover:shadow-lg hover:scale-102 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-gray-400">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">{house.emoji}</span>
                            <h3 className={`text-2xl font-bold ${house.color}`}>
                              {house.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {houseScore.totalGames} games played
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-4xl font-bold ${house.color}`}>
                          {houseScore.totalPoints}
                        </div>
                        <p className="text-sm text-gray-600">points</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Average Score:</span>
                        <span className={`font-semibold ${house.color}`}>
                          {houseScore.averageScore} pts/game
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side - House Players */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {selectedHouseData ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">{selectedHouseData.emoji}</span>
                  <div>
                    <h2
                      className={`text-2xl font-bold ${selectedHouseData.color}`}
                    >
                      {selectedHouseData.name} House
                    </h2>
                    <p className="text-sm text-gray-600">Individual Rankings</p>
                  </div>
                </div>

                {housePlayers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No completed games yet.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Be the first from this house to play!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {housePlayers.map((player, index) => (
                      <div
                        key={player.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          index < 3 ? selectedHouseData.bgColor : "bg-gray-50"
                        } ${
                          index < 3
                            ? selectedHouseData.borderColor
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`text-2xl font-bold ${
                                index === 0
                                  ? "text-yellow-600"
                                  : index === 1
                                  ? "text-gray-400"
                                  : index === 2
                                  ? "text-orange-600"
                                  : "text-gray-600"
                              }`}
                            >
                              #{index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {player.playerName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {player.playerEmail}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold ${selectedHouseData.color}`}
                            >
                              {player.score}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {player.duration
                                ? formatDuration(player.duration)
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-2xl mb-3">👈</p>
                <p className="text-gray-900 font-semibold mb-2">
                  Click on a house
                </p>
                <p className="text-gray-500 text-sm">
                  Select a house from the left to view individual player
                  rankings
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Games
          </Link>
        </div>
      </div>
    </div>
  );
}
