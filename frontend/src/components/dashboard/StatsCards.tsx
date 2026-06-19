"use client";

import { motion } from "framer-motion";
import { DashboardStats } from "@/types";
import { Shield, CheckCircle, AlertTriangle, XCircle, Activity } from "lucide-react";

interface Props {
  stats: DashboardStats | null;
  loading: boolean;
}

export default function StatsCards({ stats, loading }: Props) {
  const cards = [
    {
      label: "Total Scans",
      value: stats?.total_scans ?? 0,
      icon: Activity,
      color: "#00E5FF",
      bg: "bg-primary/5 border-primary/20",
    },
    {
      label: "Safe",
      value: stats?.safe_count ?? 0,
      icon: CheckCircle,
      color: "#00C853",
      bg: "bg-safe/5 border-safe/20",
    },
    {
      label: "Suspicious",
      value: stats?.suspicious_count ?? 0,
      icon: AlertTriangle,
      color: "#FFB020",
      bg: "bg-warning/5 border-warning/20",
    },
    {
      label: "Dangerous",
      value: stats?.dangerous_count ?? 0,
      icon: XCircle,
      color: "#FF4D4F",
      bg: "bg-danger/5 border-danger/20",
    },
    {
      label: "Threats Blocked",
      value: stats?.threats_blocked ?? 0,
      icon: Shield,
      color: "#7C3AED",
      bg: "bg-secondary/5 border-secondary/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((_, i) => (
          <div key={i} className="h-24 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`glass rounded-2xl p-5 border ${card.bg} text-center`}
        >
          <card.icon className="w-6 h-6 mx-auto mb-2" style={{ color: card.color }} />
          <div className="text-2xl font-black font-mono" style={{ color: card.color }}>
            {card.value.toLocaleString()}
          </div>
          <div className="text-xs text-text-muted mt-1">{card.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
