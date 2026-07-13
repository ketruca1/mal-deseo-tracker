"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Plus, Trash2, Check, ChevronDown, ChevronUp, Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { recordMetricStreak } from "@/hooks/use-notifications";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface MetricEntry {
  id: string;
  platform: "tiktok" | "instagram";
  date: string;
  views: string; likes: string; comments: string; shares: string; saves: string;
  profileViews: string; followers: string; linkClicks: string; notes: string;
  saving: boolean; saved: boolean; error: boolean;
}

interface CSVPreview {
  fileName: string;
  fileSize: string;
  rows: number;
  platform: "tiktok" | "instagram";
  mappedFields: Array<{ field: string; csvColumn: string }>;
  dateRange: { from?: string; to?: string };
}

interface CSVResult {
  success: boolean;
  summary: {
    totalRows: number;
    parsedRows: number;
    created: number;
    updated: number;
    errors: number;
    platform: string;
    dateRange: { from?: string; to?: string };
  };
  mappedFields?: Array<{ field: string; csvColumn: string }>;
  errors?: Array<{ row: number; message: string }>;
  unmappedColumns?: string[];
  error?: string;
}

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

const defaultEntry = (platform: "tiktok" | "instagram" = "tiktok"): MetricEntry => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
  platform, date: new Date().toISOString().slice(0, 10),
  views: "", likes: "", comments: "", shares: "", saves: "",
  profileViews: "", followers: "", linkClicks: "", notes: "",
  saving: false, saved: false, error: false,
});

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function friendlyFieldName(field: string): string {
  const map: Record<string, string> = {
    date: "Fecha", views: "Vistas", likes: "Me gusta",
    comments: "Comentarios", shares: "Compartidos", saves: "Guardados",
    profileViews: "Visitas perfil", followers: "Seguidores",
  };
  return map[field] || field;
}

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function SyncPanel({ onSynced }: { onSynced: () => void }) {
  const [entries, setEntries] = useState<MetricEntry[]>([defaultEntry("tiktok"), defaultEntry("instagram")]);
  const [syncing, setSyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // ── CSV Upload State ──
  const [csvPlatform, setCsvPlatform] = useState<"tiktok" | "instagram">("tiktok");
  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<CSVResult | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Manual Entry Helpers ──
  const addEntry = (platform: "tiktok" | "instagram") => {
    setEntries((prev) => [...prev, defaultEntry(platform)]);
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) { toast.error("Debe haber al menos una entrada"); return; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, field: keyof MetricEntry, value: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value, saved: false, error: false } : e)));
  };

  const buildBody = (entry: MetricEntry) => ({
    platform: entry.platform, date: entry.date,
    views: parseInt(entry.views) || 0, likes: parseInt(entry.likes) || 0,
    comments: parseInt(entry.comments) || 0, shares: parseInt(entry.shares) || 0,
    saves: parseInt(entry.saves) || 0, profileViews: parseInt(entry.profileViews) || 0,
    followers: parseInt(entry.followers) || 0, linkClicks: parseInt(entry.linkClicks) || 0,
    notes: entry.notes || undefined,
  });

  const syncAll = async () => {
    setSyncing(true);
    let successCount = 0;
    for (const entry of entries) {
      if (!entry.date) continue;
      try {
        const r = await fetch("/api/metrics", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildBody(entry)),
        });
        if (r.ok) successCount++;
      } catch { /* skip */ }
    }
    setSyncing(false);
    setLastSync(new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
    recordMetricStreak();
    toast.success(`${successCount} metrica(s) sincronizadas`);
    onSynced();
  };

  // ── CSV Helpers ──
  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error("Solo se aceptan archivos .csv");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande (max 5MB)");
      return;
    }

    setCsvFile(file);
    setCsvResult(null);

    // Quick preview: parse first few lines
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.replace(/\r\n/g, '\n').trim().split('\n');
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const dataRows = lines.slice(1).filter(l => l.trim());

      // Simple field detection for preview
      const detected = headers.map(h => {
        const norm = h.toLowerCase();
        if (['date', 'fecha'].includes(norm)) return 'Fecha';
        if (['views', 'video views', 'visualizaciones'].includes(norm)) return 'Vistas';
        if (['likes', 'me gusta'].includes(norm)) return 'Me gusta';
        if (['comments', 'comentarios'].includes(norm)) return 'Comentarios';
        if (['shares', 'compartidos'].includes(norm)) return 'Compartidos';
        if (['saves', 'guardados'].includes(norm)) return 'Guardados';
        if (['profile views', 'vistas al perfil', 'visitas al perfil'].includes(norm)) return 'Visitas perfil';
        if (['followers', 'seguidores'].includes(norm)) return 'Seguidores';
        return null;
      });

      const mappedFields = headers
        .map((h, i) => ({ field: detected[i], csvColumn: h }))
        .filter(f => f.field);

      // Try to get date range
      const firstDate = dataRows[0]?.split(',')[0]?.trim().replace(/^"|"$/g, '');
      const lastDate = dataRows[dataRows.length - 1]?.split(',')[0]?.trim().replace(/^"|"$/g, '');

      setCsvPreview({
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        rows: dataRows.length,
        platform: csvPlatform,
        mappedFields,
        dateRange: { from: firstDate, to: lastDate },
      });
    };
    reader.readAsText(file);
  };

  const uploadCSV = async () => {
    if (!csvFile) return;
    setCsvUploading(true);
    setCsvResult(null);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('platform', csvPlatform);

      const resp = await fetch('/api/sync/csv', {
        method: 'POST',
        body: formData,
      });

      const result: CSVResult = await resp.json();
      setCsvResult(result);

      if (result.success) {
        const s = result.summary;
        toast.success(`CSV importado: ${s.created} nuevos, ${s.updated} actualizados`);
        recordMetricStreak();
        setLastSync(new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
        onSynced();
      } else {
        toast.error(result.error || 'Error al importar CSV');
      }
    } catch {
      toast.error('Error de conexion al subir CSV');
    } finally {
      setCsvUploading(false);
    }
  };

  const clearCSV = () => {
    setCsvFile(null);
    setCsvPreview(null);
    setCsvResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Drag & Drop Handlers ──
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [csvPlatform]);

  return (
    <div className="space-y-0">
      {/* ═══════════════════════════════════════
          CSV UPLOAD SECTION
          ═══════════════════════════════════════ */}
      <div className="glass-accent p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[12px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.06) 100%)",
                border: "0.5px solid rgba(239,68,68,0.12)",
              }}
            >
              <FileSpreadsheet className="h-4 w-4 text-[#F87171]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white tracking-[-0.01em]">Importar CSV</p>
              <p className="text-[11px] text-[#3d3850]">Exporta desde TikTok Analytics y sube aqui</p>
            </div>
          </div>
        </div>

        {/* Platform selector for CSV */}
        <div className="flex gap-2 mb-3">
          {(["tiktok", "instagram"] as const).map((p) => {
            const active = csvPlatform === p;
            return (
              <button
                key={p}
                onClick={() => { setCsvPlatform(p); clearCSV(); }}
                className="flex-1 h-8 rounded-[10px] text-[11px] font-semibold uppercase tracking-[0.06em] transition-all tap-feedback"
                style={{
                  background: active
                    ? p === "tiktok"
                      ? "rgba(248,113,113,0.1)"
                      : "rgba(239,68,68,0.1)"
                    : "rgba(255,255,255,0.02)",
                  border: active
                    ? `0.5px solid ${p === "tiktok" ? "rgba(248,113,113,0.25)" : "rgba(185,28,28,0.25)"}`
                    : "0.5px solid rgba(255,255,255,0.04)",
                  color: active ? (p === "tiktok" ? "#F87171" : "#EF4444") : "#3d3850",
                }}
              >
                {p === "tiktok" ? "TikTok" : "Instagram"}
              </button>
            );
          })}
        </div>

        {/* Drop zone */}
        {!csvFile && !csvResult?.success && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer rounded-[14px] border border-dashed transition-all duration-300 py-8 px-4 flex flex-col items-center justify-center gap-2.5"
            style={{
              borderColor: dragActive ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)",
              background: dragActive ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.01)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              className="hidden"
            />
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: dragActive
                  ? "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)"
                  : "rgba(255,255,255,0.03)",
                border: dragActive ? "0.5px solid rgba(239,68,68,0.2)" : "0.5px solid rgba(255,255,255,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              <Upload
                className="h-4.5 w-4.5 transition-colors"
                style={{ color: dragActive ? "#F87171" : "#3d3850" }}
                strokeWidth={1.5}
              />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium text-white/80">
                {dragActive ? "Suelta el archivo aqui" : "Arrastra tu CSV aqui"}
              </p>
              <p className="text-[11px] text-[#3d3850] mt-1">
                o toca para seleccionar archivo
              </p>
            </div>
          </div>
        )}

        {/* File preview (after selecting a file) */}
        {csvFile && !csvResult?.success && csvPreview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* File info card */}
            <div className="glass p-3.5 rounded-[12px]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-[#F87171]" strokeWidth={1.5} />
                  <div>
                    <p className="text-[12px] font-semibold text-white">{csvPreview.fileName}</p>
                    <p className="text-[10px] text-[#3d3850]">
                      {csvPreview.fileSize} &middot; {csvPreview.rows} filas de datos
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearCSV}
                  className="p-1.5 rounded-full hover:bg-white/[0.04] text-[#3d3850] hover:text-[#F87171] transition-colors"
                >
                  <X className="h-[14px] w-[14px]" strokeWidth={1.5} />
                </button>
              </div>

              {/* Date range */}
              {csvPreview.dateRange.from && (
                <p className="text-[10px] text-[#3d3850] mb-2.5">
                  Rango: <span className="text-white/60">{csvPreview.dateRange.from}</span>
                  {csvPreview.dateRange.to && csvPreview.dateRange.to !== csvPreview.dateRange.from && (
                    <> &rarr; <span className="text-white/60">{csvPreview.dateRange.to}</span></>
                  )}
                </p>
              )}

              {/* Mapped fields */}
              {csvPreview.mappedFields.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {csvPreview.mappedFields.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[9px] font-medium px-2 py-[3px] rounded-full"
                      style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "0.5px solid rgba(239,68,68,0.1)",
                        color: "#F87171",
                      }}
                    >
                      {f.field}
                      <span className="text-[#3d3850]">&larr; {f.csvColumn}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Upload button */}
            <button
              onClick={uploadCSV}
              disabled={csvUploading}
              className="w-full h-11 rounded-[14px] text-[14px] font-semibold text-white tap-feedback flex items-center justify-center gap-2 transition-all disabled:opacity-40 btn-primary"
            >
              {csvUploading ? (
                <div className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Upload className="h-[14px] w-[14px]" strokeWidth={2} />
              )}
              {csvUploading ? "Importando..." : "Importar CSV"}
            </button>
          </motion.div>
        )}

        {/* Success result */}
        {csvResult?.success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-4 rounded-[12px]"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Importacion exitosa</p>
                <p className="text-[10px] text-[#3d3850]">
                  {csvResult.summary.dateRange.from} &rarr; {csvResult.summary.dateRange.to}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Nuevos", value: csvResult.summary.created, color: "#34d399" },
                { label: "Actualizados", value: csvResult.summary.updated, color: "#F87171" },
                { label: "Filas procesadas", value: csvResult.summary.parsedRows, color: "#60a5fa" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/[0.02] rounded-[10px] p-2.5 text-center">
                  <p className="text-[16px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[9px] text-[#3d3850] uppercase tracking-wide mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {csvResult.errors && csvResult.errors.length > 0 && (
              <div className="flex items-start gap-2 p-2.5 rounded-[8px] bg-amber-500/5 border border-amber-500/10 mb-3">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] text-amber-300 font-medium mb-1">
                    {csvResult.summary.errors} error(es) de parseo
                  </p>
                  {csvResult.errors.slice(0, 3).map((err, i) => (
                    <p key={i} className="text-[9px] text-[#3d3850]">
                      Fila {err.row}: {err.message}
                    </p>
                  ))}
                  {csvResult.errors.length > 3 && (
                    <p className="text-[9px] text-[#3d3850]">
                      ...y {csvResult.errors.length - 3} mas
                    </p>
                  )}
                </div>
              </div>
            )}

            {csvResult.unmappedColumns && csvResult.unmappedColumns.length > 0 && (
              <p className="text-[9px] text-[#3d3850]">
                Columnas ignoradas: {csvResult.unmappedColumns.join(", ")}
              </p>
            )}

            <button
              onClick={clearCSV}
              className="w-full h-9 mt-3 rounded-[10px] text-[11px] font-medium bg-white/[0.03] border border-white/[0.05] text-[#3d3850] hover:text-white hover:border-white/10 transition-all tap-feedback"
            >
              Importar otro archivo
            </button>
          </motion.div>
        )}

        {/* Error result */}
        {csvResult && !csvResult.success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-4 rounded-[12px]"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-[#F87171]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Error en la importacion</p>
                <p className="text-[10px] text-[#F87171]">{csvResult.error}</p>
              </div>
            </div>
            <button
              onClick={clearCSV}
              className="w-full h-9 rounded-[10px] text-[11px] font-medium bg-white/[0.03] border border-white/[0.05] text-[#3d3850] hover:text-white hover:border-white/10 transition-all tap-feedback"
            >
              Intentar de nuevo
            </button>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          MANUAL SYNC SECTION (original)
          ═══════════════════════════════════════ */}
      <div className="glass-accent p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[12px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.06) 100%)",
                border: "0.5px solid rgba(239,68,68,0.12)",
              }}
            >
              <RefreshCw className={`h-4 w-4 text-[#F87171] ${syncing ? "animate-spin" : ""}`} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white tracking-[-0.01em]">Sincronizar</p>
              <p className="text-[11px] text-[#3d3850]">Datos manuales desde cada plataforma</p>
            </div>
          </div>
          {lastSync && (
            <span className="text-[10px] text-[#3d3850] font-medium">{lastSync}</span>
          )}
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={syncAll}
            disabled={syncing}
            className="flex-1 h-11 rounded-[14px] text-[14px] font-semibold text-white tap-feedback flex items-center justify-center gap-2 transition-all disabled:opacity-40 btn-primary"
          >
            {syncing ? (
              <div className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <RefreshCw className="h-[14px] w-[14px]" strokeWidth={2} />
            )}
            Sincronizar Todo
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-11 h-11 rounded-[14px] bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[#6e6a7a] hover:text-white transition-colors tap-feedback"
          >
            {expanded
              ? <ChevronUp className="h-[16px] w-[16px]" strokeWidth={1.5} />
              : <ChevronDown className="h-[16px] w-[16px]" strokeWidth={1.5} />
            }
          </button>
        </div>
      </div>

      {/* Expandable entries */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3.5 space-y-2.5">
              {entries.map((entry, idx) => {
                const isTT = entry.platform === "tiktok";
                const accentColor = isTT ? "#F87171" : "#EF4444";
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    className="glass p-4"
                    style={{ borderColor: `${accentColor}12` }}
                  >
                    {/* Entry header */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-[6px] h-[6px] rounded-full"
                          style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}40` }}
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em]"
                          style={{ color: accentColor }}>
                          {isTT ? "TikTok" : "Instagram"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {entry.saved && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium px-2.5 py-[3px] rounded-full bg-emerald-500/[0.06] border border-emerald-500/[0.08]">
                            <Check className="h-[10px] w-[10px]" /> Guardado
                          </span>
                        )}
                        {entries.length > 1 && (
                          <button onClick={() => removeEntry(entry.id)}
                            className="p-1.5 rounded-full hover:bg-white/[0.04] text-[#2a2435] hover:text-[#F87171] transition-colors">
                            <Trash2 className="h-[14px] w-[14px]" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mb-3.5">
                      <Label className="text-[10px] text-[#3d3850] uppercase tracking-[0.08em] font-medium">Fecha</Label>
                      <Input type="date" value={entry.date} onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                        className="mt-1.5 h-10 text-[13px] bg-white/[0.02] border-[#EF4444]/[0.08] text-white rounded-[12px] focus:border-[#EF4444]/30" />
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "views", label: "Views" },
                        { key: "likes", label: "Likes" },
                        { key: "comments", label: "Comments" },
                        { key: isTT ? "shares" : "saves", label: isTT ? "Shares" : "Saves" },
                        { key: "profileViews", label: "Visitas perfil" },
                        { key: "followers", label: "Seguidores" },
                        ...(isTT ? [] : [{ key: "linkClicks", label: "Clics enlace" }]),
                      ].map((f) => (
                        <div key={f.key}>
                          <Label className="text-[10px] text-[#3d3850] uppercase tracking-[0.08em] font-medium">{f.label}</Label>
                          <Input
                            type="number" placeholder="0"
                            value={entry[f.key as keyof MetricEntry] as string}
                            onChange={(e) => updateEntry(entry.id, f.key as keyof MetricEntry, e.target.value)}
                            className="mt-1 h-10 text-[13px] bg-white/[0.02] border-[#EF4444]/[0.08] text-white rounded-[12px] focus:border-[#EF4444]/30"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}

              {/* Add buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => addEntry("tiktok")}
                  className="flex-1 h-10 text-[12px] font-medium rounded-[12px] bg-white/[0.015] border border-dashed border-[#EF4444]/[0.08] text-[#3d3850] hover:text-[#F87171] hover:border-[#EF4444]/20 transition-colors flex items-center justify-center gap-1.5 tap-feedback"
                >
                  <Plus className="h-[12px] w-[12px]" /> TikTok
                </button>
                <button
                  onClick={() => addEntry("instagram")}
                  className="flex-1 h-10 text-[12px] font-medium rounded-[12px] bg-white/[0.015] border border-dashed border-[#B91C1C]/[0.08] text-[#3d3850] hover:text-[#EF4444] hover:border-[#B91C1C]/20 transition-colors flex items-center justify-center gap-1.5 tap-feedback"
                >
                  <Plus className="h-[12px] w-[12px]" /> Instagram
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}