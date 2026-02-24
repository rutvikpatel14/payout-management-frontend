'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Payout, type Vendor } from '@/lib/api';
import { formatDateTime } from '@/lib/dateUtils';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { DropdownSelect } from '@/components/DropdownSelect';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPayouts();
  }, [fetchPayouts]);

  const vendorName = (p: Payout) => {
    const v = p.vendor_id;
    return typeof v === 'object' && v !== null && 'name' in v ? (v as Vendor).name : '—';
  };

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'Draft':
        return 'gray';
      case 'Submitted':
        return 'blue';
      case 'Approved':
        return 'emerald';
      case 'Rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Clock className="w-3.5 h-3.5" />;
      case 'Submitted':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'Approved':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Payout Requests</h2>
          <p className="text-gray-500 mt-0.5">Track and manage vendor disbursements</p>
        </div>

        {user?.role === 'OPS' && (
          <Link
            href="/payouts/new"
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            New Payout
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm" role="alert">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-black/5 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <DropdownSelect
              value={filterStatus}
              onChange={setFilterStatus}
              icon={<Filter className="w-5 h-5" />}
              placeholder="All Statuses"
              menuActiveClassName="bg-blue-600 text-white"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Draft', label: 'Draft' },
                { value: 'Submitted', label: 'Submitted' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Rejected', label: 'Rejected' },
              ]}
            />
          </div>

          <div className="flex-1 relative">
            <DropdownSelect
              value={filterVendor}
              onChange={setFilterVendor}
              icon={<Search className="w-5 h-5" />}
              placeholder="All Vendors"
              menuActiveClassName="bg-blue-600 text-white"
              options={[
                { value: '', label: 'All Vendors' },
                ...vendors.map((v) => ({ value: v._id, label: v.name })),
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vendor & Date
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Loading payouts...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    No payouts found
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{vendorName(payout)}</p>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(payout.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">₹{Number(payout.amount).toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="gray" className="px-2 py-1 rounded-lg">
                        {payout.mode}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={getStatusVariant(payout.status)}>
                        {getStatusIcon(payout.status)}
                        {payout.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/payouts/${payout._id}`}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all group-hover:scale-110"
                        aria-label="View payout"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
