"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import { GameSession } from "@/types";
import { HOUSES, getHouseById } from "@/lib/shared/houses";

interface HouseScore {
  houseId: string;
  totalPoints: number;
  totalGames: number;
  totalPlayers: number;
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

  const calculateHouseScores = (): HouseScore[] => {
    // --- WEIGHTS ---
    const USER_SCORE_WEIGHT = 0.2; // 40% - User accuracy score
    const SPEED_WEIGHT = 0.2; // 40% - Speed/duration bonus
    const PARTICIPATION_WEIGHT = 0.4; // 20% - House participation count
    const MAX_SPEED_THRESHOLD = 300; // seconds for speed calculation
    // ----------------

    // Helper: clamp to [min, max]
    const clamp = (v: number, min = 0, max = 100) =>
      Math.max(min, Math.min(max, v));

    // Calculate per-session user score (accuracy + speed, no participation credit)
    const computeSessionScore = (s): number => {
      if (!s.totalWords || s.totalWords <= 0) return 0;

      const correct = Math.max(0, s.correctAnswers ?? 0);
      const accuracyPct = clamp((correct / s.totalWords) * 100, 0, 100);

      // Speed contribution (normalized 0-100). Larger if duration is small.
      const dur =
        typeof s.duration === "number" ? s.duration : MAX_SPEED_THRESHOLD;
      const speedNormalized = clamp(
        ((MAX_SPEED_THRESHOLD - dur) / MAX_SPEED_THRESHOLD) * 100,
        0,
        100
      );

      // Combined score: 40% accuracy + 40% speed
      const combined =
        USER_SCORE_WEIGHT * accuracyPct + SPEED_WEIGHT * speedNormalized;
      return clamp(combined, 0, 100);
    };

    // Get all completed sessions
    const completedSessions = sessions.filter((s) => s.completed);

    // Group sessions by house
    const houseUserMap: {
      [house: string]: {
        sessionScores: number[];
        participantCount: number;
      };
    } = {};

    // Initialize houses
    HOUSES.forEach((h) => {
      houseUserMap[h.name] = {
        sessionScores: [],
        participantCount: 0,
      };
    });

    // Populate sessions and track unique participants per house
    const houseParticipants: { [house: string]: Set<string> } = {};
    HOUSES.forEach((h) => {
      houseParticipants[h.name] = new Set();
    });

    completedSessions.forEach((session) => {
      const houseName = session.house?.trim();
      if (!houseName || houseName === "other") return;
      if (!houseUserMap[houseName]) return;

      const score = computeSessionScore(session);
      houseUserMap[houseName].sessionScores.push(score);

      // Track unique participants
      const userId = session.playerEmail ?? "__anonymous__";
      houseParticipants[houseName].add(userId);
    });

    // Update participant counts
    HOUSES.forEach((h) => {
      houseUserMap[h.name].participantCount = houseParticipants[h.name].size;
    });

    // Find max participation for normalization
    const maxParticipants = Math.max(
      ...HOUSES.map((h) => houseUserMap[h.name].participantCount),
      1
    );

    // Build results with all three weighted components
    const results: HouseScore[] = HOUSES.map((house) => {
      const houseData = houseUserMap[house.name];
      const sessionScores = houseData.sessionScores;
      const participantCount = houseData.participantCount;

      // Component 1: Average user score (accuracy + speed)
      const avgUserScore =
        sessionScores.length > 0
          ? sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length
          : 0;

      // Component 2: Participation normalized (0-100)
      const participationScore = (participantCount / maxParticipants) * 100;

      // Note: speedNormalized is already included in avgUserScore calculation
      // The avgUserScore already contains 40% accuracy + 40% speed

      // Final house score: 40% user score + 40% speed (in avgUserScore) + 20% participation
      const finalScore =
        avgUserScore * (USER_SCORE_WEIGHT + SPEED_WEIGHT) +
        participationScore * PARTICIPATION_WEIGHT;

      const totalGames = sessionScores.length;

      return {
        houseId: house.name,
        totalPoints: Math.round(finalScore),
        totalGames,
        totalPlayers: participantCount,
        averageScore: Math.round(finalScore),
      };
    });

    // Sort by totalPoints descending
    return results.sort((a, b) => b.totalPoints - a.totalPoints);
  };

  // Get players from selected house or all players (exclude "other" house)
  const getHousePlayers = (houseId: string | null) => {
    if (houseId === "other") return [];

    const filtered = sessions.filter((s) => {
      if (!s.completed || s.house === "other") return false;
      if (houseId && s.house?.trim() !== houseId) return false;
      return true;
    });

    return filtered
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

        {/* House Standings */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            🏠 House Standings
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {houseScores.map((houseScore, index) => {
              const house = getHouseById(houseScore.houseId);
              if (!house) return null;

              return (
                <div
                  key={house.name}
                  className="p-6 rounded-lg text-center bg-gradient-to-br from-slate-50 to-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl font-bold text-gray-300 mb-3">
                    #{index + 1}
                  </div>
                  <div className="h-16 flex items-center justify-center mb-3">
                    <Image
                      src={house.logo}
                      alt={house.name}
                      width={50}
                      height={50}
                      className="rounded-lg"
                    />
                  </div>
                  <h3 className={`text-lg font-bold ${house.color} mb-3`}>
                    {house.name}
                  </h3>
                  <div className={`text-3xl font-bold ${house.color} mb-1`}>
                    {houseScore.totalPoints}
                  </div>
                  <p className="text-xs text-gray-500">
                    {houseScore.totalPlayers} participants
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Leaderboard with House Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            🏅 Global Leaderboard
          </h2>

          {/* House Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedHouse(null)}
              className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
                selectedHouse === null
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
            >
              All Players
            </button>
            {HOUSES.map((house) => {
              const isSelected = selectedHouse === house.name;
              return (
                <button
                  key={house.name}
                  onClick={() => setSelectedHouse(house.name)}
                  className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? `${house.bgColor} ${house.borderColor} ring-2 ring-blue-400`
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <Image
                    src={house.logo}
                    alt={house.name}
                    width={20}
                    height={20}
                    className="rounded"
                  />
                  {house.name}
                </button>
              );
            })}
          </div>

          {/* Players List */}
          {housePlayers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {selectedHouse
                  ? `No completed games from ${selectedHouse} yet.`
                  : "No completed games yet."}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {selectedHouse
                  ? "Be the first from this house to play!"
                  : "Players will appear here as they complete games!"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {housePlayers.slice(0, 20).map((player, index) => {
                const house = getHouseById(player.house.trim() || "");
                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      index < 3 && house ? house.bgColor : "bg-gray-50"
                    } ${
                      index < 3 && house ? house.borderColor : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
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
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {player.playerName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {house && (
                              <Image
                                src={house.logo}
                                alt={house.name}
                                width={16}
                                height={16}
                                className="rounded"
                              />
                            )}
                            <span className="text-xs text-gray-500">
                              {player.playerEmail}
                            </span>
                            {house && (
                              <span
                                className={`text-xs font-semibold ${house.color}`}
                              >
                                • {house.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
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
                );
              })}
            </div>
          )}
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
