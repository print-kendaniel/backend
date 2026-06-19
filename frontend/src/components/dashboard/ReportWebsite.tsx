"use client";

import { useState } from "react";
import { Flag, Loader2, CheckCircle } from "lucide-react";
import { reportWebsite } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const reasons = [
  "Phishing / Credential Theft",
  "Banking Scam",
  "Brand Impersonation",
  "Malware Distribution",
  "Fake Login Page",
  "QR Code Phishing",
  "Crypto Scam",
  "Other",
];

export default function ReportWebsite() {
  const [url, setUrl] = useState("");
  const [reason, setReason] = useState(reasons[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter the suspicious URL");
      return;
    }
    setLoading(true);
    try {
      await reportWebsite({ url: url.trim(), reason, description, userId: user?.uid });
      setSubmitted(true);
      toast.success("Report submitted — thank you for helping keep users safe!");
    } catch {
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-safe/20 border border-safe/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-safe" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Report Submitted</h3>
        <p className="text-text-secondary text-sm max-w-sm mx-auto mb-6">
          Thank you for reporting this website. Our team will review it and add it to our threat
          database to protect other users.
        </p>
        <button
          onClick={() => { setSubmitted(false); setUrl(""); setDescription(""); }}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Report another website
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Suspicious Website URL <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://fake-gcash-login.xyz"
          className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted font-mono text-sm focus:outline-none focus:border-primary/50 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Threat Category</label>
        <div className="grid grid-cols-2 gap-2">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all border ${
                reason === r
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-surface-2 border-border text-text-secondary hover:border-border/80"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what makes this website suspicious — what you saw, what it asked for..."
          rows={3}
          className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white bg-danger hover:bg-danger/90 disabled:opacity-50 transition-all hover:shadow-[0_0_20px_rgba(255,77,79,0.3)]"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
        {loading ? "Submitting..." : "Report This Website"}
      </button>
    </form>
  );
}
