"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, Circle, Clock, PlayCircle, Plus, Film, Tv, Music, Camera,
  ChevronDown, ChevronUp, Lightbulb, Target, X,
} from "lucide-react";
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
  cancelado: { label: "Cancelado", icon: Circle, color: "text-[#48484a]" },
};

const contentTypeIcon: Record<string, React.ElementType> = {
  teaser: Film, snippet: Music, lyric_video: Music, behind_scenes: Camera, story: Tv, reel: Film,
};
const contentTypeLabel: Record<string, string> = {
  teaser: "Teaser", snippet: "Snippet", lyric_video: "Lyric Video", behind_scenes: "BTS", story: "Story", reel: "Reel",
};

const strategyAdvice: Record<string, { objective: string; tips: string[]; bestTime: string; hashtagStrategy: string }> = {
  teaser: {
    objective: "Generar curiosidad y anticipacion sin revelar la cancion completa. Crea un gancho emocional que obligue al espectador a querer escuchar mas.",
    tips: [
      "Usa los primeros 3-5 segundos del coro o el hook mas pegadizo",
      "Publica en horarios de alta actividad (7-9pm) para maximizar alcance organico",
      "NO muestres la cara del artista aun — genera misterio y especulacion",
      "Usa texto tipo '¿Listo para esto?' para crear engagement inmediato",
    ],
    bestTime: "Mar a Jue, 7:00-9:00 PM",
    hashtagStrategy: "#bachata2025 #nuevamusica #maldeseo #kevincano #trending #fyp",
  },
  snippet: {
    objective: "Mostrar un fragmento adictivo de 10-15 segundos que se quede en la cabeza del oyente y funcione como earworm.",
    tips: [
      "Elige el momento mas memorable musicalmente — un run vocal o un drop",
      "Usa la tecnica 'split screen' mostrando la reaccion de alguien al escucharlo",
      "Acompana con CTA claro: 'Guarda este sonido' o '¿Quieres mas? Siguerme'",
      "Considera crear un sonido original de TikTok para que otros lo usen",
    ],
    bestTime: "Vie y Sab (fin de semana = mas descubrimiento)",
    hashtagStrategy: "#soundoriginal #snippet #maldeseo #kevincano #nuevasonido",
  },
  lyric_video: {
    objective: "Conectar emocionalmente con la letra. Las letras bien hechas en video generan shares y saves significativamente mas.",
    tips: [
      "Sincroniza las letras con momentos visuales potentes",
      "Usa tipografia cinematografica: grande, centrada, con timing preciso",
      "Incluye momentos de silencio visual dramatico en partes clave",
      "Agrega subtitulos en ingles para audiencia internacional",
    ],
    bestTime: "Dom a Mie (dias de consumo reflexivo)",
    hashtagStrategy: "#lyricvideo #letras #maldeseo #bachatalyrics #kevincano",
  },
  behind_scenes: {
    objective: "Humanizar al artista. El contenido BTS genera 3x mas engagement que contenido producido por autenticidad.",
    tips: [
      "Muestra MOMENTOS REALES: ensayos, errores, risas, discusiones creativas",
      "Habla directamente a camara como si fuera un vlog corto",
      "Incluye clips del proceso de grabacion, mezcla o masterizacion",
      "La vulnerabilidad genera lealtad — muestra el proceso real",
    ],
    bestTime: "Lun y Mie (contenido personal funciona bien entre semana)",
    hashtagStrategy: "#bts #detrascenarios #maldeseo #kevincano #enestudio",
  },
  story: {
    objective: "Mantener presencia diaria sin saturar. Stories son ideales para micro-contenido y updates que mantienen engagement alto.",
    tips: [
      "Usa stickers interactivos: encuestas '¿Que prefieres?', sliders",
      "Cuenta un dato interesante del dia en cada story",
      "Haz 'countdown stories' cada vez que falten menos dias",
      "Pregunta a tu audiencia para generar conversacion",
    ],
    bestTime: "12PM, 7PM y 10PM (2-3 por dia)",
    hashtagStrategy: "No uses hashtags en stories",
  },
  reel: {
    objective: "Maximizar alcance y descubrimiento. Los Reels tienen el mayor potencial viral en Instagram para contenido musical.",
    tips: [
      "Usa audio trending + tu cancion en el video",
      "Los primeros 0.5 segundos DEFINEN si alguien se detiene a ver",
      "Incluye subtitulos grandes y legibles",
      "Crea variaciones: mismo concepto en 3 versiones diferentes",
    ],
    bestTime: "Sab 8-10PM (maximo consumo de Reels)",
    hashtagStrategy: "#reels #bachata #maldeseo #kevincano #viral #trending",
  },
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
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ title: "", description: "", platform: "ambas", contentType: "reel", scheduledDate: "", notes: "" });

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((d) => { setContent(d); setLoading(false); }).catch(() => setLoading(false));
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
        setNewItem({ title: "", description: "", platform: "ambas", contentType: "reel", scheduledDate: "", notes: "" });
        setShowForm(false); toast.success("Contenido agregado");
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-[0.06em]">
          Calendario de Contenido
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="h-8 px-3 rounded-[10px] text-[13px] font-medium text-white tap-feedback flex items-center gap-1.5"
          style={{ background: "#D6001C" }}
        >
          {showForm ? <X className="h-[14px] w-[14px]" strokeWidth={2} /> : <Plus className="h-[14px] w-[14px]" strokeWidth={2} />}
          {showForm ? "Cancelar" : "Agregar"}
        </button>
      </div>

      {/* Inline form (replaces Dialog) */}
      {showForm && (
        <div className="glass p-4 space-y-3">
          <div>
            <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium">Titulo *</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
              placeholder="Ej: Teaser #5"
              className="mt-1.5 h-10 w-full text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] px-3 outline-none focus:border-white/20"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium">Descripcion</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
              placeholder="Detalles..."
              className="mt-1.5 w-full text-[14px] min-h-[56px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] p-3 outline-none focus:border-white/20 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium">Plataforma</label>
              <select
                value={newItem.platform}
                onChange={(e) => setNewItem((p) => ({ ...p, platform: e.target.value }))}
                className="mt-1.5 h-10 w-full text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] px-3 outline-none"
              >
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="ambas">Ambas</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium">Tipo</label>
              <select
                value={newItem.contentType}
                onChange={(e) => setNewItem((p) => ({ ...p, contentType: e.target.value }))}
                className="mt-1.5 h-10 w-full text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] px-3 outline-none"
              >
                {Object.entries(contentTypeLabel).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium">Fecha *</label>
            <input
              type="date"
              value={newItem.scheduledDate}
              onChange={(e) => setNewItem((p) => ({ ...p, scheduledDate: e.target.value }))}
              className="mt-1.5 h-10 w-full text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] px-3 outline-none focus:border-white/20"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full h-10 text-[14px] font-semibold rounded-[12px] text-white tap-feedback"
            style={{ background: "#D6001C" }}
          >
            Crear Pieza de Contenido
          </button>
        </div>
      )}

      {/* Progress */}
      <div className="glass p-3">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[11px] font-medium">Progreso</p>
          <span className="text-[11px] font-semibold text-white tabular-nums">{publishedCount}/{content.length}</span>
        </div>
        <div className="h-[3px] glass-progress overflow-hidden">
          <div
            className="h-full glass-progress-fill transition-all duration-500"
            style={{ width: `${content.length > 0 ? (publishedCount / content.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Content items by week */}
      {Object.entries(grouped).map(([week, items]) => (
        <div key={week}>
          <p className="text-[11px] font-semibold text-[#48484a] uppercase tracking-[0.08em] mb-3 px-0.5">
            {week} — {items.length} piezas
          </p>
          <div className="space-y-2">
            {items.map((item) => {
              const sc = statusConfig[item.status] || statusConfig.pendiente;
              const StatusIcon = sc.icon;
              const TypeIcon = contentTypeIcon[item.contentType] || Film;
              const advice = strategyAdvice[item.contentType];
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} className="glass overflow-hidden transition-all duration-200">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          const currentIdx = statusSteps.indexOf(item.status as typeof statusSteps[number]);
                          const next = statusSteps[(currentIdx + 1) % statusSteps.length];
                          handleStatusChange(item.id, next);
                        }}
                        className="mt-[2px] shrink-0 tap-feedback"
                      >
                        <StatusIcon className={`h-[20px] w-[20px] transition-colors duration-200 ${sc.color}`} strokeWidth={item.status === "publicado" ? 2 : 1.5} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-medium tracking-[-0.01em] ${
                          item.status === "publicado" ? "text-[#48484a] line-through" : "text-white"
                        }`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-medium px-2 py-[2px] rounded-full bg-white/[0.04] text-[#6e6e73] border border-white/[0.04]">
                            {item.platform === "ambas" ? "TT + IG" : item.platform === "tiktok" ? "TikTok" : "IG"}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-[2px] rounded-full bg-white/[0.04] text-[#6e6e73] border border-white/[0.04]">
                            {contentTypeLabel[item.contentType]}
                          </span>
                          {item.scheduledDate && (
                            <span className="text-[11px] text-[#48484a] flex items-center gap-1">
                              <Clock className="h-[11px] w-[11px]" strokeWidth={1.5} />
                              {item.scheduledDate.slice(5)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-full hover:bg-white/[0.04] transition-colors text-[#48484a] hover:text-white shrink-0"
                      >
                        {isExpanded
                          ? <ChevronUp className="h-[16px] w-[16px]" strokeWidth={1.5} />
                          : <ChevronDown className="h-[16px] w-[16px]" strokeWidth={1.5} />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Strategy advice */}
                  <div className={`expand-content ${isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
                      {advice && (
                        <div className="space-y-3 mt-1">
                          <div className="p-3 rounded-[12px] bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Target className="h-[12px] w-[12px] text-[#D6001C]" strokeWidth={1.5} />
                              <p className="text-[10px] font-semibold text-[#ff6b7a] uppercase tracking-[0.08em]">Objetivo</p>
                            </div>
                            <p className="text-[13px] text-[#a1a1a6] leading-relaxed">{advice.objective}</p>
                          </div>
                          <div className="p-3 rounded-[12px] bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Lightbulb className="h-[12px] w-[12px] text-amber-500" strokeWidth={1.5} />
                              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-[0.08em]">Consejos</p>
                            </div>
                            <ul className="space-y-1.5">
                              {advice.tips.map((tip, i) => (
                                <li key={i} className="text-[12px] text-[#8e8e93] leading-relaxed flex gap-2">
                                  <span className="text-[#D6001C] mt-[3px] shrink-0 text-[8px]">&#9679;</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-[10px] bg-white/[0.02] border border-white/[0.04]">
                              <p className="text-[9px] text-[#48484a] uppercase tracking-[0.08em] font-medium mb-0.5">Mejor horario</p>
                              <p className="text-[12px] text-[#a1a1a6]">{advice.bestTime}</p>
                            </div>
                            <div className="p-2.5 rounded-[10px] bg-white/[0.02] border border-white/[0.04]">
                              <p className="text-[9px] text-[#48484a] uppercase tracking-[0.08em] font-medium mb-0.5">Hashtags</p>
                              <p className="text-[10px] text-[#6e6e73] leading-snug">{advice.hashtagStrategy}</p>
                            </div>
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
    </div>
  );
}