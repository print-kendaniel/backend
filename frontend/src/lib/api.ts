import axios from "axios";
import { ThreatReport, DashboardStats, ScanHistoryItem, ReportWebsitePayload } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function scanUrl(url: string, userId?: string): Promise<ThreatReport> {
  const { data } = await api.post<ThreatReport>("/scan-url", { url, user_id: userId });
  return data;
}

export async function scanImage(file: File, userId?: string): Promise<ThreatReport> {
  const formData = new FormData();
  formData.append("file", file);
  if (userId) formData.append("user_id", userId);
  const { data } = await api.post<ThreatReport>("/scan-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function scanQR(file: File, userId?: string): Promise<ThreatReport> {
  const formData = new FormData();
  formData.append("file", file);
  if (userId) formData.append("user_id", userId);
  const { data } = await api.post<ThreatReport>("/scan-qr", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function scanSocialUrl(url: string, userId?: string): Promise<ThreatReport> {
  const { data } = await api.post<ThreatReport>("/scan-social-url", { url, user_id: userId });
  return data;
}

export async function scanSocialScreenshot(file: File, userId?: string): Promise<ThreatReport> {
  const formData = new FormData();
  formData.append("file", file);
  if (userId) formData.append("user_id", userId);
  const { data } = await api.post<ThreatReport>("/scan-social-screenshot", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function reportWebsite(payload: ReportWebsitePayload): Promise<{ message: string }> {
  const { data } = await api.post("/report-website", payload);
  return data;
}

export async function getScanHistory(userId: string): Promise<ScanHistoryItem[]> {
  const { data } = await api.get<ScanHistoryItem[]>(`/history?user_id=${userId}`);
  return data;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>(`/dashboard-stats?user_id=${userId}`);
  return data;
}
