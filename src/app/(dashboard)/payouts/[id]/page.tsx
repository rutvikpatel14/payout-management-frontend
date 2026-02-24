'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Payout, type PayoutAuditEntry, type Vendor } from '@/lib/api';
import { formatDateTime } from '@/lib/dateUtils';
import RejectPayoutModal from '@/components/RejectPayoutModal';
import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  CreditCard,
  History,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

export default function PayoutDetailPage() {
  const params = useParams();
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPayout();
  }, [fetchPayout]);

  async function handleSubmit() {
    if (!token || !id || user?.role !== 'OPS') return;
    setActionLoading('submit');
    const res = await api.submitPayout(token, id);
    if (res.error) {
      setActionLoading(null);
      setError(res.message || res.error);
      return;
    }
    if (res.data) {
      await fetchPayout();
    }
    setActionLoading(null);
  }

  async function handleApprove() {
    if (!token || !id || user?.role !== 'FINANCE') return;
    setActionLoading('approve');
    const res = await api.approvePayout(token, id);
    if (res.error) {
      setActionLoading(null);
      setError(res.message || res.error);
      return;
    }
    if (res.data) {
      await fetchPayout();
    }
    setActionLoading(null);
  }

  async function handleReject(reason: string) {
    if (!token || !id || user?.role !== 'FINANCE') return;
    
    setError(null);
    setActionLoading('reject');
    const res = await api.rejectPayout(token, id, reason);
    if (res.error) {
      setActionLoading(null);
      setError(res.message || res.error);
      return;
    }
    if (res.data) {
      await fetchPayout();
      setShowRejectModal(false);
    }
    setActionLoading(null);
  }

  const vendor = payout?.vendor_id;
  const vendorName =
    vendor && typeof vendor === 'object' && 'name' in vendor
      ? (vendor as Vendor).name
      : '—';

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

  if (loading || !payout) {
    return (
      <div className="space-y-6">
        <Link
          href="/payouts"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Payouts
        </Link>
        <p className="text-gray-500">{loading ? 'Loading payout details...' : error || 'Payout not found.'}</p>
      </div>
    );
  }

  const canSubmit = user?.role === 'OPS' && payout.status === 'Draft';
  const canApprove = user?.role === 'FINANCE' && payout.status === 'Submitted';
  const canReject = user?.role === 'FINANCE' && payout.status === 'Submitted';

  return (
    <div className="space-y-6">
      <Link
        href="/payouts"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Payouts
      </Link>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm" role="alert">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Payout</h2>
            <Badge variant={getStatusVariant(payout.status)}>
              {payout.status}
            </Badge>
          </div>
          <p className="text-gray-500">
            Created on {formatDateTime(payout.createdAt)}
          </p>
        </div>

        <div className="flex gap-3">
          {canSubmit && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!!actionLoading}
              className="bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50"
            >
              {actionLoading === 'submit' ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}

          {canReject && (
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              disabled={!!actionLoading}
              className="bg-white text-red-600 border border-red-100 px-8 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all disabled:opacity-50"
            >
              Reject
            </button>
          )}

          {canApprove && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={!!actionLoading}
              className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-50"
            >
              {actionLoading === 'approve' ? 'Approving...' : 'Approve Payout'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6 md:p-7">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Payment Information
            </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Vendor
              </p>
              <p className="text-lg font-bold text-gray-900">{vendorName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Amount
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Number(payout.amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Payment Mode
              </p>
              <p className="font-bold text-gray-900">{payout.mode}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Last Updated
              </p>
              <p className="font-bold text-gray-900">{formatDateTime(payout.updatedAt)}</p>
            </div>
          </div>

          {payout.note && (
            <div className="mt-6 pt-6 border-t border-black/5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Notes from OPS
              </p>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-2xl italic">
                &quot;{payout.note}&quot;
              </p>
            </div>
          )}

          {payout.status === 'Rejected' && payout.decision_reason && (
            <div className="mt-6 pt-6 border-t border-red-50">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Rejection Reason
              </p>
              <p className="text-red-700 bg-red-50 p-4 rounded-2xl font-medium">
                &quot;{payout.decision_reason}&quot;
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-6 md:p-7">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              Audit History
          </h3>

            {!payout.audit?.length ? (
              <p className="text-sm text-gray-500">No audit entries yet.</p>
            ) : (
              <div className="space-y-6">
                {payout.audit.map((log, idx) => (
                  <div key={log._id} className="flex gap-4 relative">
                    {idx !== payout.audit!.length - 1 && (
                      <div className="absolute left-2.75 top-8 -bottom-6 w-0.5 bg-gray-100" />
                    )}
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center z-10 text-white',
                        log.action === 'APPROVED'
                          ? 'bg-emerald-600'
                          : log.action === 'REJECTED'
                            ? 'bg-red-600'
                            : log.action === 'SUBMITTED'
                              ? 'bg-blue-600'
                              : 'bg-gray-800'
                      )}
                    >
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-sm text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-400">{formatDateTime(log.createdAt)}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Performed by{' '}
                        <span className="font-semibold text-gray-700">{log.performed_by_email}</span>
                      </p>
                      {log.metadata?.decision_reason && (
                        <p className="mt-2 text-xs text-red-600 font-medium">
                          Reason: {log.metadata.decision_reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
