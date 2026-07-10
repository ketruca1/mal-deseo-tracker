"use client";

import { Eye, Heart, MessageCircle, Share2, Save, Users, TrendingUp } from "lucide-react";

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
    <div className={`p-4 ${accent ? "glass-accent" : "glass"}`}>
      <p className="text-[10px] text-[#6e6a7a] uppercase tracking-[0.08em] font-medium">{label}</p>
      <p className="text-[26px] font-bold text-white mt-1 tracking-[-0.03em] leading-none text-glow">{value}</p>
      {subtitle && <p className="text-[11px] text-[#3d3850] mt-1.5">{subtitle}</p>}
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
    <div className="glass p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-[6px] h-[6px] rounded-full"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 12px ${accentColor}50` }}
          />
          <span className="text-[13px] font-semibold text-white tracking-[-0.01em]">{platform}</span>
        </div>
        <span className="text-[10px] text-[#3d3850] font-medium">{data.daysTracked} días</span>
      </div>

      {/* Big number + engagement */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-[#3d3850] uppercase tracking-[0.08em] font-medium">Visualizaciones</p>
          <p className="text-[30px] font-bold text-white mt-1 tracking-[-0.03em] leading-none text-glow">
            {formatNumber(data.totalViews)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#3d3850] uppercase tracking-[0.08em] font-medium">Engagement</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <TrendingUp className="h-[12px] w-[12px] text-emerald-400" strokeWidth={2} />
            <span className="text-[20px] font-bold text-white tracking-[-0.02em] leading-none">{data.engagementRate}%</span>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="text-center p-2 rounded-[14px] bg-white/[0.015] border border-white/[0.03]">
              <Icon className="h-[12px] w-[12px] mx-auto text-[#3d3850]" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-white mt-1.5 tracking-[-0.01em] tabular-nums">
                {formatNumber(m.value)}
              </p>
              <p className="text-[9px] text-[#3d3850] mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Profile views */}
      {"profileViews" in data && data.profileViews > 0 && (
        <div className="flex items-center justify-between pt-3.5 border-t divider-red">
          <div className="flex items-center gap-2">
            <Users className="h-[12px] w-[12px] text-[#3d3850]" strokeWidth={1.5} />
            <span className="text-[12px] text-[#6e6a7a]">Visitas al perfil</span>
          </div>
          <span className="text-[14px] font-semibold text-white tracking-[-0.01em]">
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
      <p className="text-[12px] font-semibold text-[#6e6a7a] uppercase tracking-[0.08em]">
        Resumen General
      </p>

      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-3">
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
      <div className="space-y-3">
        <PlatformSection platform="TikTok" data={data.tiktok} accentColor="#F87171" />
        <PlatformSection platform="Instagram" data={data.instagram} accentColor="#EF4444" />
      </div>
    </div>
  );
}