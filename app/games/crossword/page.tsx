'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CrosswordGame from '@/components/games/crossword/CrosswordGame';
import { getHouseById } from '@/lib/shared/houses';

export default function CrosswordPage() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [userHouse, setUserHouse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [gameStatus, setGameStatus] = useState<'active' | 'upcoming' | 'ended' | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initPage = async () => {
      // Check if email and house exist in localStorage
      const savedEmail = localStorage.getItem('userEmail');
      const savedHouse = localStorage.getItem('userHouse');
      
      if (savedEmail && savedHouse) {
        setUserEmail(savedEmail);
        setUserHouse(savedHouse);
        
        // Check game timing
        try {
          const timingsResponse = await axios.get('/api/game-timings');
          const timings = timingsResponse.data;
          const crosswordTiming = timings.find((t: any) => t.game === 'crossword');
          
          if (crosswordTiming) {
            const now = new Date();
            const start = new Date(crosswordTiming.start);
            const end = new Date(crosswordTiming.end);
            
            if (now < start) {
              setGameStatus('upcoming');
            } else if (now > end) {
              setGameStatus('ended');
            } else {
              setGameStatus('active');
            }
          } else {
            setGameStatus('active'); // No timing found, assume active
          }
        } catch (error) {
          console.error('Error checking game timing:', error);
          setGameStatus('active'); // Default to active on error
        }
        
        // Check if user has already played
        try {
          const response = await axios.get('/api/games/crossword/sessions');
          const sessions = response.data;
          
          // Check if this user has completed the game before
          const userSession = sessions.find(
            (session: any) => 
              session.playerEmail === savedEmail && 
              session.completed === true
          );
          
          if (userSession) {
            setHasPlayed(true);
          }
        } catch (error) {
          console.error('Error checking game status:', error);
        }
        
        setCheckingStatus(false);
        setLoading(false);
      } else {
        // Redirect to home if no email or house found
        router.push('/');
      }
    };

    initPage();
  }, [router]);

  if (loading || checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userEmail || !userHouse) {
    return null; // Will redirect
  }

  // Check if game is not active
  if (gameStatus === 'upcoming' || gameStatus === 'ended') {
    const houseData = getHouseById(userHouse);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">{gameStatus === 'upcoming' ? '🔒' : '⏰'}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {gameStatus === 'upcoming' ? 'Game Not Started Yet' : 'Game Has Ended'}
            </h1>
            <p className="text-gray-600 mb-6">
              {gameStatus === 'upcoming'
                ? 'This game hasn\'t started yet. Please check back when the game opens!'
                : 'This game has ended and is no longer accepting submissions.'}
            </p>
            
            {houseData && (
              <div className={`p-4 rounded-lg ${houseData.bgColor} ${houseData.borderColor} border-2 mb-6`}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{houseData.emoji}</span>
                  <div>
                    <p className="text-sm text-gray-600">Playing for</p>
                    <p className={`text-xl font-bold ${houseData.color}`}>
                      {houseData.name} House
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/leaderboard"
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                🏆 View Leaderboard
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                ← Back to Games
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user has already played, show message
  if (hasPlayed) {
    const houseData = getHouseById(userHouse);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              You&apos;ve Already Played!
            </h1>
            <p className="text-gray-600 mb-6">
              You&apos;ve already completed the Crossword game. Each player can only play once to keep the competition fair!
            </p>
            
            {houseData && (
              <div className={`p-4 rounded-lg ${houseData.bgColor} ${houseData.borderColor} border-2 mb-6`}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{houseData.emoji}</span>
                  <div>
                    <p className="text-sm text-gray-600">Playing for</p>
                    <p className={`text-xl font-bold ${houseData.color}`}>
                      {houseData.name} House
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/leaderboard"
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                🏆 View Leaderboard
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                ← Back to Games
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Your score has been recorded and contributes to your house&apos;s total points!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <CrosswordGame playerEmail={userEmail} playerHouse={userHouse} />;
}
