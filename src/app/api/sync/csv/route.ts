import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/* ═══════════════════════════════════════════════════════════
   TIKTOK CSV COLUMN NAME MAPPING (English + Spanish)
   ═══════════════════════════════════════════════════════════ */

interface MappedRow {
  date?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  profileViews?: number;
  followers?: number;
}

// Normalized column name → our field key
const COLUMN_ALIASES: Record<string, keyof MappedRow> = {
  // ── Date ──
  date: 'date',
  fecha: 'date',
  // ── Views ──
  views: 'views',
  'video views': 'views',
  visualizaciones: 'views',
  vistas: 'views',
  // ── Likes ──
  likes: 'likes',
  'me gusta': 'likes',
  'likes (hearts)': 'likes',
  // ── Comments ──
  comments: 'comments',
  comentarios: 'comments',
  // ── Shares ──
  shares: 'shares',
  compartidos: 'shares',
  // ── Saves ──
  saves: 'saves',
  guardados: 'saves',
  'video saves': 'saves',
  // ── Profile Views ──
  'profile views': 'profileViews',
  'vistas al perfil': 'profileViews',
  'visitas al perfil': 'profileViews',
  profileviews: 'profileViews',
  // ── Followers ──
  followers: 'followers',
  seguidores: 'followers',
  'new followers': 'followers',
  'nuevos seguidores': 'followers',
};

function normalizeHeader(raw: string): string {
  return raw.trim().toLowerCase().replace(/[_\-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildColumnMap(headers: string[]): { mapping: Record<keyof MappedRow, number>; unmapped: string[] } {
  const mapping = {} as Record<keyof MappedRow, number>;
  const unmapped: string[] = [];

  headers.forEach((h, idx) => {
    const norm = normalizeHeader(h);
    const field = COLUMN_ALIASES[norm];
    if (field) {
      mapping[field] = idx;
    } else {
      // Skip non-data columns like "Video title", "Nombre del video", etc.
      const skipPatterns = ['title', 'nombre', 'video name', 'name', 'id', 'url', 'link', 'description', 'desc'];
      if (!skipPatterns.some(p => norm.includes(p))) {
        unmapped.push(h.trim());
      }
    }
  });

  return { mapping, unmapped };
}

/* ═══════════════════════════════════════════════════════════
   CSV PARSER (handles quoted fields, commas in values, etc.)
   ═══════════════════════════════════════════════════════════ */

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  // Handle both \r\n and \n
  const lines = text.replace(/\r\n/g, '\n').trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).filter(l => l.trim()).map(parseCSVLine);
  return { headers, rows };
}

/* ═══════════════════════════════════════════════════════════
   DATE NORMALIZATION
   ═══════════════════════════════════════════════════════════ */

function normalizeDate(raw: string): string | null {
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // Try DD/MM/YYYY or DD-MM-YYYY (Latin American format)
  const latinMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (latinMatch) {
    const [, day, month, year] = latinMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try MM/DD/YYYY (US format)
  const usMatch = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try parsing as Date string
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return null;
}

function parseNum(raw: string): number {
  // Remove commas, dots as thousand separators, % signs, etc.
  const cleaned = raw.replace(/[%\s,]/g, '').replace(/\.(?=\d{3}(?!\d))/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

/* ═══════════════════════════════════════════════════════════
   MAIN HANDLER
   ═══════════════════════════════════════════════════════════ */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided', success: false }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Solo se aceptan archivos .csv', success: false }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo es demasiado grande (max 5MB)', success: false }, { status: 400 });
    }

    const platform = (formData.get('platform') as string) || 'tiktok';

    const text = await file.text();
    const { headers, rows } = parseCSV(text);

    if (headers.length === 0 || rows.length === 0) {
      return NextResponse.json({ error: 'CSV vacio o sin datos', success: false }, { status: 400 });
    }

    // Build column mapping
    const { mapping, unmapped } = buildColumnMap(headers);

    // Check for minimum required fields
    if (mapping.date === undefined) {
      return NextResponse.json({
        error: 'No se encontro columna de fecha. Nombres esperados: "Date", "Fecha"',
        success: false,
      }, { status: 400 });
    }

    // Parse rows into metrics
    const parsed: MappedRow[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Get date from mapped column
      const rawDate = row[mapping.date] || '';
      const date = normalizeDate(rawDate);

      if (!date) {
        errors.push({ row: i + 2, message: `Fecha no reconocida: "${rawDate}"` });
        continue;
      }

      parsed.push({
        date,
        views: mapping.views !== undefined ? parseNum(row[mapping.views]) : 0,
        likes: mapping.likes !== undefined ? parseNum(row[mapping.likes]) : 0,
        comments: mapping.comments !== undefined ? parseNum(row[mapping.comments]) : 0,
        shares: mapping.shares !== undefined ? parseNum(row[mapping.shares]) : 0,
        saves: mapping.saves !== undefined ? parseNum(row[mapping.saves]) : 0,
        profileViews: mapping.profileViews !== undefined ? parseNum(row[mapping.profileViews]) : 0,
        followers: mapping.followers !== undefined ? parseNum(row[mapping.followers]) : 0,
      });
    }

    if (parsed.length === 0) {
      return NextResponse.json({
        error: 'No se pudieron extraer datos del CSV',
        details: errors,
        success: false,
      }, { status: 400 });
    }

    // Upsert into database (find existing by platform+date, update or create)
    let created = 0;
    let updated = 0;

    for (const item of parsed) {
      try {
        const existing = await db.dailyMetric.findFirst({
          where: { platform, date: item.date },
        });

        if (existing) {
          await db.dailyMetric.update({
            where: { id: existing.id },
            data: {
              views: item.views,
              likes: item.likes,
              comments: item.comments,
              shares: item.shares,
              saves: item.saves,
              profileViews: item.profileViews,
              followers: item.followers,
            },
          });
          updated++;
        } else {
          await db.dailyMetric.create({
            data: {
              platform,
              date: item.date,
              views: item.views,
              likes: item.likes,
              comments: item.comments,
              shares: item.shares,
              saves: item.saves,
              profileViews: item.profileViews,
              followers: item.followers,
            },
          });
          created++;
        }
      } catch {
        errors.push({ row: 0, message: `Error guardando datos del ${item.date}` });
      }
    }

    // Mapped fields info for preview
    const mappedFields = Object.entries(mapping).map(([field, idx]) => ({
      field,
      csvColumn: headers[idx],
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: rows.length,
        parsedRows: parsed.length,
        created,
        updated,
        errors: errors.length,
        platform,
        dateRange: {
          from: parsed[0]?.date,
          to: parsed[parsed.length - 1]?.date,
        },
      },
      mappedFields,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      unmappedColumns: unmapped.length > 0 ? unmapped : undefined,
    });

  } catch (error) {
    console.error('CSV sync error:', error);
    return NextResponse.json({ error: 'Error interno del servidor', success: false }, { status: 500 });
  }
}