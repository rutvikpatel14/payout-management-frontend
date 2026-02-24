'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validation';
import { AlertCircle, CreditCard, Lock, Mail } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, token } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user && token) {
      router.replace('/payouts');
    }
  }, [user, token, router, mounted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof LoginFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await login(validation.data.email, validation.data.password);
    setLoading(false);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    router.replace('/payouts');
  }

  if (!mounted) {
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

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-4xl shadow-sm border border-black/5 p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to manage vendor payouts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={cn(
                    'pl-12 pr-4',
                    errors.email && 'border-red-300 focus:border-red-500'
                  )}
                  placeholder="ops@demo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 ml-1 text-xs font-medium text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={cn(
                    'pl-12 pr-4',
                    errors.password && 'border-red-300 focus:border-red-500'
                  )}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-2 ml-1 text-xs font-medium text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-black/10 active:scale-[0.98]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-black/5 text-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
              Demo Credentials
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="font-bold text-gray-900">OPS</p>
                <p className="text-gray-500">ops@demo.com</p>
                <p className="text-gray-500">ops123</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="font-bold text-gray-900">FINANCE</p>
                <p className="text-gray-500">finance@demo.com</p>
                <p className="text-gray-500">fin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
