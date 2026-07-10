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

  const inputField = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</label>
      <input type={type} placeholder={placeholder} value={form[key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="mt-1 h-9 w-full text-sm bg-white/[0.04] border border-white/[0.06] text-white rounded-xl px-3 outline-none focus:border-white/20" />
    </div>
  );

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full h-9 gap-1.5 text-[11px] rounded-xl text-white border-0 shadow-md shadow-red-500/10 flex items-center justify-center"
        style={{ background: "linear-gradient(to right, #991b1b, #dc2626)" }}
      >
        {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        {showForm ? "Cancelar" : "Agregar Metrica del Dia"}
      </button>

      {showForm && (
        <div className="glass p-4 space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Plataforma</label>
              <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
                className="mt-1 h-9 w-full text-sm bg-white/[0.04] border border-white/[0.06] text-white rounded-xl px-3 outline-none">
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            {inputField("Fecha", "date", "date")}
          </div>
          <div className="grid grid-cols-2 gap-3">{inputField("Views", "views", "number")}{inputField("Likes", "likes", "number")}</div>
          <div className="grid grid-cols-2 gap-3">{inputField("Comments", "comments", "number")}{inputField("Shares", "shares", "number")}</div>
          <div className="grid grid-cols-2 gap-3">{inputField("Saves (IG)", "saves", "number")}{inputField("Visitas perfil", "profileViews", "number")}</div>
          <div className="grid grid-cols-2 gap-3">{inputField("Seguidores", "followers", "number")}{inputField("Clics enlace", "linkClicks", "number")}</div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">Notas</label>
            <textarea placeholder="Observaciones..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="mt-1 w-full text-sm min-h-[50px] bg-white/[0.04] border border-white/[0.06] text-white rounded-xl p-3 outline-none focus:border-white/20 resize-none" />
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