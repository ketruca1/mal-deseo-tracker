"use client";

import { useState } from "react";
import { CheckCircle2, CalendarDays, Flag, Rocket, PartyPopper } from "lucide-react";
import { toast } from "sonner";

interface LaunchEvent { id: string; title: string; description: string | null; eventType: string; eventDate: string | null; completed: boolean; }

const eventTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  prelanzamiento: { label: "Pre-lanzamiento", icon: Flag, color: "text-[#ff6b7a]", bg: "bg-[#D6001C]/[0.08]" },
  lanzamiento: { label: "Lanzamiento", icon: Rocket, color: "text-emerald-400", bg: "bg-emerald-500/[0.08]" },
  postlanzamiento: { label: "Post-lanzamiento", icon: PartyPopper, color: "text-amber-400", bg: "bg-amber-500/[0.08]" },
};

export default function TimelineView({ data }: { data: LaunchEvent[] }) {
  const [events, setEvents] = useState<LaunchEvent[]>(data);
  const completedCount = events.filter((e) => e.completed).length;

  const toggleComplete = async (id: string, completed: boolean) => {
    try { const r = await fetch("/api/events", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, completed: !completed }) }); if (r.ok) setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, completed: !completed } : e))); } catch { toast.error("Error"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-[0.08em]">Timeline del Lanzamiento</p>
        <span className="text-[12px] text-[#6e6e73] font-medium tabular-nums">{completedCount}/{events.length}</span>
      </div>
      <div className="relative">
        {events.map((event, idx) => {
          const config = eventTypeConfig[event.eventType] || eventTypeConfig.prelanzamiento;
          const EventIcon = config.icon; const isLast = idx === events.length - 1;
          return (
            <div key={event.id} className="flex gap-4 relative">
              {!isLast && <div className="absolute left-[15px] top-10 bottom-0 w-px bg-[#D6001C]/[0.06]" />}
              <button onClick={() => toggleComplete(event.id, event.completed)} className="relative z-10 mt-[3px] shrink-0 tap-feedback">
                {event.completed ? (
                  <div className="w-[31px] h-[31px] rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(214,0,28,0.15) 0%, rgba(255,59,79,0.06) 100%)", border: "0.5px solid rgba(214,0,28,0.2)" }}>
                    <CheckCircle2 className="h-[15px] w-[15px] text-[#D6001C]" strokeWidth={1.5} />
                  </div>
                ) : (
                  <div className="w-[31px] h-[31px] rounded-full glass flex items-center justify-center"><EventIcon className={`h-[14px] w-[14px] ${config.color}`} strokeWidth={1.5} /></div>
                )}
              </button>
              <div className="glass p-4 flex-1 mb-3.5">
                <p className={`text-[14px] font-medium tracking-[-0.01em] leading-snug ${event.completed ? "text-[#48484a]" : "text-white"}`}>{event.title}</p>
                {event.description && <p className="text-[12px] text-[#6e6e73] mt-1.5 leading-relaxed">{event.description}</p>}
                <div className="flex items-center gap-2.5 mt-3">
                  <span className={`text-[10px] font-medium px-2.5 py-[3px] rounded-full ${event.completed ? "bg-white/[0.02] text-[#48484a] border border-white/[0.03]" : `${config.bg} ${config.color} border border-current/10`}`}>{config.label}</span>
                  {event.eventDate && <span className="text-[11px] text-[#48484a] flex items-center gap-1.5"><CalendarDays className="h-[11px] w-[11px]" strokeWidth={1.5} />{event.eventDate}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}