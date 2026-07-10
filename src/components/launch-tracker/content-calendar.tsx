"use client";

import { useState, useEffect } from "react";

interface ContentPiece {
  id: string; title: string; description: string | null; platform: string;
  contentType: string; status: string; scheduledDate: string | null; notes: string | null;
}

const contentTypeLabel: Record<string, string> = {
  teaser: "Teaser", snippet: "Snippet", lyric_video: "Lyric Video", behind_scenes: "BTS", story: "Story", reel: "Reel",
};

export default function ContentCalendar() {
  const [content, setContent] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => { setContent(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-4"><div className="h-4 w-32 rounded-lg bg-white/[0.04] animate-pulse" /></div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-[13px] font-semibold text-[#6e6e73] uppercase tracking-[0.06em]">
        Calendario de Contenido ({content.length} piezas)
      </p>
      {content.map((item) => (
        <div key={item.id} className="glass p-4">
          <p className="text-[14px] font-medium text-white">{item.title}</p>
          <p className="text-[12px] text-[#6e6e73] mt-1">
            {contentTypeLabel[item.contentType] || item.contentType} - {item.platform} - {item.status}
          </p>
          {item.scheduledDate && <p className="text-[11px] text-[#48484a] mt-1">{item.scheduledDate}</p>}
        </div>
      ))}
    </div>
  );
}