"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Image, QrCode, Shield, Flag, UserCheck } from "lucide-react";
import URLScanner from "@/components/scan/URLScanner";
import ScreenshotAnalyzer from "@/components/scan/ScreenshotAnalyzer";
import QRScanner from "@/components/scan/QRScanner";
import SocialProfileScanner from "@/components/scan/SocialProfileScanner";
import ApiKeySettings from "@/components/scan/ApiKeySettings";
import Navbar from "@/components/landing/Navbar";
import ReportWebsite from "@/components/dashboard/ReportWebsite";

const tabs = [
  { id: "url", label: "URL Scanner", icon: Globe, color: "#00E5FF" },
  { id: "screenshot", label: "Screenshot", icon: Image, color: "#7C3AED" },
  { id: "qr", label: "QR Code", icon: QrCode, color: "#00C853" },
  { id: "social", label: "Social Profile", icon: UserCheck, color: "#FFB020" },
  { id: "report", label: "Report Site", icon: Flag, color: "#FF4D4F" },
];

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState("url");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Shield className="w-3.5 h-3.5" />
            AI-Powered Threat Scanner
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Scan for <span className="gradient-text">Threats</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Analyze URLs, screenshots, and QR codes for phishing, malware, and scam indicators using
            Gemini AI.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-border overflow-hidden"
        >
          {/* Tab bar */}
          <div className="flex border-b border-border bg-surface/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id ? "text-white" : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <tab.icon
                  className="w-4 h-4"
                  style={{ color: activeTab === tab.id ? tab.color : undefined }}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: tab.color }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "url" && <URLScanner />}
              {activeTab === "screenshot" && <ScreenshotAnalyzer />}
              {activeTab === "qr" && <QRScanner />}
              {activeTab === "social" && <SocialProfileScanner />}
              {activeTab === "report" && <ReportWebsite />}
            </motion.div>
          </div>
        </motion.div>

        {/* Info note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-text-muted mt-6"
        >
          All scans are processed securely. Results are powered by Gemini AI and multi-layer threat
          intelligence.
        </motion.p>

        <ApiKeySettings />
      </main>
    </div>
  );
}
