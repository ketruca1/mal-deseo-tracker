"use client";

import { useState } from "react";
import {
  CheckCircle2, Circle, Clock, PlayCircle, Plus, Film, Tv, Music, Camera,
  ChevronDown, ChevronUp, Lightbulb, Target, Minus, Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface ContentPiece {
  id: string; title: string; description: string | null; platform: string;
  contentType: string; status: string; scheduledDate: string | null; notes: string | null;
}

const statusSteps = ["pendiente", "en_progreso", "publicado"] as const;

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pendiente: { label: "Pendiente", icon: Circle, color: "text-[#48484a]" },
  en_progreso: { label: "En progreso", icon: PlayCircle, color: "text-amber-400" },
  publicado: { label: "Publicado", icon: CheckCircle2, color: "text-emerald-400" },
  cancelado: { label: "Cancelado", icon: Circle, color: "text-[#48484a]" },
};

const contentTypeLabel: Record<string, string> = {
  teaser: "Teaser", snippet: "Snippet", lyric_video: "Lyric Video", behind_scenes: "BTS", story: "Story", reel: "Reel",
};

const strategyAdvice: Record<string, { objective: string; tips: string[]; bestTime: string; hashtagStrategy: string }> = {
  teaser: {
    objective: "Generar curiosidad y anticipación sin revelar la canción completa.",
    tips: ["Usa los primeros 3-5 segundos del coro", "Publica en horarios de alta actividad (7-9pm)", "NO muestres la cara del artista aún", "Usa texto tipo '¿Listo para esto?'"],
    bestTime: "Mar a Jue, 7:00–9:00 PM",
    hashtagStrategy: "#bachata2025 #nuevamúsica #maldeseo #kevincano #trending",
  },
  snippet: {
    objective: "Mostrar un fragmento adictivo de 10-15 segundos que se quede en la cabeza del oyente.",
    tips: ["Elige el momento más memorable musicalmente", "Usa técnica 'split screen' con reacciones", "Acompaña con CTA: 'Guarda este sonido'", "Considera crear un sonido original de TikTok"],
    bestTime: "Vie y Sáb (fin de semana)",
    hashtagStrategy: "#soundoriginal #snippet #maldeseo #kevincano",
  },
  lyric_video: {
    objective: "Conectar emocionalmente con la letra. Generan más shares y saves.",
    tips: ["Sincroniza las letras con momentos visuales potentes", "Usa tipografía cinematográfica centrada", "Incluye silencio visual dramático en partes clave", "Agrega subtítulos en inglés"],
    bestTime: "Dom a Mié",
    hashtagStrategy: "#lyricvideo #letras #maldeseo #bachatalyrics",
  },
  behind_scenes: {
    objective: "Humanizar al artista. BTS genera 3x más engagement por autenticidad.",
    tips: ["Muestra MOMENTOS REALES: ensayos, errores, risas", "Habla directamente a cámara como vlog corto", "Incluye clips del proceso de grabación", "La vulnerabilidad genera lealtad"],
    bestTime: "Lun y Mié",
    hashtagStrategy: "#bts #detrascenarios #maldeseo #kevincano",
  },
  story: {
    objective: "Mantener presencia diaria sin saturar. Stories para micro-contenido.",
    tips: ["Usa stickers interactivos: encuestas, sliders", "Cuenta un dato interesante del día", "Haz 'countdown stories' cada vez que falten menos días", "Pregunta a tu audiencia para generar conversación"],
    bestTime: "12PM, 7PM y 10PM (2-3 por día)",
    hashtagStrategy: "No uses hashtags en stories",
  },
  reel: {
    objective: "Maximizar alcance. Los Reels tienen el mayor potencial viral en Instagram.",
    tips: ["Usa audio trending + tu canción", "Los primeros 0.5 segundos DEFINEN si alguien se detiene", "Incluye subtítulos grandes y legibles", "Crea variaciones: mismo concepto en 3 versiones"],
    bestTime: "Sáb 8-10PM",
    hashtagStrategy: "#reels #bachata #maldeseo #kevincano #viral",
  },
};

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.floor((d.getTime() - new Date("2025-08-04T00:00:00").getTime()) / 86400000);
  if (diff <= -22) return "Semana 1"; if (diff <= -15) return "Semana 2";
  if (diff <= -8) return "Semana 3"; return "Semana 4";
}

