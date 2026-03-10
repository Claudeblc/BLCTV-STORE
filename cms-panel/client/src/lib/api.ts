/**
 * API client for BLCTV CMS Panel
 * Connects to the backend on the remote server (51.159.23.253)
 */

const API_BASE = "http://51.159.23.253/api/admin";

function getToken(): string | null {
  return localStorage.getItem("reseller_token");
}

export function setToken(token: string) {
  localStorage.setItem("reseller_token", token);
}

export function clearToken() {
  localStorage.removeItem("reseller_token");
  localStorage.removeItem("reseller_data");
}

export function getStoredReseller(): ResellerData | null {
  const data = localStorage.getItem("reseller_data");
  return data ? JSON.parse(data) : null;
}

export function setStoredReseller(reseller: ResellerData) {
  localStorage.setItem("reseller_data", JSON.stringify(reseller));
}

export interface ResellerData {
  id: number;
  username: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  points: number;
  role: "super_admin" | "admin";
  parentResellerId: number | null;
  status: string;
  mustChangePassword?: boolean;
}

export interface License {
  id: number;
  macAddress: string;
  deviceName: string | null;
  status: "trial" | "active" | "expired" | "blocked";
  trialStartedAt: string;
  trialDurationMs: number;
  activatedAt: string | null;
  expiresAt: string | null;
  planId: number | null;
  resellerId: number | null;
  email: string | null;
  customerName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: number;
  name: string;
  description: string | null;
  durationDays: number;
  priceCents: number;
  currency: string;
  pointsCost: number;
  active: boolean;
  sortOrder: number;
}

