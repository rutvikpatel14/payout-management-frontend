'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { vendorSchema, type VendorFormData } from '@/lib/validation';
import { useState } from 'react';

export default function NewVendorPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [upi_id, setUpiId] = useState('');
  const [bank_account, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [is_active, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof VendorFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setError(null);

    const validation = vendorSchema.safeParse({
      name,
      upi_id: upi_id || undefined,
      bank_account: bank_account || undefined,
      ifsc: ifsc || undefined,
      is_active,
    });

    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof VendorFormData, string>> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof VendorFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res:any = await api.createVendor(token!, {
      name: validation.data.name,
      upi_id: validation.data.upi_id || undefined,
      bank_account: validation.data.bank_account || undefined,
      ifsc: validation.data.ifsc || undefined,
      is_active: validation.data.is_active,
    });
    setLoading(false);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    router.push('/vendors');
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/vendors" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Vendors
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900">Add Vendor</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700">
              Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-zinc-900 ${
                errors.name
                  ? 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                  : 'border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              }`}
              placeholder="Vendor name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="upi_id" className="mb-1 block text-sm font-medium text-zinc-700">
              UPI ID (optional)
            </label>
            <input
              id="upi_id"
              type="text"
              value={upi_id}
              onChange={(e) => {
                setUpiId(e.target.value);
                if (errors.upi_id) setErrors((prev) => ({ ...prev, upi_id: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-zinc-900 ${
                errors.upi_id
                  ? 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                  : 'border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              }`}
              placeholder="vendor@upi"
            />
            {errors.upi_id && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.upi_id}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="bank_account" className="mb-1 block text-sm font-medium text-zinc-700">
              Bank account (optional)
            </label>
            <input
              id="bank_account"
              type="text"
              value={bank_account}
              onChange={(e) => {
                setBankAccount(e.target.value);
                if (errors.bank_account) setErrors((prev) => ({ ...prev, bank_account: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-zinc-900 ${
                errors.bank_account
                  ? 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                  : 'border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.bank_account && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.bank_account}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="ifsc" className="mb-1 block text-sm font-medium text-zinc-700">
              IFSC (optional)
            </label>
            <input
              id="ifsc"
              type="text"
              value={ifsc}
              onChange={(e) => {
                setIfsc(e.target.value);
                if (errors.ifsc) setErrors((prev) => ({ ...prev, ifsc: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-zinc-900 ${
                errors.ifsc
                  ? 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                  : 'border-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.ifsc && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.ifsc}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={is_active}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            <label htmlFor="is_active" className="text-sm text-zinc-700">
              Active
            </label>
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
            {loading ? 'Saving…' : 'Save'}
          </button>
          <Link
            href="/vendors"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
