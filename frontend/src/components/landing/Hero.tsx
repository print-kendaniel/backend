"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Zap, ArrowRight, Lock, Eye, AlertTriangle } from "lucide-react";

const floatingBadges = [
  { icon: Lock, label: "SSL Verified", color: "#00C853", x: "-left-4", y: "top-1/4" },
  { icon: AlertTriangle, label: "Phishing Detected", color: "#FF4D4F", x: "-right-4", y: "top-1/3" },
  { icon: Eye, label: "AI Scanning", color: "#00E5FF", x: "-left-8", y: "top-2/3" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 cyber-grid opacity-40" />
      <div className="absolute inset-0 bg-hero-glow" />

      {/* Animated orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <Zap className="w-3.5 h-3.5" />
            Powered by Gemini AI & Advanced Threat Intelligence
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-none mb-6"
          >
            <span className="block text-white">Detect Threats.</span>
            <span className="block gradient-text glow-text">Stay Protected.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered platform that detects phishing websites, malicious URLs, scam pages, fake login
            portals, and dangerous QR codes — before they steal your data.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/scan"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl text-black font-semibold text-base transition-all duration-300 btn-primary"
            >
              <Shield className="w-5 h-5" />
              Scan a URL Now — It&apos;s Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#extension"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base glass glass-hover border transition-all duration-300"
            >
              Install Chrome Extension
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-text-secondary"
          >
            {[
              { value: "2M+", label: "URLs Scanned" },
              { value: "99.7%", label: "Accuracy Rate" },
              { value: "< 2s", label: "Avg Scan Time" },
              { value: "150K+", label: "Threats Blocked" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero visual — animated scanner */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
          className="mt-20 relative max-w-3xl mx-auto"
        >
          {/* Scanner card */}
          <div className="relative glass rounded-2xl p-6 shadow-glass gradient-border">
            {/* Scan line animation */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <motion.div
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 opacity-50"
                style={{ background: "linear-gradient(90deg, transparent, #00E5FF, transparent)" }}
              />
            </div>

            {/* URL input mockup */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-danger/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-safe/60" />
              </div>
              <span className="text-xs text-text-muted font-mono">TrustLink AI Scanner</span>
            </div>

            <div className="flex items-center gap-3 bg-surface-2 rounded-xl px-4 py-3 border border-border mb-4">
              <Lock className="w-4 h-4 text-text-muted" />
              <span className="font-mono text-sm text-text-secondary flex-1">
                gcash-secure-login<span className="text-danger">.xyz</span>
              </span>
              <div className="w-6 h-6 rounded-full bg-danger/20 border border-danger/30 flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-danger" />
              </div>
            </div>

            {/* Result */}
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-danger/20 border border-danger/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-danger" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-danger">DANGEROUS — Score: 94/100</span>
                    <span className="text-xs text-text-muted">Confidence: 97%</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    This URL is impersonating GCash Philippines. The domain uses a suspicious TLD (.xyz)
                    and contains credential harvesting indicators.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Brand Impersonation", "Suspicious TLD", "No SSL", "New Domain"].map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-danger/10 text-danger border border-danger/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-6 top-1/4 glass rounded-xl px-3 py-2 border border-safe/30 hidden lg:flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-safe" />
            <span className="text-xs text-safe font-medium">SSL Verified</span>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-6 top-1/3 glass rounded-xl px-3 py-2 border border-primary/30 hidden lg:flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">AI Analyzing...</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
