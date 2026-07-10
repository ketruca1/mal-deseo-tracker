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
            className="w-20 h-20 mx-auto rounded-[22px] flex items-center justify-center inner-glow-accent"
            style={{
              background: "rgba(214, 0, 28, 0.12)",
              border: "0.5px solid rgba(214, 0, 28, 0.18)",
              boxShadow:
                "0 0 60px rgba(214, 0, 28, 0.1), 0 0 0 0.5px rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(214, 0, 28, 0.08)",
            }}
          >
            <Music className="h-9 w-9 text-[#D6001C]" strokeWidth={1.5} />
          </div>
        </div>

        <h1
          className="text-[52px] font-bold text-white mt-8 landing-fade-in-delay-1 text-display"
          style={{
            letterSpacing: "-0.045em",
            textShadow: "0 0 80px rgba(214, 0, 28, 0.15), 0 0 40px rgba(214, 0, 28, 0.06)",
          }}
        >
          MAL DESEO
        </h1>
        <p
          className="text-[15px] mt-2 landing-fade-in-delay-1 font-normal tracking-[-0.01em]"
          style={{ color: "rgba(142, 142, 147, 0.85)" }}
        >
          Kevin Cano — Bachata
        </p>
        <p className="text-[11px] mt-1.5 tracking-[0.2em] uppercase landing-fade-in-delay-2 font-medium text-[#48484a]">
          Launch Tracker
        </p>

        <div className="mt-12 landing-fade-in-delay-3">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn-premium btn-premium-primary tap-feedback w-[260px] h-[50px] rounded-[14px] text-[15px] font-semibold tracking-[-0.01em] text-white"
            style={{
              boxShadow:
                "0 0 0 0.5px rgba(214, 0, 28, 0.3) inset, 0 2px 20px rgba(214, 0, 28, 0.35), 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(214, 0, 28, 0.08)",
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

interface ContentPiece {
  id: string; title: string; description: string | null; platform: string;
  contentType: string; status: string; scheduledDate: string | null; notes: string | null;
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
  const [contentPieces, setContentPieces] = useState<ContentPiece[]>([]);

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
      const [dashRes, contentRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/content"),
      ]);
      if (dashRes.ok) setData(await dashRes.json());
      if (contentRes.ok) {
        const contentData = await contentRes.json();
        if (Array.isArray(contentData)) setContentPieces(contentData);
      }
    } catch (e) { console.error("Failed to fetch data", e); }
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

  /* ─── Skeleton (Premium Shimmer) ─── */
  if (loading || !data) {
    return (
      <div className="app-bg min-h-screen pb-28">
        <div className="pt-safe" />
        <div className="px-5 pt-14 pb-6">
          <div className="shimmer inline-block rounded-lg">
            <Skeleton className="h-5 w-32 rounded-lg bg-white/[0.04]" />
          </div>
          <div className="shimmer inline-block rounded-lg mt-2">
            <Skeleton className="h-3 w-20 rounded-lg bg-white/[0.04]" />
          </div>
        </div>
        <div className="px-5 space-y-3">
          <div className="shimmer rounded-2xl">
            <Skeleton className="h-24 w-full rounded-2xl bg-white/[0.03]" />
          </div>
          <div className="shimmer rounded-2xl">
            <Skeleton className="h-32 w-full rounded-2xl bg-white/[0.03]" />
          </div>
          <div className="shimmer rounded-2xl">
            <Skeleton className="h-48 w-full rounded-2xl bg-white/[0.03]" />
          </div>
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
              {/* Logo icon — rotating gradient border + inner glow */}
              <div className="relative">
                <div
                  className="absolute -inset-[2px] rounded-[14px] opacity-60"
                  style={{
                    background: "conic-gradient(from 0deg, rgba(214,0,28,0.2), rgba(214,0,28,0.02), rgba(214,0,28,0.15), rgba(214,0,28,0.02), rgba(214,0,28,0.2))",
                    animation: "spin-slow 8s linear infinite",
                    filter: "blur(1px)",
                  }}
                />
                <div
                  className="relative w-10 h-10 rounded-[12px] flex items-center justify-center inner-glow-accent"
                  style={{
                    background: "rgba(214, 0, 28, 0.1)",
                    border: "0.5px solid rgba(214, 0, 28, 0.16)",
                    boxShadow: "0 0 20px rgba(214, 0, 28, 0.06), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
                  }}
                >
                  <Music className="h-[18px] w-[18px] text-[#D6001C]" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h1
                  className="text-[17px] font-semibold tracking-[-0.025em] text-gradient-accent"
                >
                  Mal Deseo
                </h1>
                <p className="text-[11px] text-[#6e6e73] mt-[-1px] tracking-[0.01em] font-normal">
                  Kevin Cano
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#6e6e73] hover:text-white hover:bg-white/[0.04] transition-colors duration-200 relative press-effect"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{
                      background: "#D6001C",
                      boxShadow: "0 0 8px rgba(214, 0, 28, 0.4)",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#48484a] hover:text-[#D6001C] hover:bg-[#D6001C]/[0.06] transition-colors duration-200 press-effect"
              >
                <LogOut className="h-[16px] w-[16px]" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-[10px] text-[#6e6e73] uppercase tracking-[0.12em] font-medium">Lanzamiento</p>
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
                  className="text-[19px] font-bold text-white mt-0.5 tracking-[-0.025em] hover:text-[#D6001C] transition-colors duration-200 press-effect"
                  style={{ textShadow: "0 0 30px rgba(255,255,255,0.04)" }}
                >
                  {formatDateDisplay(launchDate)}
                </button>
              )}
            </div>
            {/* Days counter — dramatic elevated glass container */}
            <div className="relative">
              {/* Glow behind the days number */}
              <div
                className="absolute inset-0 rounded-[14px] opacity-50"
                style={{
                  background: "radial-gradient(ellipse at 50% 40%, rgba(214, 0, 28, 0.08) 0%, transparent 70%)",
                  filter: "blur(4px)",
                }}
              />
              <div
                className="relative glass-elevated px-5 py-2.5 text-center min-w-[80px] inner-glow-accent"
                style={{ borderRadius: "14px" }}
              >
                <p className="text-[9px] text-[#6e6e73] uppercase tracking-[0.1em] font-medium">Días</p>
                <p
                  className="text-[28px] font-bold text-white leading-none tracking-[-0.03em] mt-[2px]"
                  style={{ textShadow: "0 0 20px rgba(214, 0, 28, 0.2)" }}
                >
                  {daysLeft}
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats — refined glass pills */}
          <div className="flex gap-2 mt-3">
            {[
              { label: "Views", value: formatNumber(data.overview.combined.totalViews) },
              { label: "Engagement", value: `${data.overview.instagram.engagementRate}%` },
              { label: "Contenido", value: `${data.content.published}/${data.content.total}` },
              { label: "KPIs", value: `${data.kpis.completed}/${data.kpis.total}` },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 glass-pill py-2.5 px-1 text-center inner-glow hover-lift cursor-default"
                style={{ borderRadius: "12px" }}
              >
                <p className="text-[8px] text-[#6e6e73] uppercase tracking-[0.08em] font-medium">{s.label}</p>
                <p className="text-[14px] font-bold text-white mt-[2px] tracking-[-0.02em]">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-md mx-auto px-4 pt-4 pb-28 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto p-[3px] glass-tabs mb-4">
            {tabConfig.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-[8px] transition-all duration-300 cursor-pointer relative ${
                    isActive
                      ? "glass-tab-active text-white"
                      : "text-[#5a5a5e] hover:text-[#8e8e93]"
                  }`}
                  style={isActive ? {
                    boxShadow: "0 0 0 0.5px rgba(214, 0, 28, 0.06) inset, 0 0 24px rgba(214, 0, 28, 0.1), 0 2px 0 0 rgba(214, 0, 28, 0.25)",
                  } : undefined}
                >
                  {/* Animated glow underline for active tab */}
                  {isActive && (
                    <span
                      className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                      style={{
                        width: "16px",
                        background: "linear-gradient(90deg, transparent, #D6001C, transparent)",
                        boxShadow: "0 0 8px rgba(214, 0, 28, 0.5), 0 0 16px rgba(214, 0, 28, 0.2)",
                      }}
                    />
                  )}
                  <tab.icon
                    className={`transition-all duration-300 ${isActive ? "h-[15px] w-[15px]" : "h-[14px] w-[14px]"}`}
                    strokeWidth={isActive ? 1.8 : 1.3}
                  />
                  <span className={`text-[8px] font-medium tracking-[0.02em] transition-all duration-300 ${isActive ? "opacity-100" : "opacity-70"}`}>
                    {tab.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="dashboard" className="mt-0 space-y-3"><OverviewCards data={data.overview} /></TabsContent>
          <TabsContent value="tendencia" className="mt-0 space-y-3">
            <SyncPanel onSynced={fetchData} />
            <TrendChart data={data.dailyTrend} />
          </TabsContent>
          <TabsContent value="contenido" className="mt-0"><ContentCalendar content={contentPieces} onRefresh={fetchData} /></TabsContent>
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
        {/* Subtle top-edge highlight line */}
        <div
          className="absolute top-0 left-0 right-0 h-[0.5px]"
          style={{
            background: "linear-gradient(90deg, transparent 5%, rgba(214, 0, 28, 0.15) 30%, rgba(255, 255, 255, 0.08) 50%, rgba(214, 0, 28, 0.15) 70%, transparent 95%)",
          }}
        />
        <div className="max-w-md mx-auto flex items-center justify-around pt-2 pb-safe">
          {tabConfig.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                className={`flex flex-col items-center gap-[2px] py-1 px-4 transition-all duration-300 tap-feedback relative ${
                  isActive ? "text-[#D6001C]" : "text-[#48484a]"
                }`}
              >
                {/* Red dot indicator above active icon */}
                {isActive && (
                  <span
                    className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full"
                    style={{
                      background: "#D6001C",
                      boxShadow: "0 0 6px rgba(214, 0, 28, 0.6), 0 0 12px rgba(214, 0, 28, 0.2)",
                    }}
                  />
                )}
                <tab.icon
                  className={`transition-all duration-300 ${isActive ? "h-[19px] w-[19px]" : "h-[17px] w-[17px]"}`}
                  strokeWidth={isActive ? 1.8 : 1.2}
                />
                <span className={`text-[9px] font-medium tracking-[0.02em] transition-all duration-300 ${isActive ? "opacity-100" : "opacity-50"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}