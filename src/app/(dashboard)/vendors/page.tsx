'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Vendor } from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, Plus, Search, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function VendorsPage() {
  const { token } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchVendors = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const res = await api.getVendors(token);
    setLoading(false);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    if (res.data) setVendors(res.data);
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchVendors();
  }, [fetchVendors]);

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    setError(null);
    const res = await api.deleteVendor(token!, id);
    setDeletingId(null);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    // Refresh the vendors list
    await fetchVendors();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Vendors</h2>
          <p className="text-gray-500 mt-0.5">Manage your trusted business partners</p>
        </div>

        <Link
          href="/vendors/new"
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Add Vendor
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm" role="alert">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-black/5">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-3 pl-12 pr-4 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-5 py-3 text-xs font-semibold text-black uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-black uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-black uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-black uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                    Loading vendors...
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                    No vendors found
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{vendor.name}</p>
                          <p className="text-xs text-gray-500">ID: #{vendor._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {vendor.upi_id && (
                          <p className="text-sm text-gray-600">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-tighter mr-2">
                              UPI:
                            </span>
                            {vendor.upi_id}
                          </p>
                        )}
                        {vendor.bank_account && (
                          <p className="text-sm text-gray-600">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-tighter mr-2">
                              Bank:
                            </span>
                            {vendor.bank_account} {vendor.ifsc ? `(${vendor.ifsc})` : ''}
                          </p>
                        )}
                        {!vendor.upi_id && !vendor.bank_account && (
                          <p className="text-sm text-gray-400 italic">No details provided</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {vendor.is_active ? (
                        <Badge variant="emerald">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </Badge>
                      ) : (
                        <Badge>
                          <XCircle className="w-3.5 h-3.5" />
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/vendors/${vendor._id}/edit`}
                          className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(vendor._id)}
                          disabled={deletingId === vendor._id}
                          className={cn(
                            'px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all',
                            deletingId === vendor._id && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {deletingId === vendor._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
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
