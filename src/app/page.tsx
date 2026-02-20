'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <p className="text-zinc-500">Redirecting…</p>
    </div>
  );
}
