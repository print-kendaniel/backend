"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

const stats = [
  { value: 2000000, label: "URLs Scanned", suffix: "+", prefix: "" },
  { value: 99.7, label: "Detection Accuracy", suffix: "%", prefix: "" },
  { value: 150000, label: "Threats Blocked", suffix: "+", prefix: "" },
  { value: 2, label: "Avg Response Time", suffix: "s", prefix: "<" },
  { value: 45000, label: "Active Users", suffix: "+", prefix: "" },
  { value: 98.5, label: "User Satisfaction", suffix: "%", prefix: "" },
];

function AnimatedNumber({ value, suffix, prefix }: { value: number; suffix: string; prefix: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (value >= 1000000) return `${prefix}${(v / 1000000).toFixed(1)}M${suffix}`;
    if (value >= 1000) return `${prefix}${(v / 1000).toFixed(0)}K${suffix}`;
    return `${prefix}${v % 1 !== 0 ? v.toFixed(1) : Math.round(v)}${suffix}`;
  });
  const ref = useRef(false);

  return (
    <motion.span
      onViewportEnter={() => {
        if (!ref.current) {
          ref.current = true;
          animate(count, value, { duration: 2.5, ease: "easeOut" });
        }
      }}
    >
      <motion.span>{rounded}</motion.span>
    </motion.span>
  );
}

export default function Stats() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(0,229,255,0.03) 0%, rgba(124,58,237,0.03) 100%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-black text-white mb-4"
          >
            Trusted by security-conscious users{" "}
            <span className="gradient-text">worldwide</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-lg"
          >
            Real numbers from real protection.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative glass rounded-2xl p-8 border border-border text-center group hover:border-primary/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,229,255,0.05), transparent 70%)" }}
              />
              <div className="text-4xl sm:text-5xl font-black text-primary mb-2 font-mono">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </div>
              <div className="text-text-secondary text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
