'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Payout, type Vendor } from '@/lib/api';
import { formatDate } from '@/lib/dateUtils';
import { useCallback, useEffect, useState } from 'react';

export default function PayoutsPage() {
  const { token, user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVendor, setFilterVendor] = useState('');

  const fetchPayouts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const res = await api.getPayouts(token, {
      ...(filterStatus && { status: filterStatus }),
      ...(filterVendor && { vendor_id: filterVendor }),
    });
    setLoading(false);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    if (res.data) setPayouts(res.data);
  }, [token, filterStatus, filterVendor]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const vRes = await api.getVendors(token);
      if (vRes.data) setVendors(vRes.data);
    })();
  }, [token]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const vendorName = (p: Payout) => {
    const v = p.vendor_id;
    return typeof v === 'object' && v !== null && 'name' in v ? (v as Vendor).name : '—';
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Payouts</h1>
        {user?.role === 'OPS' && (
          <Link
            href="/payouts/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New Payout
          </Link>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
        >
          <option value="">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select
          value={filterVendor}
          onChange={(e) => setFilterVendor(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
        >
          <option value="">All vendors</option>
          {vendors.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-zinc-500">Loading payouts…</p>
      ) : payouts.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-zinc-500">
          No payouts found.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-700">Vendor</th>
                <th className="px-4 py-3 font-medium text-zinc-700">Amount</th>
                <th className="px-4 py-3 font-medium text-zinc-700">Mode</th>
                <th className="px-4 py-3 font-medium text-zinc-700">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-700">Created</th>
                <th className="px-4 py-3 font-medium text-zinc-700"></th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p._id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 text-zinc-900">{vendorName(p)}</td>
                  <td className="px-4 py-3 text-zinc-900">₹{Number(p.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-600">{p.mode}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : p.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : p.status === 'Submitted'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/payouts/${p._id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View
                    </Link>
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
