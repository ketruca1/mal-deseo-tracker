"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";

interface TrendData { date: string; tiktok: number; instagram: number; }

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3.5 py-2.5 text-[12px] min-w-[140px]"
      style={{
        background: "rgba(10, 6, 16, 0.94)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "0.5px solid rgba(239,68,68,0.1)",
        borderRadius: "14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(239,68,68,0.05)",
      }}
    >
      <p className="font-medium text-white mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[#6e6a7a] capitalize">{p.name}</span>
          </div>
          <span className="font-semibold text-white tabular-nums">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function TrendChart({ data }: { data: TrendData[] }) {
  const formatted = data.map((d) => ({ ...d, date: d.date.slice(5) }));

  const dayOrder = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const ttByDay: Record<string, number> = {};
  const igByDay: Record<string, number> = {};
  const dayCounts: Record<string, number> = {};

  data.forEach((d) => {
    const dn = dayOrder[new Date(d.date + "T00:00:00").getDay()];
    ttByDay[dn] = (ttByDay[dn] || 0) + d.tiktok;
    igByDay[dn] = (igByDay[dn] || 0) + d.instagram;
    dayCounts[dn] = (dayCounts[dn] || 0) + 1;
  });

  const avgByDay = dayOrder.filter((d) => dayCounts[d] > 0).map((day) => ({
    day: day.slice(0, 3),
    TikTok: Math.round((ttByDay[day] || 0) / dayCounts[day]),
    Instagram: Math.round((igByDay[day] || 0) / dayCounts[day]),
  }));

  return (
    <div className="space-y-3">
      {/* Line chart */}
      <div className="glass p-4">
        <p className="text-[13px] font-semibold text-white tracking-[-0.01em] mb-4">Tendencia Diaria</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatted}>
              <defs>
                <linearGradient id="ttGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#F87171" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="igGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B91C1C" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,68,68,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#3d3850" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#3d3850" }} tickLine={false} axisLine={false} tickFormatter={formatNumber} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="tiktok" name="TikTok" stroke="url(#ttGradient)" strokeWidth={2} dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "#050207", stroke: "#F87171" }} />
              <Line type="monotone" dataKey="instagram" name="Instagram" stroke="url(#igGradient)" strokeWidth={2} dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "#050207", stroke: "#EF4444" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart */}
      <div className="glass p-4">
        <p className="text-[13px] font-semibold text-white tracking-[-0.01em] mb-4">Promedio por Día</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={avgByDay} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(239,68,68,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#3d3850" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#3d3850" }} tickLine={false} axisLine={false} tickFormatter={formatNumber} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="TikTok" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={16} fillOpacity={0.7} />
              <Bar dataKey="Instagram" fill="#B91C1C" radius={[6, 6, 0, 0]} barSize={16} fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}