'use client';

import { useState } from 'react';
import { rejectPayoutSchema } from '@/lib/validation';

type RejectPayoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
};

export default function RejectPayoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: RejectPayoutModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = rejectPayoutSchema.safeParse({ decision_reason: reason });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please enter a valid rejection reason.');
      return;
    }

    await onConfirm(validation.data.decision_reason);
    setReason('');
    setError(null);
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">Reject Payout</h2>
        <p className="mb-4 text-sm text-zinc-600">
          Please provide a reason for rejecting this payout. This reason will be recorded in the audit trail.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reject-reason" className="mb-1 block text-sm font-medium text-zinc-700">
              Rejection Reason *
            </label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={4}
              disabled={isLoading}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-zinc-300 focus:border-blue-500 focus:ring-blue-500'
              } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              placeholder="Enter the reason for rejection..."
              required
            />
            {error && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
