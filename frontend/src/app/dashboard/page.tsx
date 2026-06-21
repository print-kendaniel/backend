"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, LogOut, Scan, User, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getDashboardStats, getScanHistory } from "@/lib/api";
import { DashboardStats, ScanHistoryItem } from "@/types";
import StatsCards from "@/components/dashboard/StatsCards";
import ScanHistory from "@/components/dashboard/ScanHistory";
import ThreatAnalytics from "@/components/dashboard/ThreatAnalytics";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const fetchData = async () => {
    if (!user) return;
    setStatsLoading(true);
    setHistoryLoading(true);
    try {
      const [s, h] = await Promise.all([
        getDashboardStats(user.uid),
        getScanHistory(user.uid),
      ]);
      setStats(s);
      setHistory(h);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setStatsLoading(false);
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Sidebar-style header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm">TrustMeBro <span className="text-primary">AI</span></span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/scan"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-black bg-primary hover:bg-primary/90 transition-all"
            >
              <Scan className="w-3.5 h-3.5" />
              New Scan
            </Link>
            <button
              onClick={fetchData}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-surface-2 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {user?.photoURL ? (
              <Image src={user.photoURL} alt="Avatar" width={28} height={28} className="rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-black text-white">
            Welcome back, {user?.displayName?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Here&apos;s your threat analysis overview.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <StatsCards stats={stats} loading={statsLoading} />
        </motion.div>

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold text-white mb-4">Threat Analytics</h2>
          <ThreatAnalytics stats={stats} />
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-white mb-4">Recent Scans</h2>
          <div className="glass rounded-2xl border border-border p-6">
            <ScanHistory items={history} loading={historyLoading} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
