"use client";

import { motion } from "framer-motion";
import { Link2, Brain, FileSearch, ShieldCheck } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Link2,
    title: "Submit Your Target",
    description:
      "Paste a suspicious URL, upload a screenshot, submit a QR code image, or click Scan in the Chrome extension. Any input method works.",
    color: "#00E5FF",
  },
  {
    step: "02",
    icon: FileSearch,
    title: "Deep Analysis",
    description:
      "Our backend performs domain reputation checks, SSL analysis, OCR text extraction, QR decoding, and keyword pattern matching.",
    color: "#7C3AED",
  },
  {
    step: "03",
    icon: Brain,
    title: "Gemini AI Review",
    description:
      "Gemini AI reviews all extracted data, identifies phishing patterns, detects brand impersonation, and generates a detailed threat assessment.",
    color: "#FFB020",
  },
  {
    step: "04",
    icon: ShieldCheck,
    title: "Get Your Report",
    description:
      "Receive an instant risk score (0-100), confidence level, threat reasons, and actionable recommendation — Safe, Suspicious, or Dangerous.",
    color: "#00C853",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6"
          >
            How It Works
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white mb-4"
          >
            Threat detection in{" "}
            <span className="gradient-text">4 simple steps</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg max-w-xl mx-auto"
          >
            From input to threat report in under 2 seconds — powered by multi-layer AI analysis.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 hidden lg:block w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number + icon */}
                <div className="relative mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 pulse-ring"
                    style={{
                      background: `${step.color}15`,
                      border: `1px solid ${step.color}40`,
                    }}
                  >
                    <step.icon className="w-8 h-8" style={{ color: step.color }} />
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: step.color, color: "#000" }}
                  >
                    {step.step.replace("0", "")}
                  </div>
                </div>

                <h3 className="font-bold text-white text-lg mb-3">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
