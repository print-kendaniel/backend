"use client";

import { motion } from "framer-motion";
import { Shield, Image, QrCode, Globe, Camera, BarChart3, FileText, Lock } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "URL Scanner",
    description:
      "Analyze any URL for domain reputation, SSL certificates, suspicious keywords, typosquatting, and brand impersonation in real-time.",
    color: "#00E5FF",
    tags: ["Domain Analysis", "SSL Check", "AI Scoring"],
  },
  {
    icon: Image,
    title: "Screenshot Analyzer",
    description:
      "Upload screenshots of suspicious pages. OCR extracts text and AI detects phishing forms, fake GCash/Maya/BDO portals, and scam indicators.",
    color: "#7C3AED",
    tags: ["OCR", "Vision AI", "Scam Detection"],
  },
  {
    icon: QrCode,
    title: "QR Code Scanner",
    description:
      "Upload any QR code image. We decode it, extract the hidden URL, and run a full threat analysis to catch QR phishing attacks.",
    color: "#00C853",
    tags: ["QR Decode", "URL Extraction", "Threat Report"],
  },
  {
    icon: Shield,
    title: "Chrome Extension",
    description:
      "Real-time browser protection. One click scans the current website or captures the screen for instant AI threat analysis while you browse.",
    color: "#FF4D4F",
    tags: ["Real-time", "One Click", "MV3"],
  },
  {
    icon: BarChart3,
    title: "Threat Dashboard",
    description:
      "Track your scan history, view threat analytics, monitor risk trends, and see detailed reports for every URL and image you've scanned.",
    color: "#FFB020",
    tags: ["History", "Analytics", "Reports"],
  },
  {
    icon: FileText,
    title: "Report Website",
    description:
      "Found a scam site? Report it directly to our database. Community-driven threat intelligence helps protect all TrustMeBro users.",
    color: "#00E5FF",
    tags: ["Community", "Reporting", "Intelligence"],
  },
  {
    icon: Camera,
    title: "Screen Capture",
    description:
      "Extension captures the visible browser tab automatically and submits it for AI visual analysis — no manual screenshot needed.",
    color: "#7C3AED",
    tags: ["Auto Capture", "Visual AI", "Extension"],
  },
  {
    icon: Lock,
    title: "Firebase Security",
    description:
      "Secure user authentication with Google Sign-In, protected dashboards, encrypted scan history, and per-user threat reports.",
    color: "#00C853",
    tags: ["Auth", "Encrypted", "Private"],
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            Platform Features
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white mb-4"
          >
            Everything you need to stay{" "}
            <span className="gradient-text">protected</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-secondary text-lg max-w-2xl mx-auto"
          >
            A complete cybersecurity toolkit powered by Gemini AI, computer vision, OCR, and
            real-time threat intelligence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative glass rounded-2xl p-6 border border-border hover:border-opacity-60 transition-all duration-300"
              style={{ "--feature-color": feature.color } as React.CSSProperties}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 50% 0%, ${feature.color}08, transparent 70%)` }}
              />

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>

              <h3 className="font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {feature.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {feature.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: `${feature.color}10`,
                      color: feature.color,
                      border: `1px solid ${feature.color}20`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
