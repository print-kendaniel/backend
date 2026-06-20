import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "TrustMeBro AI — AI-Powered Cybersecurity Scanner",
  description:
    "Detect phishing websites, malicious URLs, scam pages, and fake login portals with AI-powered analysis. Stay protected online with TrustMeBro AI.",
  keywords: ["phishing detector", "URL scanner", "cybersecurity", "AI security", "malware detection"],
  authors: [{ name: "TrustMeBro AI" }],
  openGraph: {
    title: "TrustMeBro AI — AI-Powered Cybersecurity Scanner",
    description: "Detect phishing websites and malicious URLs with AI",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustMeBro AI",
    description: "AI-powered cybersecurity scanner",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-white antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1A1A1A",
                color: "#fff",
                border: "1px solid #2A2A2A",
                borderRadius: "8px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#00C853", secondary: "#000" },
              },
              error: {
                iconTheme: { primary: "#FF4D4F", secondary: "#000" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
