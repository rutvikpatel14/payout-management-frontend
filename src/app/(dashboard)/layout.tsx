'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { CreditCard, LogOut, Menu, Users, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (token === null && pathname !== '/login') {
      router.replace('/login');
    }
  }, [token, pathname, router]);

  if (token === null) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Payouts', path: '/payouts', icon: CreditCard },
    { name: 'Vendors', path: '/vendors', icon: Users },
  ] as const;

  return (
    <div className="h-screen bg-[#f5f5f5] flex flex-col md:flex-row overflow-hidden">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-black/5 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              PayoutManager
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-black/5">
            <div className="flex items-center gap-3 px-4 py-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                {(user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-6 md:hidden">
          <h1 className="text-lg font-bold">PayoutManager</h1>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
