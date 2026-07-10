"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Plus, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react";
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[12px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.06) 100%)",
                border: "0.5px solid rgba(239,68,68,0.12)",
              }}
            >
              <RefreshCw className={`h-4 w-4 text-[#F87171] ${syncing ? "animate-spin" : ""}`} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white tracking-[-0.01em]">Sincronizar</p>
              <p className="text-[11px] text-[#3d3850]">Datos manuales desde cada plataforma</p>
            </div>
          </div>
          {lastSync && (
            <span className="text-[10px] text-[#3d3850] font-medium">{lastSync}</span>
          )}
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={syncAll}
            disabled={syncing}
            className="flex-1 h-11 rounded-[14px] text-[14px] font-semibold text-white tap-feedback flex items-center justify-center gap-2 transition-all disabled:opacity-40 btn-primary"
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
            className="w-11 h-11 rounded-[14px] bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[#6e6a7a] hover:text-white transition-colors tap-feedback"
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
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3.5 space-y-2.5">
              {entries.map((entry, idx) => {
                const isTT = entry.platform === "tiktok";
                const accentColor = isTT ? "#F87171" : "#EF4444";
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    className="glass p-4"
                    style={{ borderColor: `${accentColor}12` }}
                  >
                    {/* Entry header */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-[6px] h-[6px] rounded-full"
                          style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}40` }}
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em]"
                          style={{ color: accentColor }}>
                          {isTT ? "TikTok" : "Instagram"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {entry.saved && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium px-2.5 py-[3px] rounded-full bg-emerald-500/[0.06] border border-emerald-500/[0.08]">
                            <Check className="h-[10px] w-[10px]" /> Guardado
                          </span>
                        )}
                        {entries.length > 1 && (
                          <button onClick={() => removeEntry(entry.id)}
                            className="p-1.5 rounded-full hover:bg-white/[0.04] text-[#2a2435] hover:text-[#F87171] transition-colors">
                            <Trash2 className="h-[14px] w-[14px]" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mb-3.5">
                      <Label className="text-[10px] text-[#3d3850] uppercase tracking-[0.08em] font-medium">Fecha</Label>
                      <Input type="date" value={entry.date} onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                        className="mt-1.5 h-10 text-[13px] bg-white/[0.02] border-[#EF4444]/[0.08] text-white rounded-[12px] focus:border-[#EF4444]/30" />
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-2 gap-3">
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
                          <Label className="text-[10px] text-[#3d3850] uppercase tracking-[0.08em] font-medium">{f.label}</Label>
                          <Input
                            type="number" placeholder="0"
                            value={entry[f.key as keyof MetricEntry] as string}
                            onChange={(e) => updateEntry(entry.id, f.key as keyof MetricEntry, e.target.value)}
                            className="mt-1 h-10 text-[13px] bg-white/[0.02] border-[#EF4444]/[0.08] text-white rounded-[12px] focus:border-[#EF4444]/30"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}

              {/* Add buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => addEntry("tiktok")}
                  className="flex-1 h-10 text-[12px] font-medium rounded-[12px] bg-white/[0.015] border border-dashed border-[#EF4444]/[0.08] text-[#3d3850] hover:text-[#F87171] hover:border-[#EF4444]/20 transition-colors flex items-center justify-center gap-1.5 tap-feedback"
                >
                  <Plus className="h-[12px] w-[12px]" /> TikTok
                </button>
                <button
                  onClick={() => addEntry("instagram")}
                  className="flex-1 h-10 text-[12px] font-medium rounded-[12px] bg-white/[0.015] border border-dashed border-[#B91C1C]/[0.08] text-[#3d3850] hover:text-[#EF4444] hover:border-[#B91C1C]/20 transition-colors flex items-center justify-center gap-1.5 tap-feedback"
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