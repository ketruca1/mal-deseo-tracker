"use client";

import { Eye, Heart, MessageCircle, Share2, Save, Users, ArrowUpRight, TrendingUp } from "lucide-react";

interface OverviewData {
  tiktok: { totalViews: number; totalLikes: number; totalComments: number; totalShares: number; engagementRate: number; profileViews: number; daysTracked: number };
  instagram: { totalViews: number; totalLikes: number; totalComments: number; totalSaves: number; engagementRate: number; profileViews: number; followers: number; daysTracked: number };
  combined: { totalViews: number; totalInteractions: number };
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

/* Hero stat card */
function HeroStat({ label, value, subtitle, accent }: {
  label: string; value: string; subtitle?: string; accent?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-2xl ${accent ? "glass-accent" : "glass"}`}
    >
      <p className="text-[10px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium">{label}</p>
      <p className="text-[24px] font-bold text-white mt-0.5 tracking-[-0.03em] leading-none">{value}</p>
      {subtitle && <p className="text-[11px] text-[#48484a] mt-1">{subtitle}</p>}
    </div>
  );
}

/* Platform section */
function PlatformSection({ platform, data, accentColor }: {
  platform: "TikTok" | "Instagram";
  data: OverviewData["tiktok"] | OverviewData["instagram"];
  accentColor: string;
}) {
  const isTT = platform === "TikTok";
  const metrics = [
    { label: "Views", value: data.totalViews, icon: Eye },
    { label: "Likes", value: data.totalLikes, icon: Heart },
    { label: "Comments", value: data.totalComments, icon: MessageCircle },
    { label: isTT ? "Shares" : "Saves", value: isTT ? data.totalShares : (data as OverviewData["instagram"]).totalSaves, icon: isTT ? Share2 : Save },
  ];

  return (
    <div className="glass p-4 space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-[5px] h-[5px] rounded-full"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}40` }}
          />
          <span className="text-[12px] font-semibold text-white tracking-[-0.01em]">{platform}</span>
        </div>
        <span className="text-[10px] text-[#48484a]">{data.daysTracked} días</span>
      </div>

      {/* Big number + engagement */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-[#48484a] uppercase tracking-[0.06em] font-medium">Visualizaciones</p>
          <p className="text-[26px] font-bold text-white mt-0.5 tracking-[-0.03em] leading-none">
            {formatNumber(data.totalViews)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#48484a] uppercase tracking-[0.06em] font-medium">Engagement</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-[11px] w-[11px] text-emerald-500" strokeWidth={2} />
            <span className="text-[18px] font-bold text-white tracking-[-0.02em] leading-none">{data.engagementRate}%</span>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-2">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="text-center">
              <Icon className="h-[12px] w-[12px] mx-auto text-[#48484a]" strokeWidth={1.5} />
              <p className="text-[13px] font-semibold text-white mt-1 tracking-[-0.01em] tabular-nums">
                {formatNumber(m.value)}
              </p>
              <p className="text-[9px] text-[#48484a] mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Profile views */}
      {"profileViews" in data && data.profileViews > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <Users className="h-[12px] w-[12px] text-[#48484a]" strokeWidth={1.5} />
            <span className="text-[11px] text-[#6e6e73]">Visitas al perfil</span>
          </div>
          <span className="text-[13px] font-semibold text-white tracking-[-0.01em]">
            {data.profileViews.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

export default function OverviewCards({ data }: { data: OverviewData }) {
  return (
    <div className="space-y-3">
      <p className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-[0.06em]">
        Resumen General
      </p>

      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <HeroStat
          label="Views Totales"
          value={formatNumber(data.combined.totalViews)}
          subtitle="TikTok + Instagram"
          accent
        />
        <HeroStat
          label="Interacciones"
          value={formatNumber(data.combined.totalInteractions)}
          subtitle="Likes · Comments · Shares"
        />
      </div>

      {/* Platform cards */}
      <div className="space-y-2.5">
        <PlatformSection platform="TikTok" data={data.tiktok} accentColor="#D6001C" />
        <PlatformSection platform="Instagram" data={data.instagram} accentColor="#ec4899" />
      </div>
    </div>
  );
}