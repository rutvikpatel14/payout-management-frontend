'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { vendorSchema, type VendorFormData } from '@/lib/validation';
import { useState } from 'react';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Input } from '@/components/ui/Input';

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
    const res = await api.createVendor(token!, {
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
    <div className="space-y-3">
      <Link
        href="/vendors"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Vendors
      </Link>

      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-black tracking-tight">Add New Vendor</h2>
        <p className="text-gray-500 mt-0.5">Create and manage vendor payment details</p>

        {error && (
          <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-2xl flex items-center gap-3 text-sm" role="alert">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6 bg-white rounded-3xl border border-black/5 shadow-sm p-6 md:p-8"
        >
          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2 ml-1">
              Vendor Name *
            </label>
            <Input
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={cn(
                errors.name && 'border-red-300 focus:border-red-500'
              )}
              placeholder="Acme Corp"
            />
            {errors.name && (
              <p className="mt-2 ml-1 text-xs font-medium text-red-600" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2 ml-1">
                UPI ID (Optional)
              </label>
              <Input
                value={upi_id}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  if (errors.upi_id) setErrors((prev) => ({ ...prev, upi_id: undefined }));
                }}
                className={cn(
                  errors.upi_id && 'border-red-300 focus:border-red-500'
                )}
                placeholder="vendor@upi"
              />
              {errors.upi_id && (
                <p className="mt-2 ml-1 text-xs font-medium text-red-600" role="alert">
                  {errors.upi_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2 ml-1">
                Bank Account (Optional)
              </label>
              <Input
                value={bank_account}
                onChange={(e) => {
                  setBankAccount(e.target.value);
                  if (errors.bank_account) setErrors((prev) => ({ ...prev, bank_account: undefined }));
                }}
                className={cn(
                  errors.bank_account && 'border-red-300 focus:border-red-500'
                )}
                placeholder="1234567890"
              />
              {errors.bank_account && (
                <p className="mt-2 ml-1 text-xs font-medium text-red-600" role="alert">
                  {errors.bank_account}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2 ml-1">
              IFSC Code (Optional)
            </label>
            <Input
              value={ifsc}
              onChange={(e) => {
                setIfsc(e.target.value);
                if (errors.ifsc) setErrors((prev) => ({ ...prev, ifsc: undefined }));
              }}
              className={cn(
                errors.ifsc && 'border-red-300 focus:border-red-500'
              )}
              placeholder="SBIN0001234"
            />
            {errors.ifsc && (
              <p className="mt-2 ml-1 text-xs font-medium text-red-600" role="alert">
                {errors.ifsc}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_active"
              type="checkbox"
              checked={is_active}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300"
            />
            <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
              Active
            </label>
          </div>

          <div className="pt-2 flex flex-col md:flex-row gap-3">
            <Link
              href="/vendors"
              className="md:w-1/2 inline-flex items-center justify-center px-4 py-4 rounded-2xl font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="md:w-1/2 inline-flex items-center justify-center bg-black text-white px-4 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-md shadow-black/10 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? 'Saving...' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
