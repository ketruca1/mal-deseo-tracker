"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { recordMetricStreak } from "@/hooks/use-notifications";

export default function AddMetricForm({ onAdded }: { onAdded: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    platform: "tiktok", date: new Date().toISOString().slice(0, 10),
    views: "", likes: "", comments: "", shares: "", saves: "",
    profileViews: "", followers: "", linkClicks: "", notes: "",
  });

  const handleSubmit = async () => {
    try {
      const body = { ...form, views: parseInt(form.views)||0, likes: parseInt(form.likes)||0, comments: parseInt(form.comments)||0,
        shares: parseInt(form.shares)||0, saves: parseInt(form.saves)||0, profileViews: parseInt(form.profileViews)||0,
        followers: parseInt(form.followers)||0, linkClicks: parseInt(form.linkClicks)||0 };
      const r = await fetch("/api/metrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (r.ok) {
        recordMetricStreak();
        toast.success("Metrica guardada");
        setForm({ platform:"tiktok", date: new Date().toISOString().slice(0,10), views:"", likes:"", comments:"", shares:"", saves:"", profileViews:"", followers:"", linkClicks:"", notes:"" });
        setShowForm(false); onAdded();
      } else toast.error("Error al guardar");
    } catch { toast.error("Error de conexion"); }
  };

  const numField = (label: string, key: string, placeholder = "") => (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</label>
      <input type="number" placeholder={placeholder} value={form[key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="mt-1 w-full h-9 px-3 text-sm bg-white/[0.04] border border-white/[0.08] text-white rounded-xl outline-none focus:border-[#D6001C]/40" />
    </div>
  );

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full h-9 gap-1.5 text-[11px] rounded-xl text-white border-0 shadow-md shadow-red-500/10 flex items-center justify-center"
        style={{ background: "linear-gradient(to right, #991b1b, #dc2626)" }}
      >
        <Plus className="h-3.5 w-3.5" /> Agregar Metrica del Dia
      </button>

      {showForm && (
        <div className="mt-3 p-4 glass rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-white">Nueva Metrica</p>
            <button onClick={() => setShowForm(false)} className="text-[#6e6e73] hover:text-white p-1"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Plataforma</label>
              <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
                className="mt-1 w-full h-9 px-3 text-sm bg-white/[0.04] border border-white/[0.08] text-white rounded-xl outline-none appearance-none">
                <option value="tiktok" style={{background:'#1c1c1e'}}>TikTok</option>
                <option value="instagram" style={{background:'#1c1c1e'}}>Instagram</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Fecha</label>
              <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="mt-1 w-full h-9 px-3 text-sm bg-white/[0.04] border border-white/[0.08] text-white rounded-xl outline-none focus:border-[#D6001C]/40" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">{numField("Views", "views")}{numField("Likes", "likes")}</div>
          <div className="grid grid-cols-2 gap-3">{numField("Comments", "comments")}{numField("Shares", "shares")}</div>
          <div className="grid grid-cols-2 gap-3">{numField("Saves (IG)", "saves")}{numField("Visitas perfil", "profileViews")}</div>
          <div className="grid grid-cols-2 gap-3">{numField("Seguidores", "followers")}{numField("Clics enlace", "linkClicks")}</div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">Notas</label>
            <textarea placeholder="Observaciones..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="mt-1 w-full text-sm min-h-[50px] p-3 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl outline-none focus:border-[#D6001C]/40 resize-none" />
          </div>
          <button onClick={handleSubmit}
            className="w-full h-9 text-sm rounded-xl text-white border-0 shadow-md shadow-red-500/10"
            style={{ background: "linear-gradient(to right, #991b1b, #dc2626)" }}>
            Guardar Metrica
          </button>
        </div>
      )}
    </div>
  );
}