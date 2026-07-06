import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (platform) where.platform = platform;

    const content = await db.contentPiece.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
    });

    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const piece = await db.contentPiece.create({
      data: {
        title: body.title,
        description: body.description,
        platform: body.platform,
        contentType: body.contentType,
        status: body.status ?? 'pendiente',
        scheduledDate: body.scheduledDate,
        notes: body.notes,
        publishDate: body.publishDate ? new Date(body.publishDate) : null,
      },
    });
    return NextResponse.json(piece, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const piece = await db.contentPiece.update({
      where: { id },
      data: {
        ...data,
        publishDate: data.publishDate ? new Date(data.publishDate) : undefined,
      },
    });
    return NextResponse.json(piece);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await db.contentPiece.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}