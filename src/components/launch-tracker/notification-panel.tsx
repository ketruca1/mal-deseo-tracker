"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Bell, Info, BellRing } from "lucide-react";
import type { AppNotification } from "@/hooks/use-notifications";

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "Ahora";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  return `Hace ${Math.floor(diff / 86400)}d`;
}

const typeAccent: Record<string, string> = {
  countdown: "border-l-[#D6001C]/40",
  content: "border-l-amber-500/40",
  streak: "border-l-orange-500/40",
  kpi: "border-l-emerald-500/40",
  motivational: "border-l-blue-400/40",
  commitment: "border-l-red-400/40",
};

export default function NotificationPanel({
  notifications,
  unreadCount,
  isOpen,
  onClose,
  onMarkAllRead,
  onMarkRead,
  onDismiss,
  panelRef,
}: {
  notifications: AppNotification[];
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[52px] right-3 left-3 z-50 max-w-md mx-auto"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(18, 18, 18, 0.95)",
                backdropFilter: "blur(80px) saturate(180%)",
                WebkitBackdropFilter: "blur(80px) saturate(180%)",
                border: "0.5px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.03) inset",
                maxHeight: "70vh",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-white tracking-[-0.01em]">Notificaciones</span>
                  {unreadCount > 0 && (
                    <span
                      className="text-[10px] font-bold text-white px-1.5 py-[1px] rounded-full"
                      style={{ background: "#D6001C" }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 ? (
                  <button
                    onClick={onMarkAllRead}
                    className="flex items-center gap-1 text-[11px] text-[#D6001C] font-medium tap-feedback"
                  >
                    <Check className="h-[12px] w-[12px]" strokeWidth={2} />
                    Leer todo
                  </button>
                ) : (
                  <button onClick={onClose} className="p-1 rounded-full hover:bg-white/[0.04] text-[#48484a]">
                    <X className="h-[16px] w-[16px]" strokeWidth={1.5} />
                  </button>
                )}
              </div>

              {/* List */}
              <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 48px)" }}>
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-2xl mb-2">🔔</p>
                    <p className="text-[13px] text-[#48484a]">Sin notificaciones</p>
                    <p className="text-[11px] text-[#3a3a3c] mt-1">Las alertas aparecerán aquí automáticamente</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.03]">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => onMarkRead(notif.id)}
                        className={`px-4 py-3 transition-colors duration-150 cursor-pointer border-l-2 ${
                          typeAccent[notif.type] || "border-l-transparent"
                        } ${notif.read ? "opacity-50" : ""}`}
                        style={{ background: notif.read ? "transparent" : "rgba(255,255,255,0.02)" }}
                      >
                        <div className="flex gap-3">
                          <span className="text-[16px] mt-[2px] shrink-0">{notif.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[12px] font-semibold leading-snug ${
                              notif.read ? "text-[#6e6e73]" : "text-white"
                            }`}>
                              {notif.title}
                            </p>
                            <p className={`text-[11px] leading-relaxed mt-0.5 ${
                              notif.read ? "text-[#3a3a3c]" : "text-[#8e8e93]"
                            }`}>
                              {notif.body}
                            </p>
                            <p className="text-[9px] text-[#48484a] mt-1">{timeAgo(notif.timestamp)}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismiss(notif.id);
                            }}
                            className="p-1.5 rounded-full text-[#3a3a3c] hover:text-[#6e6e73] hover:bg-white/[0.04] transition-colors shrink-0 self-start"
                          >
                            <X className="h-[12px] w-[12px]" strokeWidth={1.5} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info footer — no broken push button */}
              <div className="px-4 py-2.5 border-t border-white/[0.04]">
                <div className="flex items-start gap-2">
                  <Info className="h-[12px] w-[12px] text-[#48484a] mt-0.5 shrink-0" strokeWidth={1.5} />
                  <p className="text-[10px] text-[#48484a] leading-relaxed">
                    Las notificaciones aparecen dentro de la app. Añade Mal Deseo a tu pantalla de inicio para ver el badge con el conteo de no leídas.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}