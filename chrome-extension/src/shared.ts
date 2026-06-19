// Shared types and chrome.storage.local helpers used by background/content/popup.

export type RiskLevel = "safe" | "suspicious" | "dangerous";

export interface ThreatReport {
  risk_level: RiskLevel;
  risk_score: number;
  confidence: number;
  summary: string;
  reasons: string[];
  recommendation: string;
  url?: string;
  scan_type?: string;
}

export interface HistoryEntry extends ThreatReport {
  id: string;
  domain: string;
  timestamp: number;
}

// FastAPI's HTTPException responses look like {"detail": "..."}. This pulls
// that out so callers see the real failure reason instead of just "HTTP 500".
export async function extractErrorDetail(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    // response body wasn't JSON — fall through to the generic status message
  }
  return `HTTP ${response.status}`;
}

export type Lang = "en" | "tl";

export interface Settings {
  autoScan: boolean;
  notifications: boolean;
  language: Lang;
}

export const DEFAULT_SETTINGS: Settings = {
  // Off by default: auto-scanning every visited domain burns one API call per
  // new site, which exhausts free-tier Gemini quota fast. Users opt in via Settings.
  autoScan: false,
  notifications: true,
  language: "en",
};

const ALLOWLIST_KEY = "trustlink_allowlist";
const HISTORY_KEY = "trustlink_history";
const SETTINGS_KEY = "trustlink_settings";
const LAST_SCAN_PREFIX = "trustlink_lastscan_";
const HISTORY_LIMIT = 30;
// Auto-scan re-checks a domain at most once per this window to avoid burning API quota.
const AUTO_SCAN_COOLDOWN_MS = 6 * 60 * 60 * 1000;

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

const FACEBOOK_DOMAINS = new Set([
  "facebook.com", "www.facebook.com", "m.facebook.com",
  "web.facebook.com", "mbasic.facebook.com", "fb.com",
]);

export function isFacebookUrl(url: string): boolean {
  const domain = extractDomain(url);
  return FACEBOOK_DOMAINS.has(domain) || domain.endsWith(".facebook.com");
}

export function getAllowlist(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([ALLOWLIST_KEY], (result) => {
      resolve(result[ALLOWLIST_KEY] || []);
    });
  });
}

export async function isAllowlisted(domain: string): Promise<boolean> {
  const list = await getAllowlist();
  return list.includes(domain);
}

export async function addToAllowlist(domain: string): Promise<void> {
  const list = await getAllowlist();
  if (!list.includes(domain)) {
    list.push(domain);
    await new Promise<void>((resolve) => chrome.storage.local.set({ [ALLOWLIST_KEY]: list }, resolve));
  }
}

export async function removeFromAllowlist(domain: string): Promise<void> {
  const list = await getAllowlist();
  const next = list.filter((d) => d !== domain);
  await new Promise<void>((resolve) => chrome.storage.local.set({ [ALLOWLIST_KEY]: next }, resolve));
}

export function getHistory(): Promise<HistoryEntry[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([HISTORY_KEY], (result) => {
      resolve(result[HISTORY_KEY] || []);
    });
  });
}

export async function addToHistory(report: ThreatReport, domain: string): Promise<void> {
  const list = await getHistory();
  const entry: HistoryEntry = {
    ...report,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    domain,
    timestamp: Date.now(),
  };
  list.unshift(entry);
  const trimmed = list.slice(0, HISTORY_LIMIT);
  await new Promise<void>((resolve) => chrome.storage.local.set({ [HISTORY_KEY]: trimmed }, resolve));
}

export function getSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.storage.local.get([SETTINGS_KEY], (result) => {
      resolve({ ...DEFAULT_SETTINGS, ...(result[SETTINGS_KEY] || {}) });
    });
  });
}

export async function saveSettings(partial: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...partial };
  await new Promise<void>((resolve) => chrome.storage.local.set({ [SETTINGS_KEY]: next }, resolve));
  return next;
}

export function getLastAutoScanTime(domain: string): Promise<number> {
  const key = `${LAST_SCAN_PREFIX}${domain}`;
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => resolve(result[key] || 0));
  });
}

export function setLastAutoScanTime(domain: string): Promise<void> {
  const key = `${LAST_SCAN_PREFIX}${domain}`;
  return new Promise((resolve) => chrome.storage.local.set({ [key]: Date.now() }, resolve));
}

export async function isAutoScanDue(domain: string): Promise<boolean> {
  const last = await getLastAutoScanTime(domain);
  return Date.now() - last > AUTO_SCAN_COOLDOWN_MS;
}

export function timeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
