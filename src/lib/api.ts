import { formatNgn } from "@/lib/format";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const money = formatNgn;

// Uploaded file URLs (KYC documents, chat attachments, payment proofs) come
// back from the backend as paths relative to the API server (e.g.
// "/uploads/xyz.png"), not the frontend origin — resolving them bare in a
// browser hits the Next.js app instead of the API and 404s. Anywhere one of
// these is rendered as an href or img src, run it through this first.
export function fileUrl(path: string) {
  if (!path || /^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Held in memory only (not localStorage) so an XSS bug can't just read it
// off disk — a page refresh re-derives it via the httpOnly refresh cookie.
let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, opts: FetchOptions = {}, retry = true): Promise<T> {
  const headers = new Headers(opts.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  let body: BodyInit | undefined;
  if (opts.body instanceof FormData) {
    body = opts.body;
  } else if (opts.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    body,
    credentials: "include",
  });

  if (res.status === 401 && retry && path !== "/api/v1/auth/refresh") {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, opts, false);
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      message = JSON.parse(text).error ?? text;
    } catch {
      // not JSON, use raw text
    }
    throw new ApiError(res.status, message || `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, { method: "POST", credentials: "include" });
    if (!res.ok) return false;
    const data = (await res.json()) as { accessToken: string };
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export { tryRefresh };

// ---- Types (mirror the Go handler DTOs) ----

export type UserDTO = {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: "user" | "admin";
  kycStatus: "unverified" | "pending" | "verified" | "rejected";
  disabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
};

export type AdDTO = {
  id: string;
  ownerId: string;
  side: "buy" | "sell";
  asset: string;
  fiat: string;
  rateType: "fixed" | "floating_margin";
  fixedRate: number;
  floatingMarginPct: number;
  minLimit: number;
  maxLimit: number;
  availableAmount: number;
  paymentMethods: string;
  terms: string;
  status: "active" | "paused" | "closed";
};

export type OrderDTO = {
  id: string;
  adId: string;
  side: "buy" | "sell";
  buyerId: string;
  sellerId: string;
  buyerName?: string;
  sellerName?: string;
  asset: string;
  fiat: string;
  amount: number;
  rate: number;
  fiatAmount: number;
  status:
    | "created"
    | "awaiting_payment"
    | "payment_marked"
    | "payment_confirmed"
    | "released"
    | "completed"
    | "cancelled"
    | "disputed";
  payoutAddress?: string;
  payoutChain?: string;
  depositTxId?: string;
  paymentDeadline: string;
  paymentProofUrl: string;
  createdAt: string;
};

export type MessageDTO = {
  id: string;
  orderId: string;
  senderId: string;
  body: string;
  attachmentUrl?: string;
  createdAt: string;
};

export type BalanceDTO = { asset: string; available: number; locked: number };

export type LedgerEntryDTO = {
  id: string;
  asset: string;
  bucket: string;
  direction: string;
  amount: number;
  reason: string;
  orderId?: string;
  note?: string;
  createdAt: string;
};

export type KYCDTO = {
  id: string;
  fullName: string;
  idType: string;
  idNumber: string;
  documentUrl: string;
  status: "unverified" | "pending" | "verified" | "rejected";
  reviewNote?: string;
};

export type DisputeDTO = {
  id: string;
  orderId: string;
  raisedBy: string;
  reason: string;
  status: "open" | "resolved";
  resolution?: string;
};

export type WhitelistedAddressDTO = {
  id: string;
  address: string;
  chain: string;
  asset: string;
  addedByAdminId: string;
  createdAt: string;
};

export type DepositAddressDTO = {
  id: string;
  asset: string;
  chain: string;
  address: string;
  tag?: string;
  addedByAdminId: string;
  updatedAt: string;
};

export const api = {
  // auth
  register: (input: { email: string; password: string; fullName: string; phone?: string }) =>
    request<{ user: UserDTO; accessToken: string }>("/api/v1/auth/register", { method: "POST", body: input }),
  login: (input: { email: string; password: string }) =>
    request<{ user: UserDTO; accessToken: string }>("/api/v1/auth/login", { method: "POST", body: input }),
  logout: () => request<void>("/api/v1/auth/logout", { method: "POST" }),
  me: () => request<UserDTO>("/api/v1/auth/me"),
  updateMe: (input: { fullName: string; phone: string; bankName?: string; bankAccountNumber?: string; bankAccountName?: string }) =>
    request<UserDTO>("/api/v1/auth/me", { method: "PATCH", body: input }),
  forgotPassword: (email: string) =>
    request<void>("/api/v1/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token: string, password: string) =>
    request<void>("/api/v1/auth/reset-password", { method: "POST", body: { token, password } }),
  verifyEmail: (token: string) =>
    request<void>("/api/v1/auth/verify-email", { method: "POST", body: { token } }),
  resendVerification: (email: string) =>
    request<void>("/api/v1/auth/resend-verification", { method: "POST", body: { email } }),

  // ads
  listAds: (params?: { side?: "buy" | "sell"; asset?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<AdDTO[]>(`/api/v1/ads${qs ? `?${qs}` : ""}`);
  },
  getAd: (id: string) => request<AdDTO>(`/api/v1/ads/${id}`),
  adminCreateAd: (input: Partial<AdDTO>) => request<AdDTO>("/api/v1/admin/ads", { method: "POST", body: input }),
  adminListMyAds: () => request<AdDTO[]>("/api/v1/admin/ads/mine"),
  adminUpdateAd: (id: string, input: Partial<AdDTO>) =>
    request<AdDTO>(`/api/v1/admin/ads/${id}`, { method: "PATCH", body: input }),

  // orders
  createOrder: (input: { adId: string; assetAmount: number; payoutAddress?: string; payoutChain?: string }) =>
    request<OrderDTO>("/api/v1/orders", { method: "POST", body: input }),
  getOrder: (id: string) => request<OrderDTO>(`/api/v1/orders/${id}`),
  listMyOrders: () => request<OrderDTO[]>("/api/v1/orders/mine"),
  markPaid: (id: string, proofUrl: string) =>
    request<OrderDTO>(`/api/v1/orders/${id}/mark-paid`, { method: "POST", body: { proofUrl } }),
  depositInstructions: (id: string) =>
    request<{ address: string; chain: string; tag: string }>(`/api/v1/orders/${id}/deposit-instructions`),
  paymentInstructions: (id: string) =>
    request<{ bankName: string; accountNumber: string; accountName: string }>(`/api/v1/orders/${id}/payment-instructions`),
  submitDeposit: (id: string, txId: string) =>
    request<OrderDTO>(`/api/v1/orders/${id}/submit-deposit`, { method: "POST", body: { txId } }),
  confirmPayment: (id: string) => request<OrderDTO>(`/api/v1/orders/${id}/confirm-payment`, { method: "POST" }),
  cancelOrder: (id: string) => request<OrderDTO>(`/api/v1/orders/${id}/cancel`, { method: "POST" }),
  adminListOrders: () => request<OrderDTO[]>("/api/v1/admin/orders"),
  adminListAllOrders: () => request<OrderDTO[]>("/api/v1/admin/orders/all"),
  adminReleaseOrder: (id: string) => request<OrderDTO>(`/api/v1/admin/orders/${id}/release`, { method: "POST" }),
  adminListWhitelist: () => request<WhitelistedAddressDTO[]>("/api/v1/admin/wallet-whitelist"),
  adminMarkWhitelisted: (input: { address: string; chain: string; asset: string }) =>
    request<WhitelistedAddressDTO>("/api/v1/admin/wallet-whitelist", { method: "POST", body: input }),
  adminListDepositAddresses: () => request<DepositAddressDTO[]>("/api/v1/admin/deposit-addresses"),
  adminSetDepositAddress: (input: { asset: string; chain: string; address: string; tag?: string }) =>
    request<DepositAddressDTO>("/api/v1/admin/deposit-addresses", { method: "POST", body: input }),

  // chat
  getMessages: (orderId: string) => request<MessageDTO[]>(`/api/v1/orders/${orderId}/messages`),

  // wallet
  balances: () => request<BalanceDTO[]>("/api/v1/wallet/balances"),
  history: () => request<LedgerEntryDTO[]>("/api/v1/wallet/history"),
  adminCredit: (input: { userId: string; asset: string; amount: number; note?: string }) =>
    request<void>("/api/v1/admin/wallet/credit", { method: "POST", body: input }),

  // kyc
  submitKYC: (form: FormData) => request<KYCDTO>("/api/v1/kyc", { method: "POST", body: form }),
  myKYC: () => request<KYCDTO>("/api/v1/kyc/me"),
  adminListPendingKYC: () => request<KYCDTO[]>("/api/v1/admin/kyc/pending"),
  adminReviewKYC: (id: string, approve: boolean, note?: string) =>
    request<KYCDTO>(`/api/v1/admin/kyc/${id}/review`, { method: "POST", body: { approve, note } }),

  // disputes
  raiseDispute: (orderId: string, reason: string) =>
    request<DisputeDTO>("/api/v1/disputes", { method: "POST", body: { orderId, reason } }),
  adminListOpenDisputes: () => request<DisputeDTO[]>("/api/v1/admin/disputes"),
  adminResolveDispute: (id: string, resolution: "release_to_buyer" | "refund_to_seller") =>
    request<DisputeDTO>(`/api/v1/admin/disputes/${id}/resolve`, { method: "POST", body: { resolution } }),

  // admin
  adminListUsers: () => request<UserDTO[]>("/api/v1/admin/users"),
  adminSetUserDisabled: (id: string, disabled: boolean) =>
    request<void>(`/api/v1/admin/users/${id}/disabled`, { method: "PATCH", body: { disabled } }),
  adminBybitBalance: () => request<Record<string, number>>("/api/v1/admin/bybit/balance"),

  // uploads
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ url: string }>("/api/v1/uploads", { method: "POST", body: form });
  },
};

export function wsBase() {
  return API_BASE.replace(/^http/, "ws");
}
