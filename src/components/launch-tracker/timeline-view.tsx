"use client";

import { useState } from "react";
import { CheckCircle2, CalendarDays, Flag, Rocket, PartyPopper } from "lucide-react";
import { toast } from "sonner";

interface LaunchEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  eventDate: string | null;
  completed: boolean;
}

const eventTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string; accent: string; bgTint: string }> = {
  prelanzamiento: {
    label: "Pre-lanzamiento",
    icon: Flag,
    color: "text-[#D6001C]",
    accent: "#D6001C",
    bgTint: "rgba(214, 0, 28, 0.08)",
  },
  lanzamiento: {
    label: "Lanzamiento",
    icon: Rocket,
    color: "text-emerald-400",
    accent: "#34d399",
    bgTint: "rgba(52, 211, 153, 0.08)",
  },
  postlanzamiento: {
    label: "Post-lanzamiento",
    icon: PartyPopper,
    color: "text-amber-400",
    accent: "#fbbf24",
    bgTint: "rgba(251, 191, 36, 0.08)",
  },
};

/* ── keyframe animations ── */
const timelineStyles = `
  @keyframes tl-pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.35); }
    50%      { box-shadow: 0 0 0 6px rgba(52,211,153,0);   }
  }
  @keyframes tl-ring-expand {
    0%   { transform: scale(1);   opacity: 0.5; }
    100% { transform: scale(1.8); opacity: 0;   }
  }
  .tl-dot-completed {
    animation: tl-pulse-glow 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .tl-dot-pending {
    animation: tl-ring-expand 2.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

export default function TimelineView({ data }: { data: LaunchEvent[] }) {
  const [events, setEvents] = useState<LaunchEvent[]>(data);
  const completedCount = events.filter((e) => e.completed).length;

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const r = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed }),
      });
      if (r.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, completed: !completed } : e))
        );
      }
    } catch {
      toast.error("Error al actualizar");
    }
  };

  return (
    <>
      <style>{timelineStyles}</style>

      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Refined indicator line */}
            <span
              className="block h-[3px] w-5 rounded-full"
              style={{ background: "linear-gradient(90deg, #D6001C, rgba(214,0,28,0.3))" }}
            />
            <p className="text-[13px] font-semibold text-[#a1a1a6] uppercase tracking-[0.1em]">
              Timeline del Lanzamiento
            </p>
          </div>
          <span
            className="text-[12px] font-semibold tabular-nums px-2.5 py-[3px] rounded-full"
            style={{
              background: "rgba(214, 0, 28, 0.12)",
              color: "#D6001C",
              border: "0.5px solid rgba(214, 0, 28, 0.18)",
            }}
          >
            {completedCount}/{events.length}
          </span>
        </div>

        {/* ── Events ── */}
        <div className="relative">
          {events.map((event, idx) => {
            const config = eventTypeConfig[event.eventType] || eventTypeConfig.prelanzamiento;
            const EventIcon = config.icon;
            const isLast = idx === events.length - 1;
            const isCompleted = event.completed;

            return (
              <div
                key={event.id}
                className="flex gap-4 relative"
                style={{ marginBottom: isLast ? 0 : 20 }}
              >
                {/* ── Connector line (gradient, thicker) ── */}
                {!isLast && (
                  <div
                    className="absolute top-10 bottom-0 rounded-full"
                    style={{
                      left: 15,
                      width: 2,
                      background:
                        "linear-gradient(to bottom, rgba(214,0,28,0.25), rgba(255,255,255,0.03))",
                    }}
                  />
                )}

                {/* ── Status dot ── */}
                <button
                  onClick={() => toggleComplete(event.id, event.completed)}
                  className="relative z-10 mt-[3px] shrink-0 tap-feedback"
                  aria-label={isCompleted ? "Marcar como pendiente" : "Marcar como completado"}
                >
                  {isCompleted ? (
                    /* Completed: larger green dot with pulse glow */
                    <div className="relative flex items-center justify-center">
                      <div
                        className="w-[30px] h-[30px] rounded-full flex items-center justify-center tl-dot-completed"
                        style={{
                          background: "rgba(52, 211, 153, 0.15)",
                          border: "1px solid rgba(52, 211, 153, 0.35)",
                        }}
                      >
                        <CheckCircle2
                          className="h-[15px] w-[15px] text-emerald-400"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Pending: glass circle with ring animation */
                    <div className="relative flex items-center justify-center">
                      {/* Expanding ring */}
                      <span
                        className="absolute w-[30px] h-[30px] rounded-full tl-dot-pending"
                        style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                      />
                      {/* Glass circle with event-type tint */}
                      <div
                        className="relative w-[30px] h-[30px] rounded-full glass flex items-center justify-center"
                        style={{
                          background: config.bgTint,
                          border: "0.5px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <EventIcon
                          className={`h-[14px] w-[14px] ${config.color}`}
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  )}
                </button>

                {/* ── Event card ── */}
                <div
                  className={`flex-1 relative glass rounded-2xl p-[14px] pl-[18px] transition-all duration-300 ease-out hover-lift cursor-default ${
                    isCompleted ? "opacity-50 grayscale-[40%]" : ""
                  }`}
                  style={
                    !isCompleted
                      ? {
                          borderLeft: `2px solid ${config.accent}`,
                        }
                      : {
                          borderLeft: "2px solid rgba(255,255,255,0.06)",
                        }
                  }
                >
                  {/* Title */}
                  <p
                    className={`text-[15px] font-medium leading-snug ${
                      isCompleted ? "text-[#48484a] line-through decoration-[#48484a]/40" : "text-white"
                    }`}
                    style={{ letterSpacing: "-0.012em" }}
                  >
                    {event.title}
                  </p>

                  {/* Description */}
                  {event.description && (
                    <p
                      className={`mt-1.5 leading-relaxed ${
                        isCompleted ? "text-[#48484a] text-[12px]" : "text-[#a1a1a6] text-[13px]"
                      }`}
                      style={{ lineHeight: 1.65 }}
                    >
                      {event.description}
                    </p>
                  )}

                  {/* Badges row */}
                  <div className="flex items-center gap-2 mt-3">
                    {/* Event type pill */}
                    <span
                      className="text-[10px] font-medium px-2.5 py-[3px] rounded-full"
                      style={{
                        background: isCompleted ? "rgba(255,255,255,0.04)" : config.bgTint,
                        color: isCompleted ? "#48484a" : config.accent,
                        border: `0.5px solid ${isCompleted ? "rgba(255,255,255,0.04)" : config.accent}25`,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {config.label}
                    </span>

                    {/* Date pill */}
                    {event.eventDate && (
                      <span
                        className="text-[11px] font-medium flex items-center gap-1.5 px-2.5 py-[3px] rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          color: isCompleted ? "#48484a" : "#6e6e73",
                          border: "0.5px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <CalendarDays className="h-[11px] w-[11px]" strokeWidth={1.5} />
                        {event.eventDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}