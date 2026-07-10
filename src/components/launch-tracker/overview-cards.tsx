"use client";

import { motion } from "framer-motion";
import { Eye, Heart, TrendingUp, Music } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer,
} from "recharts";

interface OverviewData {
  tiktok: { totalViews: number; totalLikes: number; totalComments: number; totalShares: number; engagementRate: number; profileViews: number; daysTracked: number };
  instagram: { totalViews: number; totalLikes: number; totalComments: number; totalSaves: number; engagementRate: number; profileViews: number; followers: number; daysTracked: number };
  combined: { totalViews: number; totalInteractions: number };
  dailyTrend?: Array<{ date: string; tiktok: number; instagram: number }>;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

/* ═══════════════════════════════
   PROGRESS RING — Hero Element
   ═══════════════════════════════ */
function ProgressRing({ percentage, size = 160, strokeWidth = 8 }: {
  percentage: number; size?: number; strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(percentage / 100, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow behind ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: size + 20,
          height: size + 20,
          background: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.05) 40%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />
      <svg width={size} height={size} className="-rotate-90 relative z-10">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="url(#overviewRedRing)"
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
        <defs>
          <linearGradient id="overviewRedRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>
        </defs>
      </svg>
      {/* Inner content */}
      <div className="absolute z-20 flex flex-col items-center justify-center">
        <span className="text-[42px] font-extrabold text-white tracking-[-0.04em] leading-none">
          {Math.round(percentage)}%
        </span>
        <span className="text-[11px] text-[#6e6a7a] mt-1 tracking-[0.04em] font-medium">
          Progreso Launch
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════
   STAT CARD — 2x2 Grid
   ═══════════════════════════════ */
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-4 flex flex-col items-center justify-center text-center"
      style={{
        background: "rgba(255, 255, 255, 0.025)",
        border: "0.5px solid rgba(239, 68, 68, 0.06)",
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center mb-2.5"
        style={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
          border: `0.5px solid ${color}20`,
        }}
      >
        <Icon className="h-[14px] w-[14px]" style={{ color }} strokeWidth={1.5} />
      </div>
      <p className="text-[20px] font-bold text-white tracking-[-0.02em] leading-none tabular-nums">
        {value}
      </p>
      <p className="text-[10px] text-[#6e6a7a] mt-1.5 uppercase tracking-[0.08em] font-medium">
        {label}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════
   MINI TRACKER — Sparkline
   ═══════════════════════════════ */
function MiniTracker({ trendData }: { trendData?: Array<{ date: string; tiktok: number; instagram: number }> }) {
  if (!trendData || trendData.length === 0) return null;

  const combined = trendData.map((d) => ({
    date: d.date.slice(5),
    total: d.tiktok + d.instagram,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-4"
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        border: "0.5px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-[#6e6a7a] uppercase tracking-[0.08em] font-medium">
          Mini Tracker
        </span>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-[11px] w-[11px] text-emerald-400" strokeWidth={2} />
          <span className="text-[10px] text-emerald-400 font-medium">+18%</span>
        </div>
      </div>
      <div className="h-[80px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combined}>
            <defs>
              <linearGradient id="miniTrackerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════
   MAIN OVERVIEW — Mockup Layout
   ═══════════════════════════════ */
export default function OverviewCards({ data, trendData }: { data: OverviewData; trendData?: Array<{ date: string; tiktok: number; instagram: number }> }) {
  // Calculate overall progress based on views vs a target (e.g. 100K)
  const viewTarget = 100000;
  const viewProgress = Math.min((data.combined.totalViews / viewTarget) * 100, 100);
  const engagement = Math.round((data.tiktok.engagementRate + data.instagram.engagementRate) / 2 * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Progress Ring Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center pt-4 pb-2"
      >
        <ProgressRing percentage={viewProgress} />
      </motion.div>

      {/* Stats 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <StatCard
          icon={Eye}
          label="Views Totales"
          value={formatNumber(data.combined.totalViews)}
          color="#EF4444"
        />
        <StatCard
          icon={Heart}
          label="Likes"
          value={formatNumber(data.tiktok.totalLikes + data.instagram.totalLikes)}
          color="#F87171"
        />
        <StatCard
          icon={TrendingUp}
          label="Engagement"
          value={`${engagement}%`}
          color="#DC2626"
        />
        <StatCard
          icon={Music}
          label="Interacciones"
          value={formatNumber(data.combined.totalInteractions)}
          color="#B91C1C"
        />
      </div>

      {/* Mini Tracker */}
      <MiniTracker trendData={trendData} />
    </div>
  );
}