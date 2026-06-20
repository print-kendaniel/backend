import Link from "next/link";
import { Shield, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-white">TrustMeBro</span>
                <span className="text-primary"> AI</span>
              </span>
            </div>
            <p className="text-text-secondary text-sm max-w-xs leading-relaxed mb-6">
              AI-powered cybersecurity platform protecting users from phishing, scams, and malicious
              websites in real-time.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center hover:border-primary/30 hover:text-primary transition-colors text-text-secondary">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center hover:border-primary/30 hover:text-primary transition-colors text-text-secondary">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              {["URL Scanner", "Screenshot Analyzer", "QR Scanner", "Chrome Extension", "Dashboard"].map((item) => (
                <li key={item}>
                  <Link href="/scan" className="text-sm text-text-secondary hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              {[
                { label: "About", href: "#" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "#" },
                { label: "Contact", href: "#" },
                { label: "Report Abuse", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-text-secondary hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} TrustMeBro AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
