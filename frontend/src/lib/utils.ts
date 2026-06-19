import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "safe":
      return "#00C853";
    case "suspicious":
      return "#FFB020";
    case "dangerous":
      return "#FF4D4F";
    default:
      return "#A0A0A0";
  }
}

export function getRiskBgClass(level: RiskLevel): string {
  switch (level) {
    case "safe":
      return "bg-safe/10 border-safe/30 text-safe";
    case "suspicious":
      return "bg-warning/10 border-warning/30 text-warning";
    case "dangerous":
      return "bg-danger/10 border-danger/30 text-danger";
    default:
      return "bg-gray-500/10 border-gray-500/30 text-gray-400";
  }
}

export function getRiskEmoji(level: RiskLevel): string {
  switch (level) {
    case "safe":
      return "🟢";
    case "suspicious":
      return "🟡";
    case "dangerous":
      return "🔴";
    default:
      return "⚪";
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case "safe":
      return "Safe";
    case "suspicious":
      return "Suspicious";
    case "dangerous":
      return "Dangerous";
    default:
      return "Unknown";
  }
}

export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}
