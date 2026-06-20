"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Is TrustMeBro AI free to use?",
    a: "Yes! The core URL scanning, screenshot analysis, and QR code scanning features are completely free. Create a free account to unlock scan history, dashboard analytics, and saved reports.",
  },
  {
    q: "How accurate is the phishing detection?",
    a: "TrustMeBro AI achieves 99.7% accuracy in detecting phishing sites by combining domain reputation data, SSL analysis, keyword pattern matching, and Gemini AI's language model reasoning — reducing false positives to under 0.3%.",
  },
  {
    q: "Can it detect GCash, Maya, BDO, BPI fake sites?",
    a: "Yes. We specifically train our detection models on Filipino banking and payment brand impersonation. The system detects gcash-*, maya-*, bdo-*, bpi-* and similar patterns used in local phishing campaigns.",
  },
  {
    q: "How does the Chrome Extension work?",
    a: "The extension runs locally using Manifest V3. When you click Scan, it reads the current tab's URL or captures a screenshot and sends it to our FastAPI backend for analysis. Results appear in the popup within 2 seconds.",
  },
  {
    q: "Is my data private?",
    a: "Absolutely. We use Firebase Authentication for secure sign-in. Scanned URLs are analyzed and stored per-user with Firestore security rules. We never share your scan data with third parties.",
  },
  {
    q: "What is a risk score?",
    a: "The risk score (0–100) represents the probability that a URL or image is malicious. 0–30 is Safe, 31–69 is Suspicious (review with caution), and 70–100 is Dangerous (do not proceed).",
  },
  {
    q: "Can I report a phishing site?",
    a: "Yes. Use the Report Website feature in your dashboard or on the scan page. Reports are reviewed by our system and flagged in the shared threat intelligence database to protect all users.",
  },
  {
    q: "What technologies power TrustMeBro AI?",
    a: "Frontend: Next.js 14, TypeScript, Tailwind CSS, Framer Motion. Backend: FastAPI (Python). AI: Google Gemini API. OCR: EasyOCR. QR: pyzbar + OpenCV. Auth & DB: Firebase.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-black text-white mb-4"
          >
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-lg"
          >
            Everything you need to know about TrustMeBro AI.
          </motion.p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`glass rounded-xl border transition-all duration-300 ${
                openIndex === i ? "border-primary/30" : "border-border"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-semibold text-white pr-4">{faq.q}</span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: openIndex === i ? "#00E5FF20" : "#2A2A2A" }}
                >
                  {openIndex === i ? (
                    <Minus className="w-3 h-3 text-primary" />
                  ) : (
                    <Plus className="w-3 h-3 text-text-secondary" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-4 text-text-secondary text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
