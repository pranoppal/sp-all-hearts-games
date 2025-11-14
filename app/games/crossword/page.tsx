'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CrosswordGame from '@/components/games/crossword/CrosswordGame';

export default function CrosswordPage() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [userHouse, setUserHouse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if email and house exist in localStorage
    const savedEmail = localStorage.getItem('userEmail');
    const savedHouse = localStorage.getItem('userHouse');
    if (savedEmail && savedHouse) {
      setUserEmail(savedEmail);
      setUserHouse(savedHouse);
      setLoading(false);
    } else {
      // Redirect to home if no email or house found
      router.push('/');
    }
  }, [router]);

  if (loading) {
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

  return <CrosswordGame playerEmail={userEmail} playerHouse={userHouse} />;
}
