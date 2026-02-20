'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Vendor } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function VendorsPage() {
  const { token } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      setError(null);
      const res:any = await api.getVendors(token);
      setLoading(false);
      if (res.error) {
        setError(res.message || res.error);
        return;
      }
      if (res.data) setVendors(res.data);
    })();
  }, [token]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Vendors</h1>
        <Link
          href="/vendors/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Add Vendor
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500">Loading vendors…</p>
      ) : vendors.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-zinc-500">
          No vendors yet. Add one to get started.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-700">UPI ID</th>
                <th className="px-4 py-3 font-medium text-zinc-700">Bank account</th>
                <th className="px-4 py-3 font-medium text-zinc-700">IFSC</th>
                <th className="px-4 py-3 font-medium text-zinc-700">Active</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-900">{v.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{v.upi_id || '—'}</td>
                  <td className="px-4 py-3 text-zinc-600">{v.bank_account || '—'}</td>
                  <td className="px-4 py-3 text-zinc-600">{v.ifsc || '—'}</td>
                  <td className="px-4 py-3">
                    {v.is_active ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-zinc-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
