"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Upload, X, Loader2, Scan } from "lucide-react";
import { scanQR } from "@/lib/api";
import { ThreatReport as ThreatReportType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import ThreatReport from "./ThreatReport";
import toast from "react-hot-toast";

export default function QRScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ThreatReportType | null>(null);
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
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

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setReport(null);
    try {
      const result = await scanQR(file, user?.uid);
      setReport(result);
      toast.success("QR scan complete");
    } catch {
      toast.error("Failed to scan QR code. Make sure the image is clear and contains a valid QR code.");
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
            isDragActive ? "border-secondary/60 bg-secondary/5" : "border-border hover:border-secondary/30"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border ${
                isDragActive ? "bg-secondary/20 border-secondary/40" : "bg-surface-2 border-border"
              }`}
            >
              <QrCode className={`w-8 h-8 ${isDragActive ? "text-secondary" : "text-text-muted"}`} />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Upload QR Code Image</p>
              <p className="text-text-secondary text-sm">
                Drag & drop or click to select a QR code image
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-text-muted">
              <span>✓ Decode hidden URL</span>
              <span>✓ Full threat analysis</span>
              <span>✓ Detects QR phishing</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* QR Preview */}
          <div className="relative flex items-center justify-center bg-surface-2 rounded-2xl border border-border p-6">
            <div className="relative">
              <img src={preview} alt="QR Code" className="max-h-48 w-auto rounded-xl" />
              {/* Corner frame */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-secondary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-secondary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-secondary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-secondary rounded-br-lg" />
              </div>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto mb-2" />
                    <p className="text-xs text-secondary">Decoding QR...</p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={clearFile}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/80 border border-border flex items-center justify-center hover:text-danger transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary flex-1 min-w-0">
              <Upload className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{file?.name}</span>
            </div>
            <button
              onClick={handleScan}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-secondary hover:bg-secondary/90 disabled:opacity-50 transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Scan QR Code
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {report && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ThreatReport report={report} url={report.url} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
