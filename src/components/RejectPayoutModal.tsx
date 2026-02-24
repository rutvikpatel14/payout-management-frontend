'use client';

import { useState } from 'react';
import { rejectPayoutSchema } from '@/lib/validation';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

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
      className="fixed inset-0 z-60 flex items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-2">
          Reject Payout Request
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Please provide a reason for rejecting this payout. This will be visible to the OPS team.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-0.5">
              Rejection Reason
            </p>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={4}
              disabled={isLoading}
              className={cn(
                'w-full bg-gray-50 border border-black/5 focus:border-red-500 focus:bg-white rounded-2xl py-3 px-4 outline-none transition-all mb-2 text-black placeholder:text-gray-400',
                error && 'border-red-300',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
              placeholder="e.g., Incorrect bank details, Missing invoice..."
              required
            />
            {error && (
              <div className="text-sm text-red-600 flex items-center gap-2" role="alert">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="md:flex-1 px-4 py-3 rounded-2xl font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="md:flex-1 bg-red-500 text-white px-4 py-3 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-md shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Rejecting...' : 'Confirm Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
