"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Plus, Trash2, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { recordMetricStreak } from "@/hooks/use-notifications";

interface MetricEntry {
  id: string;
  platform: "tiktok" | "instagram";
  date: string;
  views: string; likes: string; comments: string; shares: string; saves: string;
  profileViews: string; followers: string; linkClicks: string; notes: string;
  saving: boolean; saved: boolean; error: boolean;
}

const defaultEntry = (platform: "tiktok" | "instagram" = "tiktok"): MetricEntry => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
  platform, date: new Date().toISOString().slice(0, 10),
  views: "", likes: "", comments: "", shares: "", saves: "",
  profileViews: "", followers: "", linkClicks: "", notes: "",
  saving: false, saved: false, error: false,
});

export default function SyncPanel({ onSynced }: { onSynced: () => void }) {
  const [entries, setEntries] = useState<MetricEntry[]>([defaultEntry("tiktok"), defaultEntry("instagram")]);
  const [syncing, setSyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const addEntry = (platform: "tiktok" | "instagram") => {
    setEntries((prev) => [...prev, defaultEntry(platform)]);
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) { toast.error("Debe haber al menos una entrada"); return; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof MetricEntry, value: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value, saved: false, error: false } : e)));
  };

  const buildBody = (entry: MetricEntry) => ({
    platform: entry.platform, date: entry.date,
    views: parseInt(entry.views) || 0, likes: parseInt(entry.likes) || 0,
    comments: parseInt(entry.comments) || 0, shares: parseInt(entry.shares) || 0,
    saves: parseInt(entry.saves) || 0, profileViews: parseInt(entry.profileViews) || 0,
    followers: parseInt(entry.followers) || 0, linkClicks: parseInt(entry.linkClicks) || 0,
    notes: entry.notes || undefined,
  });

  const syncAll = async () => {
    setSyncing(true);
    let successCount = 0;
    for (const entry of entries) {
      if (!entry.date) continue;
      try {
        const r = await fetch("/api/metrics", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildBody(entry)),
        });
        if (r.ok) successCount++;
      } catch { /* skip */ }
    }
    setSyncing(false);
    setLastSync(new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
    recordMetricStreak();
    toast.success(`${successCount} métrica(s) sincronizadas`);
    onSynced();
  };

  return (
    <div className="space-y-0">
      {/* Sync card */}
      <div className="glass-accent p-4">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{ background: "rgba(214, 0, 28, 0.1)", border: "0.5px solid rgba(214, 0, 28, 0.12)" }}
            >
              <RefreshCw className={`h-[14px] w-[14px] text-[#D6001C] ${syncing ? "animate-spin" : ""}`} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white tracking-[-0.01em]">Sincronizar</p>
              <p className="text-[11px] text-[#48484a]">Datos manuales desde cada plataforma</p>
            </div>
          </div>
          {lastSync && (
            <span className="text-[10px] text-[#48484a] font-medium">{lastSync}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={syncAll}
            disabled={syncing}
            className="flex-1 h-10 rounded-[12px] text-[14px] font-semibold text-white tap-feedback flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
            style={{ background: "#D6001C" }}
          >
            {syncing ? (
              <div className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <RefreshCw className="h-[14px] w-[14px]" strokeWidth={2} />
            )}
            Sincronizar Todo
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-10 h-10 rounded-[12px] bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#6e6e73] hover:text-white transition-colors tap-feedback"
          >
            {expanded
              ? <ChevronUp className="h-[16px] w-[16px]" strokeWidth={1.5} />
              : <ChevronDown className="h-[16px] w-[16px]" strokeWidth={1.5} />
            }
          </button>
        </div>
      </div>

      {/* Expandable entries */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2.5">
              {entries.map((entry, idx) => {
                const isTT = entry.platform === "tiktok";
                const accentColor = isTT ? "#D6001C" : "#ec4899";
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    className="glass p-4"
                    style={{ borderColor: `${accentColor}15` }}
                  >
                    {/* Entry header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-[5px] h-[5px] rounded-full"
                          style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}40` }}
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                          style={{ color: isTT ? "#ff6b7a" : "#f9a8d4" }}>
                          {isTT ? "TikTok" : "Instagram"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {entry.saved && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium px-2 py-[2px] rounded-full bg-emerald-500/[0.08]">
                            <Check className="h-[10px] w-[10px]" /> Guardado
                          </span>
                        )}
                        {entries.length > 1 && (
                          <button onClick={() => removeEntry(entry.id)}
                            className="p-1.5 rounded-full hover:bg-white/[0.04] text-[#48484a] hover:text-[#D6001C] transition-colors">
                            <Trash2 className="h-[14px] w-[14px]" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mb-3">
                      <Label className="text-[10px] text-[#48484a] uppercase tracking-[0.06em] font-medium">Fecha</Label>
                      <Input type="date" value={entry.date} onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                        className="mt-1 h-9 text-[13px] bg-white/[0.03] border-white/[0.06] text-white rounded-[10px]" />
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { key: "views", label: "Views" },
                        { key: "likes", label: "Likes" },
                        { key: "comments", label: "Comments" },
                        { key: isTT ? "shares" : "saves", label: isTT ? "Shares" : "Saves" },
                        { key: "profileViews", label: "Visitas perfil" },
                        { key: "followers", label: "Seguidores" },
                        ...(isTT ? [] : [{ key: "linkClicks", label: "Clics enlace" }]),
                      ].map((f) => (
                        <div key={f.key}>
                          <Label className="text-[10px] text-[#48484a] uppercase tracking-[0.06em] font-medium">{f.label}</Label>
                          <Input
                            type="number" placeholder="0"
                            value={entry[f.key as keyof MetricEntry] as string}
                            onChange={(e) => updateEntry(entry.id, f.key as keyof MetricEntry, e.target.value)}
                            className="mt-0.5 h-9 text-[13px] bg-white/[0.03] border-white/[0.06] text-white rounded-[10px]"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}

              {/* Add buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => addEntry("tiktok")}
                  className="flex-1 h-9 text-[12px] font-medium rounded-[10px] bg-white/[0.02] border border-dashed border-white/[0.06] text-[#48484a] hover:text-[#ff6b7a] hover:border-[#D6001C]/20 transition-colors flex items-center justify-center gap-1.5 tap-feedback"
                >
                  <Plus className="h-[12px] w-[12px]" /> TikTok
                </button>
                <button
                  onClick={() => addEntry("instagram")}
                  className="flex-1 h-9 text-[12px] font-medium rounded-[10px] bg-white/[0.02] border border-dashed border-white/[0.06] text-[#48484a] hover:text-[#f9a8d4] hover:border-[#ec4899]/20 transition-colors flex items-center justify-center gap-1.5 tap-feedback"
                >
                  <Plus className="h-[12px] w-[12px]" /> Instagram
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}