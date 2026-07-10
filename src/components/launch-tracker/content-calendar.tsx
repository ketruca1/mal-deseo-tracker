"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, Clock, PlayCircle, Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";

interface ContentPiece {
  id: string; title: string; description: string | null; platform: string;
  contentType: string; status: string; scheduledDate: string | null; notes: string | null;
}

const statusSteps = ["pendiente", "en_progreso", "publicado"] as const;

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pendiente: { label: "Pendiente", icon: Circle, color: "text-[#48484a]" },
  en_progreso: { label: "En progreso", icon: PlayCircle, color: "text-amber-500" },
  publicado: { label: "Publicado", icon: CheckCircle2, color: "text-emerald-500" },
};

const contentTypeLabel: Record<string, string> = {
  teaser: "Teaser", snippet: "Snippet", lyric_video: "Lyric Video", behind_scenes: "BTS", story: "Story", reel: "Reel",
};

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.floor((d.getTime() - new Date("2025-08-04T00:00:00").getTime()) / 86400000);
  if (diff <= -22) return "Semana 1"; if (diff <= -15) return "Semana 2";
  if (diff <= -8) return "Semana 3"; return "Semana 4";
}

export default function ContentCalendar() {
  const [content, setContent] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ title: "", platform: "ambas", contentType: "reel", scheduledDate: "" });

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => { setContent(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const r = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: newStatus }) });
      if (r.ok) { setContent((p) => p.map((c) => c.id === id ? { ...c, status: newStatus } : c)); toast.success("Estado actualizado"); }
    } catch { toast.error("Error al actualizar"); }
  };

  const handleAdd = async () => {
    if (!newItem.title || !newItem.scheduledDate) { toast.error("Titulo y fecha requeridos"); return; }
    try {
      const r = await fetch("/api/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newItem) });
      if (r.ok) {
        const created = await r.json();
        setContent((p) => [...p, created].sort((a, b) => (a.scheduledDate || "").localeCompare(b.scheduledDate || "")));
        setNewItem({ title: "", platform: "ambas", contentType: "reel", scheduledDate: "" });
        setShowAdd(false); toast.success("Contenido agregado");
      }
    } catch { toast.error("Error al agregar"); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32 rounded-lg bg-white/[0.04]" />
        <Skeleton className="h-12 w-full rounded-2xl bg-white/[0.03]" />
        {[1,2,3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white/[0.03]" />)}
      </div>
    );
  }

  const publishedCount = content.filter((c) => c.status === "publicado").length;
  const grouped: Record<string, ContentPiece[]> = {};
  content.filter((c) => c.scheduledDate).forEach((c) => {
    const w = getWeekLabel(c.scheduledDate!);
    if (!grouped[w]) grouped[w] = [];
    grouped[w].push(c);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-[0.06em]">
          Calendario de Contenido
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="h-8 px-3 rounded-[10px] text-[13px] font-medium text-white tap-feedback flex items-center gap-1.5"
          style={{ background: "#D6001C" }}
        >
          {showAdd ? <X className="h-[14px] w-[14px]" strokeWidth={2} /> : <Plus className="h-[14px] w-[14px]" strokeWidth={2} />}
          {showAdd ? "Cancelar" : "Agregar"}
        </button>
      </div>

      {showAdd && (
        <div className="glass p-4 space-y-3 rounded-2xl">
          <div>
            <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium block mb-1">Titulo *</label>
            <input value={newItem.title} onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))} placeholder="Ej: Teaser #5"
              className="w-full h-10 px-3 text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium block mb-1">Plataforma</label>
              <select value={newItem.platform} onChange={(e) => setNewItem((p) => ({ ...p, platform: e.target.value }))}
                className="w-full h-10 px-3 text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] outline-none">
                <option value="tiktok" style={{background:'#1c1c1e'}}>TikTok</option>
                <option value="instagram" style={{background:'#1c1c1e'}}>Instagram</option>
                <option value="ambas" style={{background:'#1c1c1e'}}>Ambas</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium block mb-1">Tipo</label>
              <select value={newItem.contentType} onChange={(e) => setNewItem((p) => ({ ...p, contentType: e.target.value }))}
                className="w-full h-10 px-3 text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] outline-none">
                {Object.entries(contentTypeLabel).map(([k, v]) => <option key={k} value={k} style={{background:'#1c1c1e'}}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium block mb-1">Fecha *</label>
            <input type="date" value={newItem.scheduledDate} onChange={(e) => setNewItem((p) => ({ ...p, scheduledDate: e.target.value }))}
              className="w-full h-10 px-3 text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] outline-none" />
          </div>
          <button onClick={handleAdd} className="w-full h-10 text-[14px] font-semibold rounded-[12px] text-white tap-feedback" style={{ background: "#D6001C" }}>
            Crear Pieza de Contenido
          </button>
        </div>
      )}

      <div className="glass p-3">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[11px] font-medium">Progreso</p>
          <span className="text-[11px] font-semibold text-white tabular-nums">{publishedCount}/{content.length}</span>
        </div>
        <div className="h-[3px] glass-progress overflow-hidden">
          <div className="h-full glass-progress-fill transition-all duration-500"
            style={{ width: content.length > 0 ? (publishedCount / content.length) * 100 + "%" : "0%" }} />
        </div>
      </div>

      {Object.entries(grouped).map(([week, items]) => (
        <div key={week}>
          <p className="text-[11px] font-semibold text-[#48484a] uppercase tracking-[0.08em] mb-3 px-0.5">
            {week} - {items.length} piezas
          </p>
          <div className="space-y-2">
            {items.map((item) => {
              const sc = statusConfig[item.status] || statusConfig.pendiente;
              const StatusIcon = sc.icon;
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} className="glass overflow-hidden transition-all duration-200">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <button onClick={() => {
                          const idx = statusSteps.indexOf(item.status as typeof statusSteps[number]);
                          const next = statusSteps[(idx + 1) % statusSteps.length];
                          handleStatusChange(item.id, next);
                        }} className="mt-[2px] shrink-0 tap-feedback">
                        <StatusIcon className={"h-[20px] w-[20px] transition-colors duration-200 " + sc.color} strokeWidth={item.status === "publicado" ? 2 : 1.5} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={"text-[14px] font-medium tracking-[-0.01em] " + (item.status === "publicado" ? "text-[#48484a] line-through" : "text-white")}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-medium px-2 py-[2px] rounded-full bg-white/[0.04] text-[#6e6e73] border border-white/[0.04]">
                            {item.platform === "ambas" ? "TT + IG" : item.platform === "tiktok" ? "TikTok" : "IG"}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-[2px] rounded-full bg-white/[0.04] text-[#6e6e73] border border-white/[0.04]">
                            {contentTypeLabel[item.contentType] || item.contentType}
                          </span>
                          {item.scheduledDate && (
                            <span className="text-[11px] text-[#48484a] flex items-center gap-1">
                              <Clock className="h-[11px] w-[11px]" strokeWidth={1.5} />
                              {item.scheduledDate.slice(5)}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[12px] text-[#6e6e73] mt-2 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                      <button onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-full hover:bg-white/[0.04] transition-colors text-[#48484a] hover:text-white shrink-0">
                        {isExpanded ? <ChevronUp className="h-[16px] w-[16px]" strokeWidth={1.5} /> : <ChevronDown className="h-[16px] w-[16px]" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
                      {item.notes && <p className="text-[12px] text-[#8e8e93]">{item.notes}</p>}
                      {!item.notes && <p className="text-[12px] text-[#48484a]">Sin notas adicionales</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}