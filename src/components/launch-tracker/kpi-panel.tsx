"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Target, CheckCircle2, Edit3, Eye, Heart, MousePointer, Music,
  Zap, Trophy, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface KPIItem {
  id: string; name: string; description: string | null; platform: string | null;
  target: number; current: number; unit: string; category: string;
}

const categoryConfig: Record<string, {
  label: string; icon: React.ElementType; color: string; bg: string;
}> = {
  alcance: { label: "Alcance", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/[0.08]" },
  engagement: { label: "Engagement", icon: Heart, color: "text-pink-400", bg: "bg-pink-500/[0.08]" },
  conversion: { label: "Conversión", icon: MousePointer, color: "text-emerald-400", bg: "bg-emerald-500/[0.08]" },
  streaming: { label: "Streaming", icon: Music, color: "text-amber-400", bg: "bg-amber-500/[0.08]" },
};

function CircularProgress({ value, max, size = 100, strokeWidth = 6, glow = false }: {
  value: number; max: number; size?: number; strokeWidth?: number; glow?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {glow && (
        <div
          className="absolute inset-[-6px] rounded-full opacity-30 blur-xl"
          style={{
            background: progress >= 1
              ? "radial-gradient(circle, rgba(52,199,89,0.4) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(214,0,28,0.35) 0%, transparent 70%)",
          }}
        />
      )}
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={value >= max ? "#34c759" : "#D6001C"}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-white tracking-[-0.03em]" style={{ fontSize: size * 0.22 }}>
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
}

function KPICard({ kpi, onUpdate, isEditing, editValue, onStartEdit, onSaveEdit, onCancelEdit, onEditChange, index }: {
  kpi: KPIItem;
  onUpdate: (id: string, current: number) => void;
  isEditing: boolean;
  editValue: string;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (v: string) => void;
  index: number;
}) {
  const pct = kpi.target > 0 ? Math.min((kpi.current / kpi.target) * 100, 100) : 0;
  const isComplete = kpi.current >= kpi.target;
  const isOnTrack = !isComplete && pct >= 50;
  const remaining = Math.max(0, kpi.target - kpi.current);

  const accentColor = isComplete
    ? "bg-emerald-500"
    : isOnTrack
      ? "bg-amber-500"
      : "bg-[#48484a]";

  const glowColor = isComplete
    ? "shadow-[0_0_8px_rgba(52,199,89,0.3)]"
    : isOnTrack
      ? "shadow-[0_0_8px_rgba(245,158,11,0.25)]"
      : "";

  const fillColor = isComplete ? "bg-emerald-500" : "bg-[#D6001C]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.05,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="glass hover-lift rounded-2xl overflow-hidden group relative"
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl ${accentColor}`} />

      <div className="pl-3.5 pr-3.5 pt-3.5 pb-3">
        {/* Top: name + status icon */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-[13px] font-medium text-white tracking-[-0.01em] leading-snug flex-1 mr-3">
            {kpi.name}
          </p>
          {isComplete ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 + 0.2 }}
            >
              <Trophy className="h-[15px] w-[15px] text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />
            </motion.div>
          ) : pct >= 75 ? (
            <Zap className="h-[15px] w-[15px] text-amber-500 shrink-0 mt-0.5" strokeWidth={1.5} />
          ) : (
            <Target className="h-[15px] w-[15px] text-[#48484a] shrink-0 mt-0.5" strokeWidth={1.5} />
          )}
        </div>

        {/* Value + progress percentage */}
        <div className="flex items-end justify-between mb-3.5">
          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => onEditChange(e.target.value)}
                  min="0" step="any" autoFocus
                  className="h-8 w-28 text-[14px] bg-white/[0.04] border-white/[0.08] text-white rounded-[10px] px-2.5"
                />
                <button
                  onClick={onSaveEdit}
                  className="h-8 px-3 text-[12px] font-medium rounded-[8px] bg-[#D6001C] text-white transition-opacity hover:opacity-90"
                >
                  OK
                </button>
                <button
                  onClick={onCancelEdit}
                  className="h-8 px-2 text-[12px] rounded-[8px] bg-white/[0.04] text-[#6e6e73] transition-opacity hover:opacity-80"
                >
                  X
                </button>
              </div>
            ) : (
              <button onClick={onStartEdit} className="flex items-baseline gap-2 group/edit">
                <span className="text-[26px] font-bold text-white tracking-[-0.03em] leading-none tabular-nums group-hover/edit:text-white/80 transition-colors duration-300">
                  {kpi.current.toLocaleString()}
                </span>
                {kpi.unit && (
                  <span className="text-[11px] text-[#6e6e73] font-medium">{kpi.unit}</span>
                )}
                <Edit3 className="h-[11px] w-[11px] text-[#48484a] opacity-0 group-hover/edit:opacity-60 transition-all duration-300 group-hover/edit:translate-x-0 translate-x-[-2px]" />
              </button>
            )}
          </div>
          <span className={`text-[18px] font-bold tabular-nums tracking-[-0.02em] ${
            isComplete ? "text-emerald-500" : "text-[#6e6e73]"
          }`}>
            {Math.round(pct)}%
          </span>
        </div>

        {/* Progress bar — 4px with subtle glow */}
        <div className="h-1 rounded-full bg-white/[0.04] mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 + 0.1 }}
            className={`h-full rounded-full ${fillColor} ${glowColor}`}
          />
        </div>

        {/* Footer: target + platform */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#48484a]">
            Meta: <span className="text-[#a1a1a6] font-medium">{kpi.target.toLocaleString()} {kpi.unit}</span>
            {!isComplete && remaining > 0 && (
              <span className="text-[#48484a] ml-1.5">
                &middot; Faltan {remaining.toLocaleString()}
              </span>
            )}
          </span>
          {kpi.platform && (
            <span className={`text-[10px] font-semibold px-2.5 py-[3px] rounded-lg tracking-[0.02em] ${
              kpi.platform === "tiktok"
                ? "bg-[#D6001C]/[0.06] text-[#ff6b7a] border border-[#D6001C]/[0.08]"
                : "bg-[#ec4899]/[0.06] text-[#f9a8d4] border border-[#ec4899]/[0.08]"
            }`}>
              {kpi.platform === "tiktok" ? "TikTok" : "IG"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function KPIPanel({ data }: { data: KPIItem[] }) {
  const [kpis, setKpis] = useState<KPIItem[]>(data);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleUpdate = async (id: string, current: number) => {
    try {
      const r = await fetch("/api/kpis", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, current }),
      });
      if (r.ok) {
        setKpis((p) => p.map((k) => (k.id === id ? { ...k, current } : k)));
        setEditId(null);
        toast.success("KPI actualizado");
      }
    } catch { toast.error("Error al actualizar"); }
  };

  const grouped: Record<string, KPIItem[]> = {};
  kpis.forEach((k) => {
    if (!grouped[k.category]) grouped[k.category] = [];
    grouped[k.category].push(k);
  });

  const completed = kpis.filter((k) => k.current >= k.target).length;
  const onTrack = kpis.filter((k) => {
    const p = k.target > 0 ? (k.current / k.target) * 100 : 0;
    return p >= 50 && p < 100;
  }).length;
  const atRisk = kpis.length - completed - onTrack;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.p
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-[0.1em]"
      >
        KPIs y Objetivos
      </motion.p>

      {/* ─── Summary card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-accent rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden"
      >
        {/* Ambient top glow */}
        <div className="ambient-glow-top absolute inset-x-0 top-0 h-20 pointer-events-none" />

        {/* Circular progress — larger with glow */}
        <div className="shrink-0 relative">
          <CircularProgress value={completed} max={kpis.length} size={110} strokeWidth={7} glow />
        </div>

        <div className="flex-1 space-y-3 relative z-10">
          <div>
            <p className="text-[15px] font-semibold text-white tracking-[-0.02em]">
              Progreso General
            </p>
            <p className="text-[12px] text-[#a1a1a6] mt-0.5 tracking-[-0.01em]">
              {completed} de {kpis.length} objetivos completados
            </p>
          </div>

          {/* Mini stat cards with colored top borders */}
          <div className="flex gap-2.5">
            <div className="flex-1 relative rounded-xl bg-white/[0.03] border border-white/[0.05] overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-emerald-500/60" />
              <div className="pt-3 pb-2 px-3">
                <p className="text-[18px] font-bold text-emerald-500 tracking-[-0.03em] tabular-nums leading-none">
                  {completed}
                </p>
                <p className="text-[9px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium mt-1.5">
                  Logrados
                </p>
              </div>
            </div>
            <div className="flex-1 relative rounded-xl bg-white/[0.03] border border-white/[0.05] overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-amber-500/60" />
              <div className="pt-3 pb-2 px-3">
                <p className="text-[18px] font-bold text-amber-500 tracking-[-0.03em] tabular-nums leading-none">
                  {onTrack}
                </p>
                <p className="text-[9px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium mt-1.5">
                  En camino
                </p>
              </div>
            </div>
            <div className="flex-1 relative rounded-xl bg-white/[0.03] border border-white/[0.05] overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-[#6e6e73]/40" />
              <div className="pt-3 pb-2 px-3">
                <p className="text-[18px] font-bold text-[#a1a1a6] tracking-[-0.03em] tabular-nums leading-none">
                  {atRisk}
                </p>
                <p className="text-[9px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium mt-1.5">
                  En riesgo
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Category groups ─── */}
      {Object.entries(grouped).map(([category, items], catIdx) => {
        const config = categoryConfig[category] || categoryConfig.alcance;
        const CatIcon = config.icon;
        const catCompleted = items.filter((k) => k.current >= k.target).length;
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 + catIdx * 0.1, duration: 0.4 }}
          >
            {/* Category header */}
            <div className="flex items-center gap-3 mb-3.5 px-1">
              <div className={`p-[7px] rounded-[10px] ${config.bg} border border-white/[0.04]`}>
                <CatIcon className={`h-[13px] w-[13px] ${config.color}`} strokeWidth={1.8} />
              </div>
              <span className="text-[11px] font-semibold text-[#a1a1a6] uppercase tracking-[0.1em]">
                {config.label}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] text-[#6e6e73] tabular-nums font-medium">
                  {catCompleted}/{items.length}
                </span>
                <div className="w-12 h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${items.length > 0 ? (catCompleted / items.length) * 100 : 0}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 + catIdx * 0.1 }}
                    className="h-full rounded-full bg-white/[0.15]"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="glass-divider mb-3" />

            <div className="space-y-2.5">
              {items.map((kpi, i) => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  index={i}
                  onUpdate={handleUpdate}
                  isEditing={editId === kpi.id}
                  editValue={editValue}
                  onStartEdit={() => { setEditId(kpi.id); setEditValue(String(kpi.current)); }}
                  onSaveEdit={() => handleUpdate(kpi.id, parseFloat(editValue) || 0)}
                  onCancelEdit={() => setEditId(null)}
                  onEditChange={setEditValue}
                />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}