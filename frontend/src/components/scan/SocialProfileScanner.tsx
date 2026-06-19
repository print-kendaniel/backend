"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Image, Upload, X, Loader2, UserCheck, Info } from "lucide-react";
import { scanSocialUrl, scanSocialScreenshot } from "@/lib/api";
import { ThreatReport as ThreatReportType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import ThreatReport from "./ThreatReport";
import toast from "react-hot-toast";

type Mode = "link" | "screenshot";

export default function SocialProfileScanner() {
  const [mode, setMode] = useState<Mode>("screenshot");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ThreatReportType | null>(null);
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    setFile(f);
    setReport(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
    maxFiles: 1,
  });

  const handleScanUrl = async () => {
    const input = url.trim();
    if (!input) {
      toast.error("Please paste a Facebook profile/page link");
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const result = await scanSocialUrl(input, user?.uid);
      setReport(result);
      toast.success("Check complete");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Check failed. Make sure it's a Facebook link.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleScanScreenshot = async () => {
    if (!file) return;
    setLoading(true);
    setReport(null);
    try {
      const result = await scanSocialScreenshot(file, user?.uid);
      setReport(result);
      toast.success("Check complete");
    } catch {
      toast.error("Check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setReport(null);
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-surface-2 rounded-xl border border-border w-fit">
        <button
          onClick={() => setMode("screenshot")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "screenshot" ? "bg-primary text-black" : "text-text-secondary hover:text-white"
          }`}
        >
          <Image className="w-4 h-4" />
          Upload Screenshot
        </button>
        <button
          onClick={() => setMode("link")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "link" ? "bg-primary text-black" : "text-text-secondary hover:text-white"
          }`}
        >
          <Link2 className="w-4 h-4" />
          Paste Profile Link
        </button>
      </div>

      {mode === "link" && (
        <div className="flex items-start gap-2 p-3 glass rounded-xl border border-warning/20 text-warning text-xs">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Facebook blocks most automated access to profile content, so a link alone gives a limited,
            lower-confidence result. For an accurate check, upload a screenshot of the profile instead.
          </span>
        </div>
      )}

      {mode === "link" ? (
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <UserCheck className="w-5 h-5 text-text-muted" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScanUrl()}
              placeholder="Paste a Facebook profile or page link..."
              className="w-full bg-surface-2 border border-border rounded-xl pl-12 pr-32 py-4 text-white placeholder:text-text-muted font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={handleScanUrl}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-lg text-black font-semibold text-sm bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
            </button>
          </div>
        </div>
      ) : !preview ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-primary/60 bg-primary/5"
              : "border-border hover:border-primary/30 hover:bg-primary/2"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                isDragActive ? "bg-primary/20 border-primary/40" : "bg-surface-2 border-border"
              } border`}
            >
              <UserCheck className={`w-8 h-8 ${isDragActive ? "text-primary" : "text-text-muted"}`} />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">
                {isDragActive ? "Drop screenshot here" : "Upload Profile Screenshot"}
              </p>
              <p className="text-text-secondary text-sm">
                Drag & drop or click to select • PNG, JPG, WEBP up to 10MB
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted text-center">
              Checks profile/cover photo, verification badge, follower count, and bio for signs of a fake or cloned account
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <img src={preview} alt="Profile screenshot preview" className="w-full max-h-64 object-cover" />
            <button
              onClick={clearFile}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 border border-border flex items-center justify-center hover:border-danger/30 hover:text-danger transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {loading && (
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
                />
                <div className="absolute inset-0 bg-primary/5" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary flex-1">
              <Upload className="w-4 h-4" />
              <span className="truncate">{file?.name}</span>
              <span className="text-text-muted">({(file!.size / 1024).toFixed(0)} KB)</span>
            </div>
            <button
              onClick={handleScanScreenshot}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-black font-semibold text-sm bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Check Profile
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {report && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ThreatReport report={report} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
