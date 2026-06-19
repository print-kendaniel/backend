"use client";

import { motion } from "framer-motion";
import { Shield, Scan, Camera, Upload, ExternalLink } from "lucide-react";

export default function ChromeExtPreview() {
  return (
    <section id="extension" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Chrome Extension — Manifest V3
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Protection while{" "}
              <span className="gradient-text">you browse</span>
            </h2>
            <p className="text-text-secondary text-lg mb-8 leading-relaxed">
              Install the TrustLink AI Chrome extension and get instant threat analysis on any website
              with one click. Scan the current URL, capture screenshots, or upload QR codes — all
              without leaving your browser.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: Scan, text: "Scan Current Website URL instantly" },
                { icon: Camera, text: "Capture & analyze current tab screenshot" },
                { icon: Upload, text: "Upload QR codes and screenshots" },
                { icon: Shield, text: "Risk score badge shows on every site" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-text-secondary">{item.text}</span>
                </div>
              ))}
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-black bg-primary hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
            >
              <ExternalLink className="w-4 h-4" />
              Load Extension (Unpacked)
            </a>
          </motion.div>

          {/* Extension mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />

              {/* Extension popup mockup */}
              <div className="relative w-80 glass rounded-2xl border border-primary/20 shadow-cyber overflow-hidden">
                {/* Header */}
                <div className="bg-surface-2 px-4 py-3 border-b border-border flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-bold text-sm">TrustLink AI</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
                    <span className="text-xs text-safe">Active</span>
                  </div>
                </div>

                {/* Current URL */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-xs text-text-muted mb-1">Current website</div>
                  <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-danger" />
                    <span className="font-mono text-xs text-white truncate">gcash-secure-login.xyz</span>
                  </div>
                </div>

                {/* Result */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-danger mb-1">94</div>
                    <div className="text-xs font-bold text-danger tracking-widest mb-2">DANGEROUS</div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div className="h-full bg-danger rounded-full" style={{ width: "94%" }} />
                    </div>
                  </div>
                </div>

                {/* Reasons */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-xs text-text-muted mb-2">Threat Indicators</div>
                  <div className="space-y-1.5">
                    {["Brand impersonation (GCash)", "Suspicious .xyz domain", "New domain (3 days old)"].map((r) => (
                      <div key={r} className="flex items-center gap-2 text-xs text-text-secondary">
                        <div className="w-1 h-1 rounded-full bg-danger flex-shrink-0" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 grid grid-cols-2 gap-2">
                  <button className="py-2 px-3 rounded-lg bg-surface-2 border border-border text-xs text-text-secondary hover:text-white hover:border-primary/30 transition-colors flex items-center justify-center gap-1.5">
                    <Camera className="w-3 h-3" /> Screenshot
                  </button>
                  <button className="py-2 px-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5">
                    <Upload className="w-3 h-3" /> Upload QR
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
