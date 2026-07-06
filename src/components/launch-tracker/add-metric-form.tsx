"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { recordMetricStreak } from "@/hooks/use-notifications";

export default function AddMetricForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
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
        toast.success("Métrica guardada");
        setForm({ platform:"tiktok", date: new Date().toISOString().slice(0,10), views:"", likes:"", comments:"", shares:"", saves:"", profileViews:"", followers:"", linkClicks:"", notes:"" });
        setOpen(false); onAdded();
      } else toast.error("Error al guardar");
    } catch { toast.error("Error de conexión"); }
  };

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <Label className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</Label>
      <Input type={type} placeholder={placeholder} value={form[key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="mt-1 h-9 text-sm bg-white/4 border-white/8 text-white focus:ring-[#dc2626]/50 rounded-xl" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-9 gap-1.5 text-[11px] rounded-xl bg-gradient-to-r from-[#991b1b] to-[#dc2626] hover:from-[#b91c1c] hover:to-[#ef4444] text-white border-0 shadow-md shadow-red-500/10">
          <Plus className="h-3.5 w-3.5" /> Agregar Métrica del Día
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/8 rounded-3xl">
        <DialogHeader><DialogTitle className="text-sm text-white">Nueva Métrica</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] text-gray-500 uppercase tracking-wider">Plataforma</Label>
              <Select value={form.platform} onValueChange={(v) => setForm((p) => ({ ...p, platform: v }))}>
                <SelectTrigger className="mt-1 h-9 text-sm bg-white/4 border-white/8 text-white rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0a0a0a]/95 backdrop-blur-xl border-white/8 rounded-2xl">
                  <SelectItem value="tiktok">TikTok</SelectItem><SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {field("Fecha", "date", "date")}
          </div>
          <div className="grid grid-cols-2 gap-3">{field("Views", "views", "number")}{field("Likes", "likes", "number")}</div>
          <div className="grid grid-cols-2 gap-3">{field("Comments", "comments", "number")}{field("Shares", "shares", "number")}</div>
          <div className="grid grid-cols-2 gap-3">{field("Saves (IG)", "saves", "number")}{field("Visitas perfil", "profileViews", "number")}</div>
          <div className="grid grid-cols-2 gap-3">{field("Seguidores", "followers", "number")}{field("Clics enlace", "linkClicks", "number")}</div>
          <div>
            <Label className="text-[10px] text-gray-500 uppercase tracking-wider">Notas</Label>
            <Textarea placeholder="Observaciones..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="mt-1 text-sm min-h-[50px] bg-white/4 border-white/8 text-white focus:ring-[#dc2626]/50 rounded-xl" />
          </div>
          <Button onClick={handleSubmit} className="w-full h-9 text-sm rounded-xl bg-gradient-to-r from-[#991b1b] to-[#dc2626] hover:from-[#b91c1c] hover:to-[#ef4444] text-white border-0 shadow-md shadow-red-500/10">
            Guardar Métrica
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}