export interface PointTransaction {
  id: number;
  resellerId: number;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string | null;
  licenseId: number | null;
  relatedResellerId: number | null;
  processedBy: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  trialDevices: number;
  expiredDevices: number;
  blockedDevices: number;
  totalResellers: number;
  totalPoints: number;
  totalPayments: number;
  blockingDisabled?: boolean;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { "X-Reseller-Token": token } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = "/";
    throw new Error("Session expirée");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Erreur ${response.status}`);
  }
  return data;
}

// Auth
export async function login(username: string, password: string) {
  return apiRequest<{
    success: boolean;
    token: string;
    mustChangePassword: boolean;
    reseller: ResellerData;
  }>("/reseller/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function forceChangePassword(currentPassword: string, newPassword: string) {
  return apiRequest<{ success: boolean }>("/reseller/force-change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// Super Admin
export async function getSuperDashboard() {
  return apiRequest<DashboardStats>("/super/dashboard");
}

export async function getSuperAdmins() {
  return apiRequest<ResellerData[]>("/super/admins");
}

export async function createAdmin(data: { username: string; password: string; displayName: string; email?: string; phone?: string; points?: number; notes?: string }) {
  return apiRequest<{ success: boolean; admin: { id: number; username: string; displayName: string } }>("/super/admins", { method: "POST", body: JSON.stringify(data) });
}

export async function updateAdmin(id: number, data: Partial<ResellerData & { notes: string }>) {
  return apiRequest<{ success: boolean }>(`/super/admins/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteAdmin(id: number) {
  return apiRequest<{ success: boolean }>(`/super/admins/${id}`, { method: "DELETE" });
}

export async function changeAdminPassword(id: number, newPassword: string) {
  return apiRequest<{ success: boolean }>(`/super/admins/${id}/change-password`, { method: "POST", body: JSON.stringify({ newPassword }) });
}

export async function addPointsToAdmin(id: number, amount: number, description?: string) {
  return apiRequest<{ success: boolean; newBalance: number }>(`/super/admins/${id}/add-points`, { method: "POST", body: JSON.stringify({ amount, description }) });
}

export async function deductPointsFromAdmin(id: number, amount: number, description?: string) {
  return apiRequest<{ success: boolean; newBalance: number }>(`/super/admins/${id}/deduct-points`, { method: "POST", body: JSON.stringify({ amount, description }) });
}

export async function getAdminPointsHistory(id: number) {
  return apiRequest<{ transactions: PointTransaction[]; balance: number }>(`/super/admins/${id}/points-history`);
}

export async function getAdminDevices(id: number) {
  return apiRequest<{ success: boolean; licenses: License[] }>(`/super/admins/${id}/devices`);
}

export async function getSuperLicenses() {
  return apiRequest<{ success: boolean; licenses: License[] }>("/super/licenses");
}

export async function superActivateLicense(data: { macAddress: string; planId?: number; durationDays?: number; email?: string; customerName?: string; notes?: string }) {
  return apiRequest<{ success: boolean }>("/super/licenses/activate", { method: "POST", body: JSON.stringify(data) });
}

export async function superRevokeLicense(macAddress: string) {
  return apiRequest<{ success: boolean }>("/super/licenses/revoke", { method: "POST", body: JSON.stringify({ macAddress }) });
}

export async function superBlockLicense(macAddress: string) {
  return apiRequest<{ success: boolean }>("/super/licenses/block", { method: "POST", body: JSON.stringify({ macAddress }) });
}

export async function superDeleteLicense(macAddress: string) {
  return apiRequest<{ success: boolean }>(`/super/licenses/${encodeURIComponent(macAddress)}`, { method: "DELETE" });
}

export async function superSetLicenseStatus(macAddress: string, status: string) {
  return apiRequest<{ success: boolean }>("/super/licenses/set-status", { method: "POST", body: JSON.stringify({ macAddress, status }) });
}

export async function superAddDevice(data: { macAddress: string; status?: string; deviceName?: string; email?: string; customerName?: string; notes?: string }) {
  return apiRequest<{ success: boolean }>("/super/licenses/add", { method: "POST", body: JSON.stringify(data) });
}

export async function getSuperPlans() {
  return apiRequest<Plan[]>("/super/plans");
}

export async function createPlan(data: Partial<Plan>) {
  return apiRequest<{ success: boolean }>("/super/plans", { method: "POST", body: JSON.stringify(data) });
}

export async function updatePlan(id: number, data: Partial<Plan>) {
  return apiRequest<{ success: boolean }>(`/super/plans/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deletePlan(id: number) {
  return apiRequest<{ success: boolean }>(`/super/plans/${id}`, { method: "DELETE" });
}

export async function getSuperPayments() {
  return apiRequest<any[]>("/super/payments");
}

export async function toggleBlocking(disabled: boolean) {
  return apiRequest<{ success: boolean }>("/super/toggle-blocking", { method: "POST", body: JSON.stringify({ disabled }) });
}

export async function getSuperSetting(key: string) {
  return apiRequest<{ key: string; value: string | null }>(`/super/settings/${key}`);
}

export async function setSuperSetting(key: string, value: string) {
  return apiRequest<{ success: boolean }>("/super/settings", { method: "POST", body: JSON.stringify({ key, value }) });
}

// Admin (Reseller) endpoints
export async function getResellerMe() {
  return apiRequest<ResellerData>("/reseller/me");
}

export async function getResellerLicenses() {
  return apiRequest<{ success: boolean; licenses: License[] }>("/reseller/licenses");
}

export async function resellerActivate(macAddress: string, planId: number) {
  return apiRequest<{ success: boolean; newBalance: number }>("/reseller/activate", { method: "POST", body: JSON.stringify({ macAddress, planId }) });
}

export async function getResellerPointsHistory() {
  return apiRequest<{ transactions: PointTransaction[]; balance: number }>("/reseller/points/history");
}

export async function getResellerPlans() {
  return apiRequest<Plan[]>("/reseller/plans");
}

export async function getResellerStats() {
  return apiRequest<{ points: number; totalDevices: number; activeDevices: number; expiredDevices: number; subResellers: number }>("/reseller/stats");
}

export async function getSubResellers() {
  return apiRequest<ResellerData[]>("/reseller/sub-resellers");
}

export async function createSubReseller(data: { username: string; password: string; displayName: string; email?: string; phone?: string; points?: number; notes?: string }) {
  return apiRequest<{ success: boolean; subReseller: { id: number; username: string; displayName: string } }>("/reseller/sub-resellers", { method: "POST", body: JSON.stringify(data) });
}

export async function transferPoints(toResellerId: number, amount: number) {
  return apiRequest<{ success: boolean; newBalance: number }>("/reseller/transfer-points", { method: "POST", body: JSON.stringify({ toResellerId, amount }) });
}

export async function checkLicenseStatus(macAddress: string) {
  return apiRequest<any>(`/reseller/licenses/check/${encodeURIComponent(macAddress)}`);
}
