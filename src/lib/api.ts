const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type User = { id: string; email: string; role: 'OPS' | 'FINANCE' };

export type Vendor = {
  _id: string;
  name: string;
  upi_id?: string;
  bank_account?: string;
  ifsc?: string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Payout = {
  _id: string;
  vendor_id: Vendor | string;
  amount: number;
  mode: 'UPI' | 'IMPS' | 'NEFT';
  note?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  decision_reason?: string;
  createdAt?: string;
  updatedAt?: string;
  audit?: PayoutAuditEntry[];
};

export type PayoutAuditEntry = {
  _id: string;
  action: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  performed_by_email: string;
  createdAt: string;
  metadata?: { decision_reason?: string };
};

type ApiError = { error: string; message?: string };

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<{ data?: T; error?: string; message?: string }> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const body = await res.json().catch(() => ({})) as T | ApiError;
  if (!res.ok) {
    const err = body as ApiError;
    return { error: err.error || 'Error', message: err.message };
  }
  return { data: body as T };
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getVendors: (token: string) =>
    request<{ data: Vendor[] }>('/vendors', { token }).then((r) =>
      r.data ? { data: r.data.data } : r
    ),

  createVendor: (token: string, body: { name: string; upi_id?: string; bank_account?: string; ifsc?: string; is_active?: boolean }) =>
    request<{ data: Vendor }>('/vendors', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }).then((r) => (r.data ? { data: r.data.data } : r)),

  getPayouts: (token: string, params?: { status?: string; vendor_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.vendor_id) q.set('vendor_id', params.vendor_id);
    const query = q.toString() ? `?${q.toString()}` : '';
    return request<{ data: Payout[] }>(`/payouts${query}`, { token }).then((r) =>
      r.data ? { data: r.data.data } : r
    );
  },

  getPayout: (token: string, id: string) =>
    request<{ data: Payout & { audit?: PayoutAuditEntry[] } }>(`/payouts/${id}`, { token }).then(
      (r) => (r.data ? { data: r.data.data } : r)
    ),

  createPayout: (
    token: string,
    body: { vendor_id: string; amount: number; mode: 'UPI' | 'IMPS' | 'NEFT'; note?: string }
  ) =>
    request<{ data: Payout }>('/payouts', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }).then((r) => (r.data ? { data: r.data.data } : r)),

  submitPayout: (token: string, id: string) =>
    request<{ data: Payout }>(`/payouts/${id}/submit`, { method: 'POST', token }).then((r) =>
      r.data ? { data: r.data.data } : r
    ),

  approvePayout: (token: string, id: string) =>
    request<{ data: Payout }>(`/payouts/${id}/approve`, { method: 'POST', token }).then((r) =>
      r.data ? { data: r.data.data } : r
    ),

  rejectPayout: (token: string, id: string, decision_reason: string) =>
    request<{ data: Payout }>(`/payouts/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ decision_reason }),
      token,
    }).then((r) => (r.data ? { data: r.data.data } : r)),
};
