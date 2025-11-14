'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Word, GameSession } from '@/types';

export default function CrosswordAdminPanel() {
  const [words, setWords] = useState<Word[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newClue, setNewClue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'words' | 'stats'>('words');

  useEffect(() => {
    fetchWords();
    fetchSessions();
  }, []);

  const fetchWords = async () => {
    try {
      const response = await axios.get('/api/games/crossword/words');
      setWords(response.data);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/games/crossword/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newClue.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/games/crossword/words', {
        word: newWord,
        clue: newClue,
      });

      setNewWord('');
      setNewClue('');
      fetchWords();
    } catch (error) {
      console.error('Error adding word:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return;

    try {
      await axios.delete(`/api/games/crossword/words?id=${id}`);
      fetchWords();
    } catch (error) {
      console.error('Error deleting word:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/admin"
                className="text-gray-500 hover:text-gray-700 transition"
              >
                Admin
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900">Crossword</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">🧩 Crossword Admin</h1>
            <p className="text-gray-600 mt-1">Manage words, clues, and view player statistics</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/games/crossword"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Play Game
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Back to Admin
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab('words')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'words'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Manage Words ({words.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'stats'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Statistics & Leaderboard ({sessions.length})
            </button>
          </div>
        </div>

        {activeTab === 'words' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Add New Word</h2>
              <form onSubmit={handleAddWord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Word
                  </label>
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter word"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clue
                  </label>
                  <input
                    type="text"
                    value={newClue}
                    onChange={(e) => setNewClue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter clue"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Adding...' : 'Add Word'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h2 className="text-xl font-semibold p-6 border-b">Word List</h2>
              {words.length === 0 ? (
                <p className="p-6 text-gray-500">No words added yet. Add your first word to get started!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Word
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clue
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {words.map((word) => (
                        <tr key={word.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {word.word.toUpperCase()}
                          </td>
                          <td className="px-6 py-4 text-gray-700">{word.clue}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDeleteWord(word.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b">Leaderboard</h2>
            {sessions.length === 0 ? (
              <p className="p-6 text-gray-500">No game sessions yet. Players will appear here after they complete games.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.map((session, index) => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-bold ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-900'}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {session.playerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                          {session.playerEmail || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {session.duration ? formatDuration(session.duration) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {session.correctAnswers}/{session.totalWords}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                          {new Date(session.startTime).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

