'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Vendor } from '@/lib/api';
import { payoutSchema, type PayoutFormData } from '@/lib/validation';
import { useEffect, useState } from 'react';

export default function NewPayoutPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendor_id, setVendorId] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'UPI' | 'IMPS' | 'NEFT'>('UPI');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof PayoutFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'OPS') {
      router.replace('/payouts');
      return;
    }
    if (!token) return;
    api.getVendors(token).then((r:any) => {
      if (r.data) setVendors(r.data);
      if (r.data?.length) setVendorId(r.data[0]._id);
    });
  }, [token, user?.role, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setError(null);

    const validation = payoutSchema.safeParse({
      vendor_id,
      amount,
      mode,
      note: note || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof PayoutFormData, string>> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          const fieldName = issue.path[0] as keyof PayoutFormData;
          // Prioritize "required" messages over other validation errors
          if (!fieldErrors[fieldName] || issue.message.toLowerCase().includes('required')) {
            fieldErrors[fieldName] = issue.message;
          }
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res:any = await api.createPayout(token!, {
      vendor_id: validation.data.vendor_id,
      amount: parseFloat(validation.data.amount),
      mode: validation.data.mode,
      note: validation.data.note || '',
    });
    setLoading(false);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    if (res.data) router.push(`/payouts/${res.data._id}`);
  }

  if (user?.role !== 'OPS') return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/payouts" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Payouts
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900">Create Payout</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="vendor" className="mb-1 block text-sm font-medium text-zinc-700">
              Vendor *
            </label>
            <select
              id="vendor"
              value={vendor_id}
              onChange={(e) => {
                setVendorId(e.target.value);
                if (errors.vendor_id) setErrors((prev) => ({ ...prev, vendor_id: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-zinc-900 ${
                errors.vendor_id
                  ? 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                  : 'border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              }`}
            >
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
            {errors.vendor_id && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.vendor_id}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium text-zinc-700">
              Amount (₹) *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-zinc-900 ${
                errors.amount
                  ? 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                  : 'border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              }`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.amount}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="mode" className="mb-1 block text-sm font-medium text-zinc-700">
              Mode *
            </label>
            <select
              id="mode"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as 'UPI' | 'IMPS' | 'NEFT');
                if (errors.mode) setErrors((prev) => ({ ...prev, mode: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-zinc-900 ${
                errors.mode
                  ? 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                  : 'border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              }`}
            >
              <option value="UPI">UPI</option>
              <option value="IMPS">IMPS</option>
              <option value="NEFT">NEFT</option>
            </select>
            {errors.mode && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.mode}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="note" className="mb-1 block text-sm font-medium text-zinc-700">
              Note (optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (errors.note) setErrors((prev) => ({ ...prev, note: undefined }));
              }}
              rows={2}
              className={`w-full rounded-lg border px-3 py-2 text-zinc-900 ${
                errors.note
                  ? 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                  : 'border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.note && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.note}
              </p>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create (Draft)'}
          </button>
          <Link
            href="/payouts"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
