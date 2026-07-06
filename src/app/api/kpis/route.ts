import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const kpis = await db.kPI.findMany({
      orderBy: { category: 'asc' },
    });
    return NextResponse.json(kpis);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const kpi = await db.kPI.update({
      where: { id },
      data,
    });
    return NextResponse.json(kpi);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update KPI' }, { status: 500 });
  }
}