"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const threats = [
  {
    url: "gcash-secure-login.xyz",
    risk: "dangerous",
    score: 94,
    reason: "Brand impersonation + suspicious TLD",
    tags: ["Phishing", "Brand Abuse", "New Domain"],
  },
  {
    url: "maya-verify-account.net",
    risk: "dangerous",
    score: 89,
    reason: "Credential harvesting portal detected",
    tags: ["Phishing", "Credential Theft", "Fake Form"],
  },
  {
    url: "bdo-security-check.org",
    risk: "suspicious",
    score: 67,
    reason: "Banking keyword abuse, no official affiliation",
    tags: ["Suspicious", "Banking Scam"],
  },
  {
    url: "bpi-online-verify.info",
    risk: "dangerous",
    score: 91,
    reason: "Fake BPI login portal with certificate spoofing",
    tags: ["Phishing", "Fake SSL"],
  },
  {
    url: "google.com",
    risk: "safe",
    score: 2,
    reason: "Verified legitimate domain, active for 25+ years",
    tags: ["Safe", "Verified"],
  },
  {
    url: "paypal-account-suspended.com",
    risk: "dangerous",
    score: 97,
    reason: "Classic PayPal phishing with urgency language",
    tags: ["Phishing", "Urgency Scam"],
  },
];

const riskConfig = {
  safe: { color: "#00C853", icon: CheckCircle, label: "SAFE", bg: "bg-safe/5 border-safe/20" },
  suspicious: { color: "#FFB020", icon: AlertTriangle, label: "SUSPICIOUS", bg: "bg-warning/5 border-warning/20" },
  dangerous: { color: "#FF4D4F", icon: XCircle, label: "DANGEROUS", bg: "bg-danger/5 border-danger/20" },
};

export default function ThreatShowcase() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(124,58,237,0.05), transparent)" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-danger/10 border border-danger/20 text-danger text-sm font-medium mb-6"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Real Threat Examples
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white mb-4"
          >
            See what we{" "}
            <span className="gradient-text-danger">catch</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg max-w-xl mx-auto"
          >
            Real examples of phishing sites, banking scams, and brand impersonation attempts that
            TrustLink AI detects and blocks.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {threats.map((threat, i) => {
            const config = riskConfig[threat.risk as keyof typeof riskConfig];
            const Icon = config.icon;
            return (
              <motion.div
                key={threat.url}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`glass rounded-2xl p-5 border transition-all duration-300 ${config.bg}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                    <span className="text-xs font-bold tracking-wider" style={{ color: config.color }}>
                      {config.label}
                    </span>
                  </div>
                  {/* Risk score circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2"
                    style={{ borderColor: config.color, color: config.color }}
                  >
                    {threat.score}
                  </div>
                </div>

                <div className="font-mono text-sm text-white mb-2 truncate">{threat.url}</div>
                <p className="text-xs text-text-secondary mb-3">{threat.reason}</p>

                {/* Risk bar */}
                <div className="h-1 bg-surface-2 rounded-full mb-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${threat.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: config.color }}
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {threat.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${config.color}10`,
                        color: config.color,
                        border: `1px solid ${config.color}20`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
