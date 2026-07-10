"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface TrendData { date: string; tiktok: number; instagram: number; }

function formatNumber(n: number): string { if (n >= 1000) return (n / 1000).toFixed(1) + "K"; return n.toLocaleString(); }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3.5 py-2.5 text-[12px] min-w-[140px]" style={{ background: "rgba(12,12,12,0.94)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "0.5px solid rgba(214,0,28,0.1)", borderRadius: "14px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <p className="font-medium text-white mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5"><div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: p.color }} /><span className="text-[#6e6e73] capitalize">{p.name}</span></div>
          <span className="font-semibold text-white tabular-nums">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function TrendChart({ data }: { data: TrendData[] }) {
  const formatted = data.map((d) => ({ ...d, date: d.date.slice(5) }));
  const dayOrder = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const ttByDay: Record<string, number> = {}; const igByDay: Record<string, number> = {}; const dayCounts: Record<string, number> = {};
  data.forEach((d) => { const dn = dayOrder[new Date(d.date + "T00:00:00").getDay()]; ttByDay[dn] = (ttByDay[dn] || 0) + d.tiktok; igByDay[dn] = (igByDay[dn] || 0) + d.instagram; dayCounts[dn] = (dayCounts[dn] || 0) + 1; });
  const avgByDay = dayOrder.filter((d) => dayCounts[d] > 0).map((day) => ({ day: day.slice(0, 3), TikTok: Math.round((ttByDay[day] || 0) / dayCounts[day]), Instagram: Math.round((igByDay[day] || 0) / dayCounts[day]) }));

  return (
    <div className="space-y-3">
      <div className="glass p-4">
        <p className="text-[13px] font-semibold text-white tracking-[-0.01em] mb-4">Tendencia Diaria</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatted}>
              <defs>
                <linearGradient id="ttG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#b91c1c" stopOpacity={0.9} /><stop offset="100%" stopColor="#ff3b4f" stopOpacity={0.9} /></linearGradient>
                <linearGradient id="igG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#db2777" stopOpacity={0.9} /><stop offset="100%" stopColor="#f472b6" stopOpacity={0.9} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(214,0,28,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#48484a" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#48484a" }} tickLine={false} axisLine={false} tickFormatter={formatNumber} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="tiktok" name="TikTok" stroke="url(#ttG)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: "#000", stroke: "#D6001C" }} />
              <Line type="monotone" dataKey="instagram" name="Instagram" stroke="url(#igG)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: "#000", stroke: "#ec4899" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass p-4">
        <p className="text-[13px] font-semibold text-white tracking-[-0.01em] mb-4">Promedio por Día</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={avgByDay} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(214,0,28,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#48484a" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#48484a" }} tickLine={false} axisLine={false} tickFormatter={formatNumber} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="TikTok" fill="#D6001C" radius={[6, 6, 0, 0]} barSize={16} fillOpacity={0.75} />
              <Bar dataKey="Instagram" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={16} fillOpacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}