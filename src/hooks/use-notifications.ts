"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface AppNotification {
  id: string;
  type: "countdown" | "content" | "streak" | "kpi" | "motivational" | "commitment";
  title: string;
  body: string;
  icon: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY_READ = "md-notif-read";
const STORAGE_KEY_DISMISSED = "md-notif-dismissed";
const STORAGE_KEY_NOTIFS = "md-notif-list";

const countdownPhrases: string[] = [
  "Cada publicación hoy es una semilla que explota el día del lanzamiento.",
  "El mundo no sabe lo que viene. Pero tú sí. Sigue creando.",
  "Los grandes lanzamientos se construyen en silencio. Uno a uno.",
  "Tu audiencia está esperando. No los defraudes.",
  "La disciplina de hoy es el éxito de mañana.",
  "No estás creando contenido. Estás construyendo un imperio.",
  "Cada reel, cada story, cada tiktok es un ladrillo más.",
  "El lanzamiento no es un evento. Es la consecuencia de lo que haces hoy.",
  "Los artistas que más impactan son los más consistentes.",
  "Tu música merece ser escuchada. Haz que la encuentren.",
];

const motivationalPhrases: string[] = [
  "La música es el lenguaje universal del alma. — Beethoven",
  "No esperes a estar listo. Estar listo es una trampa. Empieza ya.",
  "El éxito no es final. El fracaso no es fatal. Es el coraje lo que cuenta. — Churchill",
  "Tu voz única es tu mayor ventaja competitiva. Úsala.",
  "La bachata nació del corazón del pueblo. Tu canción lleva esa herencia.",
  "No se trata de viralidad. Se trata de conectar con alguien que te necesita escuchar.",
  "Cada gran artista fue alguna vez un artista desconocido que no se rindió.",
  "La creatividad es la inteligencia divirtiéndose. — Einstein",
  "El contenido que creas hoy puede cambiar la vida de alguien mañana.",
  "La diferencia entre un sueño y una meta es una fecha de lanzamiento.",
  "No necesitas millones de seguidores. Necesitas los correctos.",
  "La música que no se comparte es como una luz bajo una canasta.",
  "Tu historia como artista es tan importante como tu música.",
  "El algoritmo premia la consistencia. Publica con intención, todos los días.",
  "El primer fan siempre es el más difícil de conseguir. Después, se multiplica.",
  "La mejor estrategia de marketing es hacer música que la gente quiera compartir.",
  "No hay atajos. Solo trabajo inteligente, consistencia y paciencia.",
  "Cada canción tiene un momento perfecto para ser lanzada. Este es el tuyo.",
  "El arte no se perfecciona, se comparte. — Picasso (adaptado)",
  "Tu música no compite con nadie. Compite con el silencio.",
];

const commitmentPhrases: string[] = [
  "Hoy sin datos es mañana sin estrategia.",
  "Registra tus métricas ahora. Tus números cuentan tu historia.",
  "Un día sin registro es un día invisible para el algoritmo.",
  "Tus métricas de hoy son la brújula de tu lanzamiento.",
  "No dejes pasar este día. Cada dato importa.",
];

const kpiPhrases: string[] = [
  "Estás más cerca de lo que crees. Un empujón más.",
  "La meta está a la vista. No frenes ahora.",
  "Este es el momento de acelerar, no de frenar.",
];

const contentPhrases: string[] = [
  "La consistencia vence al talento cuando el talento no es consistente.",
  "Tu calendario de contenido es tu mapa hacia el lanzamiento.",
  "Cada pieza publicada es un paso más cerca del objetivo.",
  "El contenido que no creas hoy, no existirá mañana.",
  "Tu audiencia necesita ver tu cara. Publica algo hoy.",
];

function getDaysUntilLaunch(): number {
  const saved = (typeof window !== "undefined") ? localStorage.getItem("md-launch-date") : null;
  const launchDate = saved || "2025-08-04";
  return Math.max(0, Math.ceil((new Date(launchDate + "T00:00:00").getTime() - Date.now()) / (86400000)));
}

function getStreak(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().slice(0, 10);
  const streak = parseInt(localStorage.getItem("md-metric-streak") || "0", 10);
  const lastDate = localStorage.getItem("md-metric-last-date") || "";
  if (lastDate === today) return streak;
  if (lastDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)) return streak;
  return 0;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Persistence helpers ---
function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_READ);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify([...ids]));
  } catch {}
}

function getDismissedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISSED);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify([...ids]));
  } catch {}
}

