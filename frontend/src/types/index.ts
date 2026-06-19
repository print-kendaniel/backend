export type RiskLevel = "safe" | "suspicious" | "dangerous";

export interface ThreatReport {
  id?: string;
  risk_level: RiskLevel;
  risk_score: number;
  confidence: number;
  summary: string;
  reasons: string[];
  recommendation: string;
  url?: string;
  scan_type: "url" | "image" | "qr" | "social";
  timestamp?: string;
  userId?: string;
}

export interface ScanHistoryItem {
  id: string;
  url?: string;
  scan_type: "url" | "image" | "qr" | "social";
  risk_level: RiskLevel;
  risk_score: number;
  timestamp: string;
  report: ThreatReport;
}

export interface DashboardStats {
  total_scans: number;
  safe_count: number;
  suspicious_count: number;
  dangerous_count: number;
  threats_blocked: number;
  recent_scans: ScanHistoryItem[];
}

export interface URLAnalysisResult {
  domain: string;
  is_ssl: boolean;
  domain_age_days: number | null;
  suspicious_keywords: string[];
  risk_level: RiskLevel;
  risk_score: number;
  confidence: number;
  summary: string;
  reasons: string[];
  recommendation: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface ReportWebsitePayload {
  url: string;
  reason: string;
  description: string;
  userId?: string;
}
