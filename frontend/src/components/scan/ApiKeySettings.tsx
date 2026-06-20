"use client";

import { useEffect, useState } from "react";
import { KeyRound, Check } from "lucide-react";
import { getGeminiKey, setGeminiKey } from "@/lib/api";

export default function ApiKeySettings() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(getGeminiKey());
  }, []);

  function handleSave() {
    setGeminiKey(value);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="text-center mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
      >
        <KeyRound className="w-3.5 h-3.5" />
        {value ? "Using your own Gemini API key" : "Scans share a limited daily AI quota — use your own key"}
      </button>

      {open && (
        <div className="glass border border-border rounded-xl p-4 mt-3 max-w-md mx-auto text-left">
          <p className="text-xs text-text-secondary mb-3">
            Scans draw from a shared daily Gemini API quota. Add your own free key from{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google AI Studio
            </a>{" "}
            to get your own quota instead. Stored only in your browser, never sent anywhere except
            with your own scan requests.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="AIza..."
              className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/30 transition-colors flex items-center gap-1.5"
            >
              {saved ? <Check className="w-4 h-4" /> : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
