"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { scanUrl } from "@/lib/api";
import { ThreatReport as ThreatReportType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import ThreatReport from "./ThreatReport";
import toast from "react-hot-toast";
import { isValidUrl, normalizeUrl } from "@/lib/utils";

const exampleUrls = [
  "gcash-secure-login.xyz",
  "maya-verify-account.net",
  "bdo-security-check.org",
  "google.com",
];

export default function URLScanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ThreatReportType | null>(null);
  const [scannedUrl, setScannedUrl] = useState("");
  const { user } = useAuth();

  const handleScan = async (targetUrl?: string) => {
    const input = targetUrl || url.trim();
    if (!input) {
      toast.error("Please enter a URL");
      return;
    }
    if (!isValidUrl(input)) {
      toast.error("Please enter a valid URL");
      return;
    }

    const normalized = normalizeUrl(input);
    setLoading(true);
    setReport(null);

    try {
      const result = await scanUrl(normalized, user?.uid);
      setReport(result);
      setScannedUrl(normalized);
      toast.success("Scan complete");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Scan failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Shield className="w-5 h-5 text-text-muted" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="Enter URL to scan — e.g. gcash-secure-login.xyz"
            className="w-full bg-surface-2 border border-border rounded-xl pl-12 pr-32 py-4 text-white placeholder:text-text-muted font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <button
            onClick={() => handleScan()}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-lg text-black font-semibold text-sm bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                Scan
              </>
            )}
          </button>
        </div>

        {/* Example URLs */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-text-muted">Try:</span>
          {exampleUrls.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setUrl(ex);
                handleScan(ex);
              }}
              className="text-xs text-primary/70 hover:text-primary font-mono transition-colors flex items-center gap-1"
            >
              {ex}
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl border border-border p-8 text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
            <div className="absolute inset-2 rounded-full border-t-2 border-secondary animate-spin animation-delay-150" style={{ animationDirection: "reverse" }} />
            <Shield className="absolute inset-0 m-auto w-6 h-6 text-primary" />
          </div>
          <p className="text-white font-semibold mb-1">Analyzing URL...</p>
          <p className="text-text-secondary text-sm">Running AI threat detection</p>
        </motion.div>
      )}

      {/* Result */}
      {report && !loading && (
        <div className="space-y-4">
          <ThreatReport report={report} url={scannedUrl} />

          {/* Report button */}
          {report.risk_level !== "safe" && (
            <div className="flex items-center gap-2 p-3 glass rounded-xl border border-warning/20 text-warning text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Think this is a false positive? {" "}
                <button className="underline hover:no-underline font-medium">Report an issue</button>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
