"use client";

import { motion } from "framer-motion";
import { ScanHistoryItem } from "@/types";
import { getRiskColor, getRiskLabel, getRiskEmoji, formatDate, truncateUrl } from "@/lib/utils";
import { Globe, Image, QrCode, UserCheck, ChevronRight } from "lucide-react";

interface Props {
  items: ScanHistoryItem[];
  loading: boolean;
}

const scanTypeIcon = { url: Globe, image: Image, qr: QrCode, social: UserCheck };
const scanTypeLabel = { url: "URL Scan", image: "Screenshot", qr: "QR Code", social: "Social Profile" };

export default function ScanHistory({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium text-text-secondary">No scans yet</p>
        <p className="text-sm">Your scan history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const color = getRiskColor(item.risk_level);
        const Icon = scanTypeIcon[item.scan_type];
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-4 glass rounded-xl border border-border hover:border-primary/20 transition-all group cursor-pointer"
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium" style={{ color }}>
                  {getRiskEmoji(item.risk_level)} {getRiskLabel(item.risk_level)}
                </span>
                <span className="text-xs text-text-muted">•</span>
                <span className="text-xs text-text-muted">{scanTypeLabel[item.scan_type]}</span>
              </div>
              <p className="text-sm text-white font-mono truncate">
                {item.url || `${scanTypeLabel[item.scan_type]} Analysis`}
              </p>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-black font-mono" style={{ color }}>
                {item.risk_score}
              </div>
              <div className="text-xs text-text-muted">{formatDate(item.timestamp)}</div>
            </div>

            <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        );
      })}
    </div>
  );
}
