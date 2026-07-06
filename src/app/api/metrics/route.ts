import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const platform = searchParams.get('platform');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Record<string, unknown> = {};
    if (platform) where.platform = platform;
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, string>).gte = from;
      if (to) (where.date as Record<string, string>).lte = to;
    }

    const metrics = await db.dailyMetric.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const metric = await db.dailyMetric.create({
      data: {
        platform: body.platform,
        date: body.date,
        views: body.views ?? 0,
        likes: body.likes ?? 0,
        comments: body.comments ?? 0,
        shares: body.shares ?? 0,
        saves: body.saves ?? 0,
        profileViews: body.profileViews ?? 0,
        followers: body.followers ?? 0,
        linkClicks: body.linkClicks ?? 0,
        notes: body.notes,
      },
    });
    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create metric' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const metric = await db.dailyMetric.update({
      where: { id },
      data,
    });
    return NextResponse.json(metric);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update metric' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await db.dailyMetric.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete metric' }, { status: 500 });
  }
}