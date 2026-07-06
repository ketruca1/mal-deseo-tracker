"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, BarChart3, Calendar, Target, Flag, LogOut, Bell, TrendingUp } from "lucide-react";
import OverviewCards from "@/components/launch-tracker/overview-cards";
import TrendChart from "@/components/launch-tracker/trend-chart";
import ContentCalendar from "@/components/launch-tracker/content-calendar";
import KPIPanel from "@/components/launch-tracker/kpi-panel";
import TimelineView from "@/components/launch-tracker/timeline-view";
import SyncPanel from "@/components/launch-tracker/sync-panel";
import NotificationPanel from "@/components/launch-tracker/notification-panel";
import { useNotifications } from "@/hooks/use-notifications";

/* ═══════════════════════════════════════════
   SIMPLE AUTH HELPERS (no NextAuth dependency)
   ═══════════════════════════════════════════ */
function setAuthCookie() {
  document.cookie = "md-auth=1; path=/; max-age=2592000; SameSite=Lax";
}
function clearAuthCookie() {
  document.cookie = "md-auth=; path=/; max-age=0";
}
function hasAuthCookie(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith("md-auth=1"));
}

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */
function LandingPage() {
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    setAuthCookie();
    window.location.href = "/";
  };

  return (
    <div className="app-bg min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <div className="landing-ring landing-ring-1" />
      <div className="landing-ring landing-ring-2" />
      <div className="landing-glow" />

      <div className="relative z-10 text-center">
        <div className="landing-fade-in inline-block">
          <div
            className="w-20 h-20 mx-auto rounded-[22px] flex items-center justify-center"
            style={{
              background: "rgba(214, 0, 28, 0.12)",
              border: "0.5px solid rgba(214, 0, 28, 0.15)",
              boxShadow: "0 0 40px rgba(214, 0, 28, 0.08), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
            }}
          >
            <Music className="h-9 w-9 text-[#D6001C]" strokeWidth={1.5} />
          </div>
        </div>

        <h1
          className="text-[44px] font-bold tracking-tight text-white mt-8 landing-fade-in-delay-1"
          style={{ letterSpacing: "-0.03em" }}
        >
          MAL DESEO
        </h1>
        <p className="text-[#6e6e73] text-[15px] mt-1.5 landing-fade-in-delay-1 font-normal">
          Kevin Cano — Bachata
        </p>
        <p className="text-[#48484a] text-[11px] mt-1 tracking-[0.2em] uppercase landing-fade-in-delay-2 font-medium">
          Launch Tracker
        </p>

        <div className="mt-12 landing-fade-in-delay-3">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="tap-feedback w-[260px] h-[50px] rounded-[14px] text-[15px] font-semibold tracking-[-0.01em] text-white transition-all duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-40"
            style={{
              background: "#D6001C",
              boxShadow: "0 2px 20px rgba(214, 0, 28, 0.25)",
            }}
          >
            {loading ? (
              <div className="w-4 h-4 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              <span>Ingresar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DATA TYPES
   ═══════════════════════════════════════════ */
interface DashboardData {
  overview: {
    tiktok: { totalViews: number; totalLikes: number; totalComments: number; totalShares: number; engagementRate: number; profileViews: number; daysTracked: number };
    instagram: { totalViews: number; totalLikes: number; totalComments: number; totalSaves: number; engagementRate: number; profileViews: number; followers: number; daysTracked: number };
    combined: { totalViews: number; totalInteractions: number };
  };
  content: { total: number; published: number; pending: number; inProgress: number };
  kpis: { total: number; completed: number; items: Array<{ id: string; name: string; description: string | null; platform: string | null; target: number; current: number; unit: string; category: string }> };
  events: { total: number; completed: number; items: Array<{ id: string; title: string; description: string | null; eventType: string; eventDate: string | null; completed: boolean }> };
  dailyTrend: Array<{ date: string; tiktok: number; instagram: number }>;
}

const tabConfig = [
  { key: "dashboard", label: "Resumen", icon: TrendingUp },
  { key: "tendencia", label: "Tendencia", icon: BarChart3 },
  { key: "contenido", label: "Contenido", icon: Calendar },
  { key: "kpis", label: "KPIs", icon: Target },
  { key: "timeline", label: "Timeline", icon: Flag },
] as const;

function formatDateDisplay(dateStr: string): string {
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

/* ═══════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════ */
export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [launchDate, setLaunchDate] = useState("2025-08-04");
  const [editingDate, setEditingDate] = useState(false);

  // Notifications
  const { notifications, unreadCount, isOpen: notifOpen, setIsOpen: setNotifOpen, markAllRead, markRead, dismiss, panelRef } = useNotifications(
    data ? { content: data.content, kpis: data.kpis } : {}
  );

  // Simple cookie-based auth check (no NextAuth dependency)
  useEffect(() => {
    const isAuth = hasAuthCookie();
    if (isAuth) {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("md-launch-date");
    if (saved) setLaunchDate(saved);
  }, []);

  const handleDateChange = (newDate: string) => {
    setLaunchDate(newDate);
    localStorage.setItem("md-launch-date", newDate);
    setEditingDate(false);
  };

  const handleLogout = () => {
    clearAuthCookie();
    window.location.href = "/";
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) setData(await res.json());
    } catch (e) { console.error("Failed to fetch dashboard", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authenticated) fetchData(); }, [fetchData, authenticated]);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ─── Loading ─── */
  if (checking) {
    return (
      <div className="app-bg min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-[1.5px] border-white/10 border-t-[#D6001C] rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) return <LandingPage />;

  /* ─── Skeleton ─── */
  if (loading || !data) {
    return (
      <div className="app-bg min-h-screen pb-28">
        <div className="pt-safe" />
        <div className="px-5 pt-14 pb-6">
          <Skeleton className="h-5 w-32 rounded-lg bg-white/[0.04]" />
          <Skeleton className="h-3 w-20 rounded-lg bg-white/[0.04] mt-2" />
        </div>
        <div className="px-5 space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl bg-white/[0.03]" />
          <Skeleton className="h-32 w-full rounded-2xl bg-white/[0.03]" />
          <Skeleton className="h-48 w-full rounded-2xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(launchDate + "T00:00:00").getTime() - Date.now()) / (1000*60*60*24)));

  return (
    <div className="app-bg min-h-screen relative">
      <div className="pt-safe" />

      {/* ─── Header ─── */}
      <header className="glass-header px-5 pb-4 pt-safe relative z-10">
        <div className="max-w-md mx-auto">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{
                  background: "rgba(214, 0, 28, 0.1)",
                  border: "0.5px solid rgba(214, 0, 28, 0.12)",
                }}
              >
                <Music className="h-[18px] w-[18px] text-[#D6001C]" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-[17px] font-semibold text-white tracking-[-0.02em]">Mal Deseo</h1>
                <p className="text-[12px] text-[#6e6e73] mt-[-1px]">
                  Kevin Cano
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#6e6e73] hover:text-white hover:bg-white/[0.04] transition-colors duration-200 relative"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: "#D6001C" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#48484a] hover:text-[#D6001C] hover:bg-[#D6001C]/[0.06] transition-colors duration-200"
              >
                <LogOut className="h-[16px] w-[16px]" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-[11px] text-[#6e6e73] uppercase tracking-[0.1em] font-medium">Lanzamiento</p>
              {editingDate ? (
                <input
                  type="date"
                  value={launchDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  onBlur={() => setEditingDate(false)}
                  autoFocus
                  className="text-[15px] font-semibold bg-white/[0.04] border border-white/[0.08] text-white rounded-[10px] px-3 py-1.5 focus:outline-none focus:border-[#D6001C]/30 mt-0.5"
                />
              ) : (
                <button
                  onClick={() => setEditingDate(true)}
                  className="text-[20px] font-bold text-white mt-0.5 tracking-[-0.02em] hover:text-[#D6001C] transition-colors duration-200"
                >
                  {formatDateDisplay(launchDate)}
                </button>
              )}
            </div>
            <div className="glass-pill px-4 py-2.5 text-center min-w-[72px]">
              <p className="text-[10px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium">Días</p>
              <p className="text-[24px] font-bold text-white leading-tight tracking-[-0.02em] mt-[-1px]">{daysLeft}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-2 mt-3">
            {[
              { label: "Views", value: formatNumber(data.overview.combined.totalViews) },
              { label: "Engagement", value: `${data.overview.instagram.engagementRate}%` },
              { label: "Contenido", value: `${data.content.published}/${data.content.total}` },
              { label: "KPIs", value: `${data.kpis.completed}/${data.kpis.total}` },
            ].map((s) => (
              <div key={s.label} className="flex-1 glass-pill py-2 px-1 text-center">
                <p className="text-[9px] text-[#6e6e73] uppercase tracking-[0.06em] font-medium">{s.label}</p>
                <p className="text-[13px] font-semibold text-white mt-[1px] tracking-[-0.01em]">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-md mx-auto px-4 pt-4 pb-28 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto p-[3px] glass-tabs mb-4">
            {tabConfig.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-[8px] transition-all duration-200 cursor-pointer ${
                  activeTab === tab.key
                    ? "glass-tab-active text-white"
                    : "text-[#48484a] hover:text-[#6e6e73]"
                }`}
              >
                <tab.icon className="h-[15px] w-[15px]" strokeWidth={1.5} />
                <span className="text-[8px] font-medium tracking-[0.02em]">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="mt-0 space-y-3"><OverviewCards data={data.overview} /></TabsContent>
          <TabsContent value="tendencia" className="mt-0 space-y-3">
            <SyncPanel onSynced={fetchData} />
            <TrendChart data={data.dailyTrend} />
          </TabsContent>
          <TabsContent value="contenido" className="mt-0"><ContentCalendar /></TabsContent>
          <TabsContent value="kpis" className="mt-0"><KPIPanel data={data.kpis.items} /></TabsContent>
          <TabsContent value="timeline" className="mt-0"><TimelineView data={data.events.items} /></TabsContent>
        </Tabs>
      </main>

      {/* ─── Notification Panel ─── */}
      <NotificationPanel
        notifications={notifications}
        unreadCount={unreadCount}
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onMarkAllRead={markAllRead}
        onMarkRead={markRead}
        onDismiss={dismiss}
        panelRef={panelRef}
      />

      {/* ─── Bottom Nav ─── */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav z-50">
        <div className="max-w-md mx-auto flex items-center justify-around pt-1.5 pb-safe">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={`flex flex-col items-center gap-[1px] py-1.5 px-4 transition-all duration-200 tap-feedback ${
                activeTab === tab.key
                  ? "text-[#D6001C]"
                  : "text-[#48484a]"
              }`}
            >
              <tab.icon className="h-[18px] w-[18px]" strokeWidth={activeTab === tab.key ? 1.8 : 1.2} />
              <span className="text-[9px] font-medium tracking-[0.02em]">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}