// --- Save/Load full notification list to persist across restarts ---
function saveNotificationsToStorage(notifs: AppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    // Only persist last 50 notifications
    const toSave = notifs.slice(0, 50);
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(toSave));
  } catch {}
}

function loadNotificationsFromStorage(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    // Validate structure
    return parsed.filter(n => n.id && n.type && n.title && n.body && n.timestamp);
  } catch {
    return [];
  }
}

// Clean old dismissed IDs to avoid unbounded growth
function pruneDismissedIds() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (!raw) return;
    const ids: string[] = JSON.parse(raw);
    if (ids.length > 200) {
      localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(ids.slice(-150)));
    }
  } catch {}
}

// Update the app badge on home screen icon
function updateAppBadge(unreadCount: number) {
  if (typeof navigator === "undefined") return;
  try {
    if ("setAppBadge" in navigator) {
      if (unreadCount > 0) {
        (navigator as unknown as { setAppBadge: (count: number) => Promise<void> }).setAppBadge(unreadCount);
      } else {
        (navigator as unknown as { clearAppBadge: () => Promise<void> }).clearAppBadge();
      }
    }
  } catch {}
}

export function useNotifications(data: {
  content?: { total: number; published: number; pending: number; inProgress: number };
  kpis?: { total: number; completed: number; items?: Array<{ id: string; name: string; target: number; current: number; unit: string }> };
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);
  // Persisted sets for read/dismissed
  const readIdsRef = useRef<Set<string>>(new Set());
  const dismissedIdsRef = useRef<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Update app badge whenever unreadCount changes
  useEffect(() => {
    updateAppBadge(unreadCount);
  }, [unreadCount]);

  // Load persisted state on mount
  useEffect(() => {
    readIdsRef.current = getReadIds();
    dismissedIdsRef.current = getDismissedIds();
    pruneDismissedIds();

    // Restore notifications from localStorage
    const saved = loadNotificationsFromStorage();
    if (saved.length > 0) {
      // Apply persisted read/dismissed state to restored notifications
      const restored = saved
        .filter(n => !dismissedIdsRef.current.has(n.id))
        .map(n => ({
          ...n,
          read: n.read || readIdsRef.current.has(n.id),
        }));
      setNotifications(restored);
    }
  }, []);

  const generateContextualNotifications = useCallback(() => {
    const newNotifs: AppNotification[] = [];
    const daysLeft = getDaysUntilLaunch();
    const streak = getStreak();
    const today = new Date().toISOString().slice(0, 10);

    // 1. Countdown milestones — use STABLE deterministic ID
    if (daysLeft > 0 && daysLeft <= 60) {
      const milestones = [30, 21, 14, 7, 3, 1];
      if (milestones.includes(daysLeft)) {
        const stableId = `countdown-${daysLeft}`;
        if (!dismissedIdsRef.current.has(stableId)) {
          // Check if we already have this notification
          newNotifs.push({
            id: stableId,
            type: "countdown",
            title: `${daysLeft} días para el lanzamiento`,
            body: pickRandom(countdownPhrases),
            icon: "🎯",
            timestamp: Date.now(),
            read: readIdsRef.current.has(stableId),
          });
        }
      }
    }

    // 2. Launch day!
    if (daysLeft === 0) {
      const stableId = "countdown-0";
      if (!dismissedIdsRef.current.has(stableId)) {
        newNotifs.push({
          id: stableId,
          type: "countdown",
          title: "¡HOY ES EL DÍA!",
          body: "Mal Deseo se lanza HOY. Todo el trabajo de estos meses se materializa ahora. ¡Confía en tu música!",
          icon: "🚀",
          timestamp: Date.now(),
          read: readIdsRef.current.has(stableId),
        });
      }
    }

    // 3. Content reminders — once per day
    if (data.content && data.content.pending > 0) {
      const stableId = `content-${today}`;
      if (!dismissedIdsRef.current.has(stableId)) {
        const urgency = data.content.pending >= 3 ? "¡Urgente! " : "";
        newNotifs.push({
          id: stableId,
          type: "content",
          title: `${urgency}${data.content.pending} piezas de contenido pendientes`,
          body: pickRandom(contentPhrases),
          icon: "📝",
          timestamp: Date.now(),
          read: readIdsRef.current.has(stableId),
        });
      }
    }

    // 4. KPI near-target alerts
    if (data.kpis?.items) {
      data.kpis.items.forEach((kpi) => {
        if (kpi.target > 0) {
          const pct = (kpi.current / kpi.target) * 100;
          if (pct >= 75 && pct < 100) {
            const stableId = `kpi-near-${kpi.id}`;
            if (!dismissedIdsRef.current.has(stableId)) {
              newNotifs.push({
                id: stableId,
                type: "kpi",
                title: `${Math.round(pct)}% — ${kpi.name}`,
                body: `${kpi.current.toLocaleString()} / ${kpi.target.toLocaleString()} ${kpi.unit}. ${pickRandom(kpiPhrases)}`,
                icon: "⚡",
                timestamp: Date.now(),
                read: readIdsRef.current.has(stableId),
              });
            }
          }
        }
      });
    }

    // 5. Streak notifications — once per day
    if (streak >= 3) {
      const stableId = `streak-${today}`;
      if (!dismissedIdsRef.current.has(stableId)) {
        newNotifs.push({
          id: stableId,
          type: "streak",
          title: `🔥 ${streak} días seguidos`,
          body: streak >= 7
            ? "¡Una semana completa! Esa consistencia es imparable. El algoritmo te está premiando."
            : "Registrando métricas sin parar. Los datos de hoy definen la estrategia de mañana.",
          icon: "🔥",
          timestamp: Date.now(),
          read: readIdsRef.current.has(stableId),
        });
      }
    }

    // 6. Daily motivational — once per day
    const motId = `motivational-${today}`;
    if (!dismissedIdsRef.current.has(motId)) {
      newNotifs.push({
        id: motId,
        type: "motivational",
        title: "Frase del día",
        body: pickRandom(motivationalPhrases),
        icon: "💎",
        timestamp: Date.now(),
        read: readIdsRef.current.has(motId),
      });
    }

    // 7. Commitment alert (if no metrics logged today, after 8pm)
    const lastMetricDate = localStorage.getItem("md-metric-last-date") || "";
    const hour = new Date().getHours();
    if (lastMetricDate !== today && hour >= 20) {
      const stableId = `commitment-${today}`;
      if (!dismissedIdsRef.current.has(stableId)) {
        newNotifs.push({
          id: stableId,
          type: "commitment",
          title: "¿Registraste tus métricas hoy?",
          body: pickRandom(commitmentPhrases),
          icon: "⏰",
          timestamp: Date.now(),
          read: readIdsRef.current.has(stableId),
        });
      }
    }

    return newNotifs;
  }, [data]);

  // Merge new notifications into existing list (avoid duplicates by stable ID)
  const mergeNotifications = useCallback((existing: AppNotification[], incoming: AppNotification[]): AppNotification[] => {
    const existingMap = new Map(existing.map(n => [n.id, n]));
    for (const n of incoming) {
      if (!existingMap.has(n.id)) {
        existingMap.set(n.id, n);
      } else {
        // If already exists, keep the existing one but update read state
        const existingN = existingMap.get(n.id)!;
        if (n.read && !existingN.read) {
          existingMap.set(n.id, { ...existingN, read: true });
        }
      }
    }
    // Sort by timestamp descending (newest first)
    return [...existingMap.values()].sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  // Initial load + periodic check
  useEffect(() => {
    if (!data.kpis && !data.content) return;

    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      const newNotifs = generateContextualNotifications();
      if (newNotifs.length > 0) {
        setNotifications((prev) => {
          const merged = mergeNotifications(prev, newNotifs);
          saveNotificationsToStorage(merged);
          return merged;
        });
      }
    }

    const interval = setInterval(() => {
      const newNotifs = generateContextualNotifications();
      if (newNotifs.length > 0) {
        setNotifications((prev) => {
          const merged = mergeNotifications(prev, newNotifs);
          saveNotificationsToStorage(merged);
          return merged;
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [generateContextualNotifications, mergeNotifications, data]);

  // Mark as read — persist to localStorage
  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => {
        readIdsRef.current.add(n.id);
        return { ...n, read: true };
      });
      saveReadIds(readIdsRef.current);
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  const markRead = useCallback((id: string) => {
    readIdsRef.current.add(id);
    saveReadIds(readIdsRef.current);
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissedIdsRef.current.add(id);
    saveDismissedIds(dismissedIdsRef.current);
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAllRead,
    markRead,
    dismiss,
    panelRef,
  };
}

export function recordMetricStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = localStorage.getItem("md-metric-last-date") || "";
  let streak = parseInt(localStorage.getItem("md-metric-streak") || "0", 10);

  if (lastDate === today) return; // Already logged today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastDate === yesterday) {
    streak++;
  } else {
    streak = 1;
  }

  localStorage.setItem("md-metric-streak", streak.toString());
  localStorage.setItem("md-metric-last-date", today);
}