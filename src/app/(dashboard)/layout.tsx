'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (token === null && pathname !== '/login') {
      router.replace('/login');
    }
  }, [token, pathname, router]);

  if (token === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <nav className="flex gap-6">
            <Link
              href="/payouts"
              className={`text-sm font-medium ${pathname?.startsWith('/payouts') ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Payouts
            </Link>
            <Link
              href="/vendors"
              className={`text-sm font-medium ${pathname?.startsWith('/vendors') ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Vendors
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600">
              {user?.email} <span className="text-zinc-400">({user?.role})</span>
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
