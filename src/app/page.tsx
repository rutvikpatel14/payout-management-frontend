'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (token === null) {
      router.replace('/login');
      return;
    }
    if (user) {
      router.replace('/payouts');
    }
  }, [user, token, router, mounted]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Redirecting...</p>
      </div>
    </div>
  );
}
