"use client";

import { useState } from "react";
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

const contentTypeLabel: Record<string, string> = {
  teaser: "Teaser", snippet: "Snippet", lyric_video: "Lyric Video", behind_scenes: "BTS", story: "Story", reel: "Reel",
};

const contentTypeAccent: Record<string, string> = {
  teaser: "bg-amber-500",
  snippet: "bg-cyan-400",
  lyric_video: "bg-violet-400",
  behind_scenes: "bg-emerald-400",
  story: "bg-pink-400",
  reel: "bg-[#D6001C]",
};

const contentTypeBadgeBg: Record<string, string> = {
  teaser: "bg-amber-500/[0.08] text-amber-400 border-amber-500/[0.12]",
  snippet: "bg-cyan-400/[0.08] text-cyan-400 border-cyan-400/[0.12]",
  lyric_video: "bg-violet-400/[0.08] text-violet-400 border-violet-400/[0.12]",
  behind_scenes: "bg-emerald-400/[0.08] text-emerald-400 border-emerald-400/[0.12]",
  story: "bg-pink-400/[0.08] text-pink-400 border-pink-400/[0.12]",
  reel: "bg-[#D6001C]/[0.08] text-[#ff6b7a] border-[#D6001C]/[0.12]",
};

const strategyAdvice: Record<string, { objective: string; tips: string[]; bestTime: string; hashtagStrategy: string }> = {
  teaser: {
    objective: "Generar curiosidad y anticipacion sin revelar la cancion completa. Crea un gancho emocional que obligue al espectador a querer escuchar mas.",
    tips: [
      "Usa los primeros 3-5 segundos del coro o el hook mas pegadizo",
      "Publica en horarios de alta actividad (7-9pm) para maximizar alcance organico",
      "NO muestres la cara del artista aun, genera misterio y especulacion",
      "Usa texto tipo Listo para esto? para crear engagement inmediato",
    ],
    bestTime: "Mar a Jue, 7:00-9:00 PM",
    hashtagStrategy: "#bachata2025 #nuevamusic #maldeseo #kevincano #trending #fyp",
  },
  snippet: {
    objective: "Mostrar un fragmento adictivo de 10-15 segundos que se quede en la cabeza del oyente y funcione como earworm.",
    tips: [
      "Elige el momento mas memorable musicalmente, un run vocal o un drop",
      "Usa la tecnica split screen mostrando la reaccion de alguien al escucharlo",
      "Acompana con CTA claro: Guarda este sonido o Quieres mas? Siguerme",
      "Considera crear un sonido original de TikTok para que otros lo usen",
    ],
    bestTime: "Vie y Sab (fin de semana = mas descubrimiento)",
    hashtagStrategy: "#soundoriginal #snippet #maldeseo #kevincano #nuevsonido",
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
      "La vulnerabilidad genera lealtad, muestra el proceso real",
    ],
    bestTime: "Lun y Mie (contenido personal funciona bien entre semana)",
    hashtagStrategy: "#bts #detrascenarios #maldeseo #kevincano #enestudio",
  },
  story: {
    objective: "Mantener presencia diaria sin saturar. Stories son ideales para micro-contenido y updates que mantienen engagement alto.",
    tips: [
      "Usa stickers interactivos: encuestas Que prefieres?, sliders",
      "Cuenta un dato interesante del dia en cada story",
      "Haz countdown stories cada vez que falten menos dias",
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

export default function ContentCalendar({ content: initialContent, onRefresh }: { content: ContentPiece[]; onRefresh?: () => void }) {
  const [content, setContent] = useState<ContentPiece[]>(initialContent || []);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ title: "", description: "", platform: "ambas", contentType: "reel", scheduledDate: "", notes: "" });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const r = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: newStatus }) });
      if (r.ok) {
        setContent((p) => p.map((c) => c.id === id ? { ...c, status: newStatus } : c));
        toast.success("Estado actualizado");
        if (onRefresh) onRefresh();
      }
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
        setShowAdd(false);
        toast.success("Contenido agregado");
        if (onRefresh) onRefresh();
      }
    } catch { toast.error("Error al agregar"); }
  };

  const publishedCount = content.filter((c) => c.status === "publicado").length;
  const progressPct = content.length > 0 ? Math.round((publishedCount / content.length) * 100) : 0;
  const grouped: Record<string, ContentPiece[]> = {};
  content.filter((c) => c.scheduledDate).forEach((c) => {
    const w = getWeekLabel(c.scheduledDate!);
    if (!grouped[w]) grouped[w] = [];
    grouped[w].push(c);
  });

  const formFocusClass = "focus:bg-white/[0.06] focus:border-[#D6001C]/40 focus:shadow-[0_0_0_2px_rgba(214,0,28,0.12)]";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-[0.08em]">
          Calendario de Contenido
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="h-8 px-3.5 rounded-[10px] text-[13px] font-semibold text-white tap-feedback flex items-center gap-1.5 transition-shadow duration-200 hover:shadow-[0_0_16px_rgba(214,0,28,0.35)]"
          style={{ background: "#D6001C" }}
        >
          {showAdd ? <X className="h-[14px] w-[14px]" strokeWidth={2.5} /> : <Plus className="h-[14px] w-[14px]" strokeWidth={2.5} />}
          {showAdd ? "Cancelar" : "Agregar"}
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="glass-elevated p-5 space-y-4 rounded-2xl ambient-glow-top">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold text-white tracking-[-0.01em]">Nueva Pieza de Contenido</p>
            <button
              onClick={() => setShowAdd(false)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-[#6e6e73] hover:text-white hover:bg-white/[0.06] transition-all duration-150"
            >
              <X className="h-[16px] w-[16px]" strokeWidth={1.5} />
            </button>
          </div>
          <div>
            <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium block mb-1.5">Titulo *</label>
            <input value={newItem.title} onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))} placeholder="Ej: Teaser #5"
              className={"w-full h-10 px-3.5 text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] outline-none placeholder:text-[#48484a] transition-all duration-200 " + formFocusClass} />
          </div>
          <div>
            <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium block mb-1.5">Descripcion</label>
            <textarea value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} placeholder="Detalles..."
              className={"w-full text-[14px] min-h-[56px] p-3.5 bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] outline-none placeholder:text-[#48484a] resize-none transition-all duration-200 " + formFocusClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium block mb-1.5">Plataforma</label>
              <select value={newItem.platform} onChange={(e) => setNewItem((p) => ({ ...p, platform: e.target.value }))}
                className={"w-full h-10 px-3.5 text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] outline-none transition-all duration-200 appearance-none " + formFocusClass}>
                <option value="tiktok" style={{background:'#1c1c1e', color:'#fff'}}>TikTok</option>
                <option value="instagram" style={{background:'#1c1c1e', color:'#fff'}}>Instagram</option>
                <option value="ambas" style={{background:'#1c1c1e', color:'#fff'}}>Ambas</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium block mb-1.5">Tipo</label>
              <select value={newItem.contentType} onChange={(e) => setNewItem((p) => ({ ...p, contentType: e.target.value }))}
                className={"w-full h-10 px-3.5 text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] outline-none transition-all duration-200 appearance-none " + formFocusClass}>
                {Object.entries(contentTypeLabel).map(([k, v]) => <option key={k} value={k} style={{background:'#1c1c1e', color:'#fff'}}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium block mb-1.5">Fecha *</label>
            <input type="date" value={newItem.scheduledDate} onChange={(e) => setNewItem((p) => ({ ...p, scheduledDate: e.target.value }))}
              className={"w-full h-10 px-3.5 text-[14px] bg-white/[0.04] border border-white/[0.06] text-white rounded-[12px] outline-none transition-all duration-200 " + formFocusClass} />
          </div>
          <button
            onClick={handleAdd}
            className="w-full h-11 text-[14px] font-semibold rounded-[12px] text-white tap-feedback transition-shadow duration-200 hover:shadow-[0_0_24px_rgba(214,0,28,0.4)] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #D6001C 0%, #a00015 100%)" }}
          >
            Crear Pieza de Contenido
          </button>
        </div>
      )}

      {/* Progress */}
      <div className="glass p-4 rounded-2xl">
        <div className="flex justify-between items-center mb-2.5">
          <p className="text-[12px] font-medium text-[#a1a1a6]">Progreso</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[18px] font-semibold text-white tabular-nums tracking-tight">{progressPct}%</span>
            <span className="text-[11px] text-[#6e6e73] tabular-nums">{publishedCount}/{content.length}</span>
          </div>
        </div>
        <div className="h-[4px] glass-progress overflow-hidden rounded-full">
          <div
            className="h-full glass-progress-fill rounded-full transition-all duration-700 ease-out"
            style={{
              width: progressPct + "%",
              boxShadow: progressPct > 0 ? "0 0 8px rgba(214,0,28,0.5)" : "none",
            }}
          />
        </div>
      </div>

      {/* Content items by week */}
      {Object.entries(grouped).map(([week, items]) => (
        <div key={week}>
          {/* Week header with gradient underline */}
          <div className="relative mb-3.5 px-0.5">
            <p className="text-[11px] font-semibold text-[#a1a1a6] uppercase tracking-[0.1em]">
              {week}
              <span className="text-[#6e6e73] font-medium ml-1.5">{items.length} {items.length === 1 ? "pieza" : "piezas"}</span>
            </p>
            <div className="absolute bottom-[-6px] left-0 right-0 h-px bg-gradient-to-r from-[#D6001C]/30 via-[#D6001C]/10 to-transparent" />
          </div>
          <div className="space-y-2.5">
            {items.map((item) => {
              const sc = statusConfig[item.status] || statusConfig.pendiente;
              const StatusIcon = sc.icon;
              const advice = strategyAdvice[item.contentType];
              const isExpanded = expandedId === item.id;
              const isPublicado = item.status === "publicado";
              const accentBar = contentTypeAccent[item.contentType] || "bg-[#D6001C]";
              const badgeClass = contentTypeBadgeBg[item.contentType] || "bg-white/[0.04] text-[#6e6e73] border-white/[0.04]";

              return (
                <div key={item.id} className="glass overflow-hidden transition-all duration-200 hover-lift rounded-2xl">
                  <div className="flex">
                    {/* Left accent bar */}
                    <div className={"w-[3px] shrink-0 " + accentBar} />

                    <div className="flex-1 p-4">
                      <div className="flex items-start gap-3">
                        <button onClick={() => {
                            const idx = statusSteps.indexOf(item.status as typeof statusSteps[number]);
                            const next = statusSteps[(idx + 1) % statusSteps.length];
                            handleStatusChange(item.id, next);
                          }}
                          className={
                            "mt-[2px] shrink-0 tap-feedback transition-all duration-200 " +
                            (isPublicado
                              ? "drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                              : "hover:opacity-80")
                          }
                        >
                          <StatusIcon
                            className={
                              "transition-colors duration-200 " +
                              (isPublicado
                                ? "h-[22px] w-[22px] text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                : "h-[20px] w-[20px] " + sc.color)
                            }
                            strokeWidth={isPublicado ? 2 : 1.5}
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={
                            "text-[14px] font-medium tracking-[-0.02em] leading-snug " +
                            (isPublicado ? "text-[#48484a] line-through decoration-[#48484a]/40" : "text-white")
                          }>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* Platform badge */}
                            <span className="text-[10px] font-medium px-2 py-[3px] rounded-full bg-white/[0.05] text-[#a1a1a6] border border-white/[0.06] tracking-wide">
                              {item.platform === "ambas" ? "TT + IG" : item.platform === "tiktok" ? "TikTok" : "IG"}
                            </span>
                            {/* Content type badge with color tint */}
                            <span className={"text-[10px] font-medium px-2 py-[3px] rounded-full border tracking-wide " + badgeClass}>
                              {contentTypeLabel[item.contentType] || item.contentType}
                            </span>
                            {/* Date pill */}
                            {item.scheduledDate && (
                              <span className="text-[11px] text-[#8e8e93] flex items-center gap-1.5 px-2 py-[2px] rounded-full bg-white/[0.04]">
                                <Clock className="h-[10px] w-[10px]" strokeWidth={1.5} />
                                <span className="tabular-nums">{item.scheduledDate.slice(5)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-2 rounded-full hover:bg-white/[0.06] transition-all duration-150 text-[#48484a] hover:text-white shrink-0 mt-[-2px]"
                        >
                          {isExpanded
                            ? <ChevronUp className="h-[16px] w-[16px]" strokeWidth={1.5} />
                            : <ChevronDown className="h-[16px] w-[16px]" strokeWidth={1.5} />
                          }
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Strategy panel */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-3">
                      <div className="glass-divider mb-3" />
                      {advice ? (
                        <div className="space-y-3">
                          {/* Objective card with red left-border accent */}
                          <div className="p-3.5 rounded-[12px] bg-white/[0.02] border border-white/[0.04] border-l-[3px] border-l-[#D6001C]">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Target className="h-[12px] w-[12px] text-[#D6001C]" strokeWidth={1.5} />
                              <p className="text-[10px] font-semibold text-[#ff6b7a] uppercase tracking-[0.1em]">Objetivo</p>
                            </div>
                            <p className="text-[13px] text-[#a1a1a6] leading-relaxed">{advice.objective}</p>
                          </div>

                          {/* Tips card */}
                          <div className="p-3.5 rounded-[12px] bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <Lightbulb className="h-[12px] w-[12px] text-amber-500" strokeWidth={1.5} />
                              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-[0.1em]">Consejos</p>
                            </div>
                            <ul className="space-y-2">
                              {advice.tips.map((tip, i) => (
                                <li key={i} className="text-[12px] text-[#8e8e93] leading-relaxed flex gap-2.5">
                                  <span className="mt-[5px] shrink-0 h-[5px] w-[5px] rounded-full bg-[#D6001C]/70" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Best time & Hashtags */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="p-3 rounded-[12px] bg-white/[0.02] border border-white/[0.04]">
                              <p className="text-[9px] text-[#48484a] uppercase tracking-[0.1em] font-medium mb-1">Mejor horario</p>
                              <p className="text-[12px] text-[#a1a1a6] leading-snug">{advice.bestTime}</p>
                            </div>
                            <div className="p-3 rounded-[12px] bg-white/[0.02] border border-white/[0.04]">
                              <p className="text-[9px] text-[#48484a] uppercase tracking-[0.1em] font-medium mb-1">Hashtags</p>
                              <p className="text-[10px] text-[#6e6e73] leading-snug">{advice.hashtagStrategy}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#48484a] italic">Sin notas adicionales</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {content.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
            <Plus className="h-[18px] w-[18px] text-[#48484a]" strokeWidth={1.5} />
          </div>
          <p className="text-[14px] font-medium text-[#6e6e73]">No hay contenido programado</p>
          <p className="text-[12px] text-[#48484a]">Agrega tu primera pieza para comenzar el seguimiento</p>
        </div>
      )}
    </div>
  );
}