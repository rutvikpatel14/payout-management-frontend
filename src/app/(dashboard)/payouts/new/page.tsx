"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Vendor } from "@/lib/api";
import { payoutSchema, type PayoutFormData } from "@/lib/validation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  CreditCard,
  IndianRupee,
  MessageSquare,
  Search,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { DropdownSelect } from "@/components/DropdownSelect";
import { Input } from "@/components/ui/Input";

export default function NewPayoutPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendor_id, setVendorId] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"UPI" | "IMPS" | "NEFT">("UPI");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof PayoutFormData, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "OPS") {
      router.replace("/payouts");
      return;
    }
    if (!token) return;
    api.getVendors(token).then((r) => {
      if (r.data) setVendors(r.data);
      if (r.data?.length) setVendorId(r.data[0]._id);
    });
  }, [token, user?.role, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setError(null);

    const validation = payoutSchema.safeParse({
      vendor_id,
      amount,
      mode,
      note: note || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof PayoutFormData, string>> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          const fieldName = issue.path[0] as keyof PayoutFormData;
          // Prioritize "required" messages over other validation errors
          if (
            !fieldErrors[fieldName] ||
            issue.message.toLowerCase().includes("required")
          ) {
            fieldErrors[fieldName] = issue.message;
          }
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await api.createPayout(token!, {
      vendor_id: validation.data.vendor_id,
      amount: parseFloat(validation.data.amount),
      mode: validation.data.mode,
      note: validation.data.note || "",
    });
    setLoading(false);
    if (res.error) {
      setError(res.message || res.error);
      return;
    }
    if (res.data) router.push(`/payouts/${res.data._id}`);
  }

  if (user?.role !== "OPS") return null;

  return (
    <div className="space-y-3">
      <Link
        href="/payouts"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Payouts
      </Link>

      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-black tracking-tight">
          Create Payout Request
        </h2>

        {error && (
          <div
            className="mt-4 bg-red-50 text-red-600 p-3 rounded-2xl flex items-center gap-3 text-sm"
            role="alert"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6 bg-white rounded-3xl border border-black/5 shadow-sm p-6 md:p-8"
        >
          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-3 ml-1">
              Select Vendor *
            </label>
            <div className="flex-1 relative">
              <DropdownSelect
                value={vendor_id}
                onChange={(next) => {
                  setVendorId(next);
                  if (errors.vendor_id)
                    setErrors((prev) => ({ ...prev, vendor_id: undefined }));
                }}
                icon={<Search className="w-5 h-5" />}
                placeholder="All Vendors"
                menuActiveClassName="bg-blue-600 text-white"
                options={[
                  { value: "", label: "All Vendors" },
                  ...vendors.map((v) => ({ value: v._id, label: v.name })),
                ]}
              />
            </div>
            {errors.vendor_id && (
              <p
                className="mt-2 ml-1 text-xs font-medium text-red-600"
                role="alert"
              >
                {errors.vendor_id}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-3 ml-1">
                Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                <Input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount)
                      setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  className={cn(
                    "pl-12 pr-4",
                    errors.amount && "border-red-300 focus:border-red-500",
                  )}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p
                  className="mt-2 ml-1 text-xs font-medium text-red-600"
                  role="alert"
                >
                  {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-3 ml-1">
                Payment Mode *
              </label>
              <DropdownSelect
                value={mode}
                onChange={(next) => {
                  setMode(next as "UPI" | "IMPS" | "NEFT");
                  if (errors.mode)
                    setErrors((prev) => ({ ...prev, mode: undefined }));
                }}
                icon={<CreditCard className="w-5 h-5" />}
                placeholder="Select payment mode"
                menuActiveClassName="bg-blue-600 text-white"
                options={[
                  { value: "UPI", label: "UPI" },
                  { value: "IMPS", label: "IMPS" },
                  { value: "NEFT", label: "NEFT" },
                ]}
              />
              {errors.mode && (
                <p
                  className="mt-2 ml-1 text-xs font-medium text-red-600"
                  role="alert"
                >
                  {errors.mode}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-3 ml-1">
              Note (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  if (errors.note)
                    setErrors((prev) => ({ ...prev, note: undefined }));
                }}
                rows={3}
                className={cn(
                  "w-full bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-black placeholder:text-gray-400",
                  errors.note && "border-red-300 focus:border-red-500",
                )}
                placeholder="Add any specific instructions or context..."
              />
            </div>
            {errors.note && (
              <p
                className="mt-2 ml-1 text-xs font-medium text-red-600"
                role="alert"
              >
                {errors.note}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col md:flex-row gap-3">
            <Link
              href="/payouts"
              className="md:w-1/2 inline-flex items-center justify-center px-4 py-4 rounded-2xl font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="md:w-1/2 inline-flex items-center justify-center bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-md shadow-black/10 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? "Creating..." : "Create Payout"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
