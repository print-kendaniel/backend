"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DashboardStats } from "@/types";

interface Props {
  stats: DashboardStats | null;
}

const COLORS = { safe: "#00C853", suspicious: "#FFB020", dangerous: "#FF4D4F" };

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-lg px-3 py-2 border border-border text-xs">
        <p className="text-white font-semibold">{payload[0].name}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function ThreatAnalytics({ stats }: Props) {
  if (!stats) return null;

  const pieData = [
    { name: "Safe", value: stats.safe_count },
    { name: "Suspicious", value: stats.suspicious_count },
    { name: "Dangerous", value: stats.dangerous_count },
  ].filter((d) => d.value > 0);

  const barData = [
    { name: "Safe", value: stats.safe_count, fill: COLORS.safe },
    { name: "Suspicious", value: stats.suspicious_count, fill: COLORS.suspicious },
    { name: "Dangerous", value: stats.dangerous_count, fill: COLORS.dangerous },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Pie chart */}
      <div className="glass rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-white mb-4 text-sm">Scan Distribution</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#A0A0A0", fontSize: "12px" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-text-muted text-sm">
            No scan data yet
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="glass rounded-2xl border border-border p-6">
        <h3 className="font-semibold text-white mb-4 text-sm">Threat Breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barSize={32}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#606060", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#606060", fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
