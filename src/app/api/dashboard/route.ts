import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Aggregate TikTok metrics
    const tiktokMetrics = await db.dailyMetric.findMany({
      where: { platform: 'tiktok' },
      orderBy: { date: 'asc' },
    });

    // Aggregate Instagram metrics
    const igMetrics = await db.dailyMetric.findMany({
      where: { platform: 'instagram' },
      orderBy: { date: 'asc' },
    });

    // Compute TikTok totals
    const ttTotalViews = tiktokMetrics.reduce((sum, m) => sum + m.views, 0);
    const ttTotalLikes = tiktokMetrics.reduce((sum, m) => sum + m.likes, 0);
    const ttTotalComments = tiktokMetrics.reduce((sum, m) => sum + m.comments, 0);
    const ttTotalShares = tiktokMetrics.reduce((sum, m) => sum + m.shares, 0);
    const ttTotalInteractions = ttTotalLikes + ttTotalComments + ttTotalShares;
    const ttEngagementRate = ttTotalViews > 0 ? ((ttTotalInteractions / ttTotalViews) * 100) : 0;
    const ttProfileViews = tiktokMetrics.reduce((sum, m) => sum + m.profileViews, 0);

    // Compute Instagram totals
    const igTotalViews = igMetrics.reduce((sum, m) => sum + m.views, 0);
    const igTotalLikes = igMetrics.reduce((sum, m) => sum + m.likes, 0);
    const igTotalComments = igMetrics.reduce((sum, m) => sum + m.comments, 0);
    const igTotalSaves = igMetrics.reduce((sum, m) => sum + m.saves, 0);
    const igTotalInteractions = igTotalLikes + igTotalComments + igTotalSaves;
    const igEngagementRate = igTotalViews > 0 ? ((igTotalInteractions / igTotalViews) * 100) : 0;
    const igProfileViews = igMetrics.reduce((sum, m) => sum + m.profileViews, 0);
    const igFollowers = igMetrics.reduce((max, m) => Math.max(max, m.followers), 0);

    // Content stats
    const totalContent = await db.contentPiece.count();
    const publishedContent = await db.contentPiece.count({ where: { status: 'publicado' } });
    const pendingContent = await db.contentPiece.count({ where: { status: 'pendiente' } });
    const inProgressContent = await db.contentPiece.count({ where: { status: 'en_progreso' } });

    // KPI progress
    const kpis = await db.kPI.findMany();
    const kpisCompleted = kpis.filter(k => k.current >= k.target).length;

    // Events
    const events = await db.launchEvent.findMany({ orderBy: { eventDate: 'asc' } });
    const completedEvents = events.filter(e => e.completed).length;

    // Daily averages by day of week (TikTok)
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const ttByDay: Record<string, { total: number; count: number }> = {};
    const igByDay: Record<string, { total: number; count: number }> = {};

    for (const m of tiktokMetrics) {
      const day = dayNames[new Date(m.date + 'T00:00:00').getDay()];
      if (!ttByDay[day]) ttByDay[day] = { total: 0, count: 0 };
      ttByDay[day].total += m.views;
      ttByDay[day].count++;
    }

    for (const m of igMetrics) {
      const day = dayNames[new Date(m.date + 'T00:00:00').getDay()];
      if (!igByDay[day]) igByDay[day] = { total: 0, count: 0 };
      igByDay[day].total += m.views;
      igByDay[day].count++;
    }

    // Daily trend data
    const dailyTrend = tiktokMetrics.map((tt, i) => {
      const ig = igMetrics[i];
      return {
        date: tt.date,
        tiktok: tt.views,
        instagram: ig?.views ?? 0,
      };
    });

    return NextResponse.json({
      overview: {
        tiktok: {
          totalViews: ttTotalViews,
          totalLikes: ttTotalLikes,
          totalComments: ttTotalComments,
          totalShares: ttTotalShares,
          engagementRate: Math.round(ttEngagementRate * 100) / 100,
          profileViews: ttProfileViews,
          daysTracked: tiktokMetrics.length,
        },
        instagram: {
          totalViews: igTotalViews,
          totalLikes: igTotalLikes,
          totalComments: igTotalComments,
          totalSaves: igTotalSaves,
          engagementRate: Math.round(igEngagementRate * 100) / 100,
          profileViews: igProfileViews,
          followers: igFollowers,
          daysTracked: igMetrics.length,
        },
        combined: {
          totalViews: ttTotalViews + igTotalViews,
          totalInteractions: ttTotalInteractions + igTotalInteractions,
        },
      },
      content: {
        total: totalContent,
        published: publishedContent,
        pending: pendingContent,
        inProgress: inProgressContent,
      },
      kpis: {
        total: kpis.length,
        completed: kpisCompleted,
        items: kpis,
      },
      events: {
        total: events.length,
        completed: completedEvents,
        items: events,
      },
      dailyTrend,
      ttByDay: Object.fromEntries(
        Object.entries(ttByDay).map(([day, { total, count }]) => [day, Math.round(total / count)])
      ),
      igByDay: Object.fromEntries(
        Object.entries(igByDay).map(([day, { total, count }]) => [day, Math.round(total / count)])
      ),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}