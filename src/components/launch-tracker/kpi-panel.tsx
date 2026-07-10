"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Target, CheckCircle2, Edit3, Eye, Heart, MousePointer, Music,
  Zap, Trophy,
} from "lucide-react";
import { toast } from "sonner";

interface KPIItem {
  id: string; name: string; description: string | null; platform: string | null;
  target: number; current: number; unit: string; category: string;
}

const categoryConfig: Record<string, {
  label: string; icon: React.ElementType; color: string; bg: string;
}> = {
  alcance: { label: "Alcance", icon: Eye, color: "text-[#F87171]", bg: "bg-[#EF4444]/[0.08]" },
  engagement: { label: "Engagement", icon: Heart, color: "text-pink-400", bg: "bg-pink-500/[0.08]" },
  conversion: { label: "Conversión", icon: MousePointer, color: "text-emerald-400", bg: "bg-emerald-500/[0.08]" },
  streaming: { label: "Streaming", icon: Music, color: "text-amber-400", bg: "bg-amber-500/[0.08]" },
};

function CircularProgress({ value, max, size = 100, strokeWidth = 6 }: {
  value: number; max: number; size?: number; strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="rgba(239,68,68,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={value >= max ? "#34d399" : "url(#redRing)"}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }} />
        <defs>
          <linearGradient id="redRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-bold text-white tracking-[-0.02em] text-glow">
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
  const remaining = Math.max(0, kpi.target - kpi.current);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-4"
    >
      {/* Top: name + status */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-[13px] font-medium text-white tracking-[-0.01em] leading-snug flex-1 mr-3">
          {kpi.name}
        </p>
        {isComplete ? (
          <Trophy className="h-[16px] w-[16px] text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
        ) : pct >= 75 ? (
          <Zap className="h-[16px] w-[16px] text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
        ) : (
          <Target className="h-[16px] w-[16px] text-[#3d3850] shrink-0 mt-0.5" strokeWidth={1.5} />
        )}
      </div>

      {/* Value + progress */}
      <div className="flex items-end justify-between mb-3">
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={editValue}
                onChange={(e) => onEditChange(e.target.value)}
                min="0" step="any" autoFocus
                className="h-8 w-28 text-[14px] bg-white/[0.03] border-[#EF4444]/[0.15] text-white rounded-[10px] px-2.5 focus:border-[#EF4444]/40"
              />
              <button
                onClick={onSaveEdit}
                className="h-8 px-3 text-[12px] font-medium rounded-[8px] btn-primary"
                style={{ padding: "0 12px" }}
              >
                OK
              </button>
              <button
                onClick={onCancelEdit}
                className="h-8 px-2.5 text-[12px] rounded-[8px] bg-white/[0.03] text-[#6e6a7a] border border-white/[0.05] transition-opacity hover:opacity-80"
              >
                X
              </button>
            </div>
          ) : (
            <button onClick={onStartEdit} className="flex items-baseline gap-2 group">
              <span className="text-[26px] font-bold text-white tracking-[-0.03em] leading-none tabular-nums group-hover:text-[#F87171] transition-colors duration-200">
                {kpi.current.toLocaleString()}
              </span>
              {kpi.unit && (
                <span className="text-[12px] text-[#6e6a7a]">{kpi.unit}</span>
              )}
              <Edit3 className="h-[12px] w-[12px] text-[#2a2435] group-hover:text-[#6e6a7a] transition-colors" />
            </button>
          )}
        </div>
        <span className={`text-[20px] font-bold tabular-nums tracking-[-0.02em] ${
          isComplete ? "text-emerald-400" : "text-[#6e6a7a]"
        }`}>
          {Math.round(pct)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-[4px] rounded-full bg-white/[0.03] mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
          className={`h-full rounded-full ${isComplete ? "bg-emerald-400" : "glass-progress-fill"}`}
        />
      </div>

      {/* Footer: target + platform */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#3d3850]">
          Meta: <span className="text-[#6e6a7a] font-medium">{kpi.target.toLocaleString()} {kpi.unit}</span>
          {!isComplete && remaining > 0 && (
            <span className="text-[#2a2435] ml-1.5">
              · Faltan {remaining.toLocaleString()}
            </span>
          )}
        </span>
        {kpi.platform && (
          <span className={`text-[10px] font-medium px-2.5 py-[3px] rounded-full ${
            kpi.platform === "tiktok"
              ? "bg-[#EF4444]/[0.08] text-[#F87171] border border-[#EF4444]/[0.1]"
              : "bg-[#B91C1C]/[0.08] text-[#EF4444] border border-[#B91C1C]/[0.1]"
          }`}>
            {kpi.platform === "tiktok" ? "TikTok" : "IG"}
          </span>
        )}
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <p className="text-[12px] font-semibold text-[#6e6a7a] uppercase tracking-[0.08em]">
        KPIs y Objetivos
      </p>

      {/* Summary card */}
      <div className="glass-accent p-5 flex items-center gap-5">
        <CircularProgress value={completed} max={kpis.length} />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-[14px] font-semibold text-white tracking-[-0.01em]">Progreso General</p>
            <p className="text-[11px] text-[#6e6a7a] mt-0.5">
              {completed} de {kpis.length} objetivos
            </p>
          </div>
          <div className="flex gap-2.5">
            <div className="flex-1 py-2 px-3 rounded-[14px] bg-emerald-500/[0.04] border border-emerald-500/[0.06]">
              <p className="text-[18px] font-bold text-emerald-400 tracking-[-0.02em]">{completed}</p>
              <p className="text-[9px] text-[#3d3850] uppercase tracking-[0.08em] font-medium mt-[-1px]">Logrados</p>
            </div>
            <div className="flex-1 py-2 px-3 rounded-[14px] bg-amber-500/[0.04] border border-amber-500/[0.06]">
              <p className="text-[18px] font-bold text-amber-400 tracking-[-0.02em]">{onTrack}</p>
              <p className="text-[9px] text-[#3d3850] uppercase tracking-[0.08em] font-medium mt-[-1px]">En camino</p>
            </div>
            <div className="flex-1 py-2 px-3 rounded-[14px] bg-white/[0.015] border border-white/[0.03]">
              <p className="text-[18px] font-bold text-[#6e6a7a] tracking-[-0.02em]">
                {kpis.length - completed - onTrack}
              </p>
              <p className="text-[9px] text-[#3d3850] uppercase tracking-[0.08em] font-medium mt-[-1px]">En riesgo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category groups */}
      {Object.entries(grouped).map(([category, items]) => {
        const config = categoryConfig[category] || categoryConfig.alcance;
        const CatIcon = config.icon;
        const catCompleted = items.filter((k) => k.current >= k.target).length;
        return (
          <div key={category}>
            <div className="flex items-center gap-2.5 mb-3 px-0.5">
              <div className={`p-2 rounded-[12px] ${config.bg}`}>
                <CatIcon className={`h-[14px] w-[14px] ${config.color}`} strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-semibold text-[#6e6a7a] uppercase tracking-[0.1em]">
                {config.label}
              </span>
              <span className="text-[10px] text-[#3d3850] ml-auto tabular-nums">
                {catCompleted}/{items.length}
              </span>
            </div>
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
            <div className="h-4" />
          </div>
        );
      })}
    </div>
  );
}