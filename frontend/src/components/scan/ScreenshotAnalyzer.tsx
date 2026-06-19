"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Upload, X, Loader2, Eye } from "lucide-react";
import { scanImage } from "@/lib/api";
import { ThreatReport as ThreatReportType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import ThreatReport from "./ThreatReport";
import toast from "react-hot-toast";

export default function ScreenshotAnalyzer() {
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

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setReport(null);
    try {
      const result = await scanImage(file, user?.uid);
      setReport(result);
      toast.success("Analysis complete");
    } catch {
      toast.error("Analysis failed. Please try again.");
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
      {!preview ? (
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
              <Image className={`w-8 h-8 ${isDragActive ? "text-primary" : "text-text-muted"}`} />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">
                {isDragActive ? "Drop screenshot here" : "Upload Screenshot"}
              </p>
              <p className="text-text-secondary text-sm">
                Drag & drop or click to select • PNG, JPG, WEBP up to 10MB
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Eye className="w-3.5 h-3.5" />
              Detects: phishing forms, fake login pages, banking scams, GCash/Maya/BDO impersonation
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <img src={preview} alt="Screenshot preview" className="w-full max-h-64 object-cover" />
            <button
              onClick={clearFile}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 border border-border flex items-center justify-center hover:border-danger/30 hover:text-danger transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Scan line overlay when loading */}
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
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-black font-semibold text-sm bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Analyze Screenshot
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
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
