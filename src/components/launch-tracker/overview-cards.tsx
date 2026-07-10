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

/* ─── Hero Stat Card ─── */
function HeroStat({ label, value, subtitle, accent }: {
  label: string; value: string; subtitle?: string; accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden p-5 rounded-2xl transition-all duration-300 ease-out
        ${accent
          ? "glass-accent"
          : "glass"
        }
        hover:scale-[1.02] active:scale-[0.98]`}
    >
      {/* Gradient overlay — warm radial wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: accent
            ? "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(234,88,12,0.25), transparent 70%)"
            : "radial-gradient(ellipse 80% 60% at 80% 20%, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />

      {/* Shimmer sweep on accent card */}
      {accent && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "shimmer-sweep 3s ease-in-out infinite",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        <p className="text-[10px] text-[#a1a1a6] uppercase tracking-[0.1em] font-medium">
          {label}
        </p>
        <p
          className="text-[28px] font-bold text-white mt-1.5 leading-none tracking-[0.01em]"
          style={accent ? { textShadow: "0 0 32px rgba(234,88,12,0.25)" } : undefined}
        >
          {value}
        </p>
        {subtitle && (
          <p className="text-[10px] text-[#48484a] mt-2 tracking-[0.02em]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Corner accent line */}
      {accent && (
        <div
          className="absolute top-0 right-0 w-12 h-[2px] rounded-b-full opacity-60"
          style={{ background: "linear-gradient(90deg, transparent, rgba(234,88,12,0.8))" }}
        />
      )}
    </div>
  );
}

/* ─── Platform Section ─── */
function PlatformSection({ platform, data, accentColor }: {
  platform: "TikTok" | "Instagram";
  data: OverviewData["tiktok"] | OverviewData["instagram"];
  accentColor: string;
}) {
  const isTT = platform === "TikTok";
  const metrics = [
    { label: "Likes", value: data.totalLikes, icon: Heart },
    { label: "Comments", value: data.totalComments, icon: MessageCircle },
    { label: isTT ? "Shares" : "Saves", value: isTT ? data.totalShares : (data as OverviewData["instagram"]).totalSaves, icon: isTT ? Share2 : Save },
  ];

  return (
    <div className="glass p-5 space-y-5 transition-all duration-300 ease-out hover:scale-[1.005] active:scale-[0.99]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Refined dot indicator with outer ring */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-[10px] h-[10px] rounded-full opacity-20"
              style={{ backgroundColor: accentColor }}
            />
            <div
              className="w-[6px] h-[6px] rounded-full"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}60, 0 0 3px ${accentColor}80`,
              }}
            />
          </div>
          <span className="text-[13px] font-semibold text-white tracking-[-0.01em]">
            {platform}
          </span>
        </div>
        <span className="text-[10px] text-[#48484a] tracking-[0.04em] font-medium">
          {data.daysTracked} días
        </span>
      </div>

      {/* ── Views hero number + engagement ── */}
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] text-[#48484a] uppercase tracking-[0.1em] font-medium">
            Visualizaciones
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p
              className="text-[34px] font-extrabold text-white leading-none tracking-[0.01em]"
              style={{ textShadow: `0 0 40px ${accentColor}20, 0 2px 8px rgba(0,0,0,0.4)` }}
            >
              {formatNumber(data.totalViews)}
            </p>
            {/* Trend indicator */}
            <div className="flex items-center gap-0.5 mb-1.5">
              <ArrowUpRight className="h-[14px] w-[14px]" style={{ color: accentColor }} strokeWidth={2.5} />
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-[#48484a] uppercase tracking-[0.1em] font-medium mb-1.5">
            Engagement
          </p>
          {/* Colored pill/badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: `${accentColor}15`,
              border: `1px solid ${accentColor}25`,
            }}
          >
            <TrendingUp
              className="h-[11px] w-[11px]"
              style={{ color: accentColor }}
              strokeWidth={2.5}
            />
            <span
              className="text-[14px] font-bold tracking-[-0.02em] leading-none"
              style={{ color: accentColor }}
            >
              {data.engagementRate}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Metrics grid with individual card treatment ── */}
      <div className="grid grid-cols-3 gap-2">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="relative rounded-xl p-3 transition-colors duration-200 hover:bg-white/[0.03]"
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              {/* Subtle top highlight */}
              <div
                className="absolute top-0 left-3 right-3 h-[1px] opacity-40"
                style={{ background: `linear-gradient(90deg, transparent, ${accentColor}30, transparent)` }}
              />
              <Icon
                className="h-[13px] w-[13px] mb-2"
                style={{ color: `${accentColor}90` }}
                strokeWidth={1.5}
              />
              <p className="text-[15px] font-bold text-white tracking-[-0.01em] tabular-nums leading-none">
                {formatNumber(m.value)}
              </p>
              <p className="text-[9px] text-[#6e6e73] mt-1.5 tracking-[0.04em] uppercase font-medium">
                {m.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Profile views footer ── */}
      {"profileViews" in data && data.profileViews > 0 && (
        <div className="relative flex items-center justify-between pt-4 mt-1">
          {/* Refined divider with gradient fade */}
          <div
            className="absolute left-5 right-5 h-[1px] opacity-50"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)`,
            }}
          />
          <div className="relative flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-md bg-white/[0.04]">
              <Users
                className="h-[11px] w-[11px]"
                style={{ color: accentColor }}
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[11px] text-[#a1a1a6] tracking-[0.02em]">
              Visitas al perfil
            </span>
          </div>
          <span className="relative text-[13px] font-semibold text-white tracking-[-0.01em] tabular-nums">
            {data.profileViews.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Export ─── */
export default function OverviewCards({ data }: { data: OverviewData }) {
  return (
    <div className="space-y-4">
      {/* Section heading */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-[3px] h-3 rounded-full bg-white/20" />
        <p className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-[0.1em]">
          Resumen General
        </p>
      </div>

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
        <PlatformSection platform="TikTok" data={data.tiktok} accentColor="#D6001C" />
        <PlatformSection platform="Instagram" data={data.instagram} accentColor="#ec4899" />
      </div>

      {/* Inline keyframes for shimmer */}
      <style jsx>{`
        @keyframes shimmer-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}