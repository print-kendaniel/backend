"use client";

import { motion } from "framer-motion";
import { ThreatReport as ThreatReportType } from "@/types";
import { getRiskColor, getRiskBgClass, getRiskLabel, getRiskEmoji } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Shield, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  report: ThreatReportType;
  url?: string;
}

const icons = {
  safe: CheckCircle,
  suspicious: AlertTriangle,
  dangerous: XCircle,
};

export default function ThreatReport({ report, url }: Props) {
  const color = getRiskColor(report.risk_level);
  const bgClass = getRiskBgClass(report.risk_level);
  const Icon = icons[report.risk_level];
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (report.risk_score / 100) * circumference;

  const copyReport = () => {
    const text = [
      `TrustLink AI Threat Report`,
      `URL: ${url || "N/A"}`,
      `Risk Level: ${getRiskLabel(report.risk_level)} (${report.risk_score}/100)`,
      `Confidence: ${report.confidence}%`,
      `Summary: ${report.summary}`,
      `Reasons: ${report.reasons.join(", ")}`,
      `Recommendation: ${report.recommendation}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Report copied to clipboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border p-6 ${bgClass}`}
    >
      <div className="flex items-start gap-4 mb-6">
        {/* Risk score circle */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#2A2A2A" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black" style={{ color }}>{report.risk_score}</span>
            <span className="text-xs text-text-muted">/ 100</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-5 h-5" style={{ color }} />
            <span className="font-black text-xl" style={{ color }}>
              {getRiskEmoji(report.risk_level)} {getRiskLabel(report.risk_level).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-text-muted">Confidence: <span className="text-white font-semibold">{report.confidence}%</span></span>
            <span className="text-xs text-text-muted">•</span>
            <span className="text-xs text-text-muted capitalize">Type: <span className="text-white font-semibold">{report.scan_type}</span></span>
          </div>
          {url && (
            <div className="flex items-center gap-2 bg-surface-2/50 rounded-lg px-3 py-1.5 w-fit">
              <Shield className="w-3 h-3 text-text-muted" />
              <span className="font-mono text-xs text-text-secondary truncate max-w-xs">{url}</span>
            </div>
          )}
        </div>

        <button
          onClick={copyReport}
          className="p-2 rounded-lg bg-surface-2 border border-border hover:border-primary/30 transition-colors"
          title="Copy report"
        >
          <Copy className="w-4 h-4 text-text-muted hover:text-primary transition-colors" />
        </button>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white mb-2">AI Summary</h4>
        <p className="text-sm text-text-secondary leading-relaxed">{report.summary}</p>
      </div>

      {/* Reasons */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white mb-2">Threat Indicators</h4>
        <ul className="space-y-2">
          {report.reasons.map((reason, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-2 text-sm text-text-secondary"
            >
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
              {reason}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div
        className="rounded-xl p-4 border"
        style={{ background: `${color}08`, borderColor: `${color}20` }}
      >
        <h4 className="text-sm font-semibold text-white mb-1">Recommendation</h4>
        <p className="text-sm" style={{ color }}>{report.recommendation}</p>
      </div>
    </motion.div>
  );
}