interface ContentCalendarProps {
  content: ContentPiece[];
  onRefresh?: () => void;
}

export default function ContentCalendar({ content: initialContent, onRefresh }: ContentCalendarProps) {
  const [content, setContent] = useState<ContentPiece[]>(initialContent);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    title: "", description: "", platform: "ambas", contentType: "reel", scheduledDate: "", notes: ""
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const r = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: newStatus }) });
      if (r.ok) { setContent((p) => p.map((c) => c.id === id ? { ...c, status: newStatus } : c)); toast.success("Estado actualizado"); }
    } catch { toast.error("Error al actualizar"); }
  };

  const handleAdd = async () => {
    if (!newItem.title || !newItem.scheduledDate) { toast.error("Título y fecha requeridos"); return; }
    try {
      const r = await fetch("/api/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newItem) });
      if (r.ok) {
        const created = await r.json();
        setContent((p) => [...p, created].sort((a, b) => (a.scheduledDate || "").localeCompare(b.scheduledDate || "")));
        setNewItem({ title: "", description: "", platform: "ambas", contentType: "reel", scheduledDate: "", notes: "" });
        setShowForm(false); toast.success("Contenido agregado"); onRefresh?.();
      }
    } catch { toast.error("Error al agregar"); }
  };

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
        <p className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-[0.08em]">Calendario de Contenido</p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary h-8 px-3.5 text-[12px] font-medium text-white tap-feedback flex items-center gap-1.5" style={{ padding: "0 14px" }}>
          {showForm ? <Minus className="h-[14px] w-[14px]" strokeWidth={2} /> : <Plus className="h-[14px] w-[14px]" strokeWidth={2} />}
          {showForm ? "Cerrar" : "Agregar"}
        </button>
      </div>

      {showForm && (
        <div className="glass p-4 space-y-3" style={{ borderColor: "rgba(214,0,28,0.1)" }}>
          <div>
            <label className="text-[10px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium block mb-1.5">Título *</label>
            <input type="text" value={newItem.title} onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))} placeholder="Ej: Teaser #5" className="premium-input" />
          </div>
          <div>
            <label className="text-[10px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium block mb-1.5">Descripción</label>
            <textarea value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} placeholder="Detalles..." className="premium-input" rows={2} style={{ resize: "none" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium block mb-1.5">Plataforma</label>
              <select value={newItem.platform} onChange={(e) => setNewItem((p) => ({ ...p, platform: e.target.value }))} className="premium-input w-full">
                <option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="ambas">Ambas</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium block mb-1.5">Tipo</label>
              <select value={newItem.contentType} onChange={(e) => setNewItem((p) => ({ ...p, contentType: e.target.value }))} className="premium-input w-full">
                {Object.entries(contentTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium block mb-1.5">Fecha *</label>
            <input type="date" value={newItem.scheduledDate} onChange={(e) => setNewItem((p) => ({ ...p, scheduledDate: e.target.value }))} className="premium-input" />
          </div>
          <button onClick={handleAdd} className="btn-primary w-full h-11 text-[14px]">Crear Pieza de Contenido</button>
        </div>
      )}

      <div className="glass p-3.5">
        <div className="flex justify-between items-center mb-2.5">
          <p className="text-[11px] font-medium text-[#6e6e73]">Progreso de contenido</p>
          <span className="text-[12px] font-semibold text-white tabular-nums">{publishedCount}/{content.length}</span>
        </div>
        <div className="h-[4px] glass-progress overflow-hidden">
          <div className="h-full glass-progress-fill transition-all duration-700" style={{ width: `${content.length > 0 ? (publishedCount / content.length) * 100 : 0}%` }} />
        </div>
      </div>

      {Object.entries(grouped).map(([week, items]) => (
        <div key={week}>
          <p className="text-[10px] font-semibold text-[#48484a] uppercase tracking-[0.1em] mb-3 px-0.5">{week} — {items.length} piezas</p>
          <div className="space-y-2.5">
            {items.map((item) => {
              const sc = statusConfig[item.status] || statusConfig.pendiente;
              const StatusIcon = sc.icon;
              const advice = strategyAdvice[item.contentType];
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className="glass overflow-hidden transition-all duration-200">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <button onClick={() => { const i = statusSteps.indexOf(item.status as typeof statusSteps[number]); handleStatusChange(item.id, statusSteps[(i + 1) % statusSteps.length]); }} className="mt-[2px] shrink-0 tap-feedback">
                        <StatusIcon className={`h-[20px] w-[20px] transition-colors duration-200 ${sc.color}`} strokeWidth={item.status === "publicado" ? 2 : 1.5} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-medium tracking-[-0.01em] leading-snug ${item.status === "publicado" ? "text-[#48484a] line-through" : "text-white"}`}>{item.title}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[10px] font-medium px-2.5 py-[3px] rounded-full bg-white/[0.03] text-[#6e6e73] border border-white/[0.05]">
                            {item.platform === "ambas" ? "TT + IG" : item.platform === "tiktok" ? "TikTok" : "IG"}
                          </span>
                          <span className="text-[10px] font-medium px-2.5 py-[3px] rounded-full bg-[#D6001C]/[0.06] text-[#ff6b7a] border border-[#D6001C]/[0.08]">
                            {contentTypeLabel[item.contentType]}
                          </span>
                          {item.scheduledDate && (
                            <span className="text-[11px] text-[#48484a] flex items-center gap-1"><Clock className="h-[11px] w-[11px]" strokeWidth={1.5} />{item.scheduledDate.slice(5)}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setExpandedId(isExpanded ? null : item.id)} className="p-1.5 rounded-full hover:bg-white/[0.04] transition-colors text-[#48484a] hover:text-white shrink-0">
                        {isExpanded ? <ChevronUp className="h-[16px] w-[16px]" strokeWidth={1.5} /> : <ChevronDown className="h-[16px] w-[16px]" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>
                  <div className={`expand-content ${isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-4 pb-4 border-t divider-red pt-3">
                      {advice && (
                        <div className="space-y-3 mt-1">
                          <div className="p-3.5 rounded-[14px] bg-[#D6001C]/[0.03] border border-[#D6001C]/[0.06]">
                            <div className="flex items-center gap-1.5 mb-2"><Target className="h-[12px] w-[12px] text-[#ff6b7a]" strokeWidth={1.5} /><p className="text-[10px] font-semibold text-[#ff6b7a] uppercase tracking-[0.1em]">Objetivo</p></div>
                            <p className="text-[13px] text-[#8e8e93] leading-relaxed">{advice.objective}</p>
                          </div>
                          <div className="p-3.5 rounded-[14px] bg-amber-500/[0.02] border border-amber-500/[0.05]">
                            <div className="flex items-center gap-1.5 mb-2"><Lightbulb className="h-[12px] w-[12px] text-amber-400" strokeWidth={1.5} /><p className="text-[10px] font-semibold text-amber-400 uppercase tracking-[0.1em]">Consejos</p></div>
                            <ul className="space-y-2">{advice.tips.map((tip, i) => (<li key={i} className="text-[12px] text-[#8e8e93] leading-relaxed flex gap-2.5"><span className="text-[#D6001C] mt-[4px] shrink-0 text-[6px]">●</span><span>{tip}</span></li>))}</ul>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="p-3 rounded-[12px] bg-white/[0.015] border border-white/[0.04]"><p className="text-[9px] text-[#48484a] uppercase tracking-[0.1em] font-medium mb-1">Mejor horario</p><p className="text-[12px] text-[#8e8e93]">{advice.bestTime}</p></div>
                            <div className="p-3 rounded-[12px] bg-white/[0.015] border border-white/[0.04]"><p className="text-[9px] text-[#48484a] uppercase tracking-[0.1em] font-medium mb-1">Hashtags</p><p className="text-[10px] text-[#6e6e73] leading-snug">{advice.hashtagStrategy}</p></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {content.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-10 w-10 text-[#1c1c1e] mx-auto mb-3" strokeWidth={1} />
          <p className="text-[14px] text-[#48484a]">Sin contenido programado</p>
          <p className="text-[12px] text-[#3a3a3c] mt-1">Agrega tu primera pieza de contenido</p>
        </div>
      )}
    </div>
  );
}