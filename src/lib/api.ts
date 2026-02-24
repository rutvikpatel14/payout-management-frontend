const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type User = { id: string; email: string; role: 'OPS' | 'FINANCE' };

export type ApiResult<T> = { data?: T; error?: string; message?: string };

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
): Promise<ApiResult<T>> {
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

function errorResult<T>(res: ApiResult<unknown>): ApiResult<T> {
  return { error: res.error || 'Error', message: res.message };
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getVendors: async (token: string): Promise<ApiResult<Vendor[]>> => {
    const res = await request<{ data: Vendor[] }>('/vendors', { token });
    if (res.error) return errorResult(res);
    return { data: res.data?.data ?? [] };
  },

  getVendor: async (token: string, id: string): Promise<ApiResult<Vendor>> => {
    const res = await request<{ data: Vendor[] }>('/vendors', { token });
    if (res.error) return errorResult(res);
    const vendor = res.data?.data?.find((v) => v._id === id);
    return vendor ? { data: vendor } : { error: 'Not found', message: 'Vendor not found' };
  },

  createVendor: async (
    token: string,
    body: { name: string; upi_id?: string; bank_account?: string; ifsc?: string; is_active?: boolean }
  ): Promise<ApiResult<Vendor>> => {
    const res = await request<{ data: Vendor }>('/vendors', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    });
    if (res.error) return errorResult(res);
    return { data: res.data?.data };
  },

  updateVendor: async (
    token: string,
    id: string,
    body: { name?: string; upi_id?: string; bank_account?: string; ifsc?: string; is_active?: boolean }
  ): Promise<ApiResult<Vendor>> => {
    const res = await request<{ data: Vendor }>(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    });
    if (res.error) return errorResult(res);
    return { data: res.data?.data };
  },

  deleteVendor: async (token: string, id: string): Promise<ApiResult<unknown>> =>
    request<unknown>(`/vendors/${id}`, {
      method: 'DELETE',
      token,
    }),

  getPayouts: async (
    token: string,
    params?: { status?: string; vendor_id?: string }
  ): Promise<ApiResult<Payout[]>> => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.vendor_id) q.set('vendor_id', params.vendor_id);
    const query = q.toString() ? `?${q.toString()}` : '';
    const res = await request<{ data: Payout[] }>(`/payouts${query}`, { token });
    if (res.error) return errorResult(res);
    return { data: res.data?.data ?? [] };
  },

  getPayout: async (
    token: string,
    id: string
  ): Promise<ApiResult<Payout & { audit?: PayoutAuditEntry[] }>> => {
    const res = await request<{ data: Payout & { audit?: PayoutAuditEntry[] } }>(`/payouts/${id}`, {
      token,
    });
    if (res.error) return errorResult(res);
    return { data: res.data?.data };
  },

  createPayout: async (
    token: string,
    body: { vendor_id: string; amount: number; mode: 'UPI' | 'IMPS' | 'NEFT'; note?: string }
  ): Promise<ApiResult<Payout>> => {
    const res = await request<{ data: Payout }>('/payouts', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    });
    if (res.error) return errorResult(res);
    return { data: res.data?.data };
  },

  submitPayout: async (token: string, id: string): Promise<ApiResult<Payout>> => {
    const res = await request<{ data: Payout }>(`/payouts/${id}/submit`, { method: 'POST', token });
    if (res.error) return errorResult(res);
    return { data: res.data?.data };
  },

  approvePayout: async (token: string, id: string): Promise<ApiResult<Payout>> => {
    const res = await request<{ data: Payout }>(`/payouts/${id}/approve`, {
      method: 'POST',
      token,
    });
    if (res.error) return errorResult(res);
    return { data: res.data?.data };
  },

  rejectPayout: async (
    token: string,
    id: string,
    decision_reason: string
  ): Promise<ApiResult<Payout>> => {
    const res = await request<{ data: Payout }>(`/payouts/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ decision_reason }),
      token,
    });
    if (res.error) return errorResult(res);
    return { data: res.data?.data };
  },
};
