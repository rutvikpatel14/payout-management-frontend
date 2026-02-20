'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Payout, type PayoutAuditEntry, type Vendor } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/dateUtils';
import RejectPayoutModal from '@/components/RejectPayoutModal';
import { useCallback, useEffect, useState } from 'react';

export default function PayoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { token, user } = useAuth();
  const [payout, setPayout] = useState<(Payout & { audit?: PayoutAuditEntry[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchPayout = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError(null);
    const res = await api.getPayout(token, id);
    setLoading(false);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    if (res.data) setPayout(res.data);
  }, [token, id]);

  useEffect(() => {
    fetchPayout();
  }, [fetchPayout]);

  async function handleSubmit() {
    if (!token || !id || user?.role !== 'OPS') return;
    setActionLoading('submit');
    const res = await api.submitPayout(token, id);
    setActionLoading(null);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    if (res.data) setPayout((prev) => (prev ? { ...prev, ...res.data } : res.data!));
  }

  async function handleApprove() {
    if (!token || !id || user?.role !== 'FINANCE') return;
    setActionLoading('approve');
    const res = await api.approvePayout(token, id);
    setActionLoading(null);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    if (res.data) setPayout((prev) => (prev ? { ...prev, ...res.data } : res.data!));
  }

  async function handleReject(reason: string) {
    if (!token || !id || user?.role !== 'FINANCE') return;
    
    setError(null);
    setActionLoading('reject');
    const res = await api.rejectPayout(token, id, reason);
    setActionLoading(null);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    if (res.data) {
      setPayout((prev) => (prev ? { ...prev, ...res.data } : res.data!));
      setShowRejectModal(false);
    }
  }

  const vendor = payout?.vendor_id;
  const vendorName =
    vendor && typeof vendor === 'object' && 'name' in vendor
      ? (vendor as Vendor).name
      : '—';

  if (loading || !payout) {
    return (
      <div>
        <Link href="/payouts" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Payouts
        </Link>
        <p className="mt-4 text-zinc-500">{loading ? 'Loading…' : error || 'Payout not found.'}</p>
      </div>
    );
  }

  const canSubmit = user?.role === 'OPS' && payout.status === 'Draft';
  const canApprove = user?.role === 'FINANCE' && payout.status === 'Submitted';
  const canReject = user?.role === 'FINANCE' && payout.status === 'Submitted';

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/payouts" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Payouts
        </Link>
        <h1 className="text-2xl font-semibold text-zinc-900">Payout Details</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-zinc-900">Details</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-zinc-500">Vendor</dt>
              <dd className="font-medium text-zinc-900">{vendorName}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Amount</dt>
              <dd className="font-medium text-zinc-900">₹{Number(payout.amount).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Mode</dt>
              <dd className="text-zinc-900">{payout.mode}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Status</dt>
              <dd>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    payout.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : payout.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : payout.status === 'Submitted'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {payout.status}
                </span>
              </dd>
            </div>
            {payout.note && (
              <div>
                <dt className="text-zinc-500">Note</dt>
                <dd className="text-zinc-900">{payout.note}</dd>
              </div>
            )}
            {payout.status === 'Rejected' && payout.decision_reason && (
              <div>
                <dt className="text-zinc-500">Rejection reason</dt>
                <dd className="text-red-700">{payout.decision_reason}</dd>
              </div>
            )}
            <div>
              <dt className="text-zinc-500">Created</dt>
              <dd className="text-zinc-600">
                {formatDateTime(payout.createdAt)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-100 pt-4">
            {canSubmit && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!!actionLoading}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {actionLoading === 'submit' ? 'Submitting…' : 'Submit'}
              </button>
            )}
            {canApprove && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={!!actionLoading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === 'approve' ? 'Approving…' : 'Approve'}
              </button>
            )}
            {canReject && (
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={!!actionLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-zinc-900">Audit Trail</h2>
          {!payout.audit?.length ? (
            <p className="text-sm text-zinc-500">No audit entries yet.</p>
          ) : (
            <ul className="space-y-3">
              {payout.audit.map((a) => (
                <li
                  key={a._id}
                  className="flex flex-wrap items-baseline gap-2 border-b border-zinc-100 pb-2 last:border-0"
                >
                  <span className="font-medium text-zinc-900">{a.action}</span>
                  <span className="text-zinc-500">by {a.performed_by_email}</span>
                  <span className="text-zinc-400">
                    {formatDateTime(a.createdAt)}
                  </span>
                  {a.metadata?.decision_reason && (
                    <span className="w-full text-sm text-red-600">
                      Reason: {a.metadata.decision_reason}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <RejectPayoutModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        isLoading={actionLoading === 'reject'}
      />
    </div>
  );
}
