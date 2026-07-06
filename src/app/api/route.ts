import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await db.dailyMetric.deleteMany();
    await db.contentPiece.deleteMany();
    await db.kPI.deleteMany();
    await db.launchEvent.deleteMany();

    const tiktokMetrics = [
      { date: "2025-06-04", views: 67, likes: 5, comments: 0, shares: 0 },
      { date: "2025-06-05", views: 83, likes: 6, comments: 1, shares: 0 },
      { date: "2025-06-06", views: 52, likes: 3, comments: 0, shares: 0 },
      { date: "2025-06-07", views: 134, likes: 9, comments: 1, shares: 1 },
      { date: "2025-06-08", views: 89, likes: 7, comments: 1, shares: 0 },
      { date: "2025-06-09", views: 45, likes: 3, comments: 0, shares: 0 },
      { date: "2025-06-10", views: 38, likes: 2, comments: 0, shares: 0 },
      { date: "2025-06-11", views: 76, likes: 5, comments: 1, shares: 0 },
      { date: "2025-06-12", views: 92, likes: 7, comments: 1, shares: 0 },
      { date: "2025-06-13", views: 118, likes: 8, comments: 2, shares: 0 },
      { date: "2025-06-14", views: 156, likes: 11, comments: 2, shares: 1 },
      { date: "2025-06-15", views: 352, likes: 25, comments: 4, shares: 0 },
      { date: "2025-06-16", views: 145, likes: 10, comments: 1, shares: 0 },
      { date: "2025-06-17", views: 98, likes: 7, comments: 1, shares: 0 },
      { date: "2025-06-18", views: 41, likes: 3, comments: 0, shares: 0 },
      { date: "2025-06-19", views: 55, likes: 4, comments: 1, shares: 0 },
      { date: "2025-06-20", views: 88, likes: 6, comments: 1, shares: 0 },
      { date: "2025-06-21", views: 354, likes: 24, comments: 3, shares: 0 },
      { date: "2025-06-22", views: 167, likes: 12, comments: 1, shares: 0 },
      { date: "2025-06-23", views: 73, likes: 5, comments: 1, shares: 0 },
      { date: "2025-06-24", views: 59, likes: 4, comments: 0, shares: 0 },
      { date: "2025-06-25", views: 124, likes: 9, comments: 2, shares: 0 },
      { date: "2025-06-26", views: 87, likes: 6, comments: 1, shares: 0 },
      { date: "2025-06-27", views: 112, likes: 8, comments: 1, shares: 0 },
      { date: "2025-06-28", views: 145, likes: 10, comments: 1, shares: 0 },
      { date: "2025-06-29", views: 520, likes: 36, comments: 5, shares: 1 },
      { date: "2025-06-30", views: 198, likes: 14, comments: 2, shares: 0 },
      { date: "2025-07-01", views: 579, likes: 41, comments: 11, shares: 0 },
    ];
    const igMetrics = [
      { date: "2025-06-04", views: 180, likes: 12, comments: 3, saves: 8, profileViews: 15 },
      { date: "2025-06-05", views: 210, likes: 15, comments: 4, saves: 10, profileViews: 18 },
      { date: "2025-06-06", views: 165, likes: 11, comments: 2, saves: 7, profileViews: 12 },
      { date: "2025-06-07", views: 340, likes: 24, comments: 6, saves: 15, profileViews: 28 },
      { date: "2025-06-08", views: 290, likes: 20, comments: 5, saves: 13, profileViews: 22 },
      { date: "2025-06-09", views: 150, likes: 10, comments: 3, saves: 6, profileViews: 10 },
      { date: "2025-06-10", views: 130, likes: 9, comments: 2, saves: 5, profileViews: 9 },
      { date: "2025-06-11", views: 195, likes: 14, comments: 4, saves: 9, profileViews: 14 },
      { date: "2025-06-12", views: 240, likes: 17, comments: 5, saves: 11, profileViews: 17 },
      { date: "2025-06-13", views: 280, likes: 19, comments: 5, saves: 12, profileViews: 20 },
      { date: "2025-06-14", views: 350, likes: 25, comments: 7, saves: 16, profileViews: 25 },
      { date: "2025-06-15", views: 420, likes: 30, comments: 8, saves: 19, profileViews: 30 },
      { date: "2025-06-16", views: 310, likes: 22, comments: 6, saves: 14, profileViews: 22 },
      { date: "2025-06-17", views: 200, likes: 14, comments: 4, saves: 9, profileViews: 15 },
      { date: "2025-06-18", views: 140, likes: 10, comments: 3, saves: 6, profileViews: 10 },
      { date: "2025-06-19", views: 175, likes: 12, comments: 3, saves: 8, profileViews: 13 },
      { date: "2025-06-20", views: 260, likes: 18, comments: 5, saves: 11, profileViews: 18 },
      { date: "2025-06-21", views: 390, likes: 27, comments: 7, saves: 17, profileViews: 28 },
      { date: "2025-06-22", views: 330, likes: 23, comments: 6, saves: 15, profileViews: 24 },
      { date: "2025-06-23", views: 185, likes: 13, comments: 3, saves: 8, profileViews: 14 },
      { date: "2025-06-24", views: 155, likes: 11, comments: 3, saves: 7, profileViews: 11 },
      { date: "2025-06-25", views: 520, likes: 36, comments: 10, saves: 22, profileViews: 35 },
      { date: "2025-06-26", views: 300, likes: 21, comments: 6, saves: 13, profileViews: 22 },
      { date: "2025-06-27", views: 245, likes: 17, comments: 5, saves: 11, profileViews: 18 },
      { date: "2025-06-28", views: 380, likes: 27, comments: 7, saves: 16, profileViews: 27 },
      { date: "2025-06-29", views: 480, likes: 34, comments: 9, saves: 21, profileViews: 33 },
      { date: "2025-06-30", views: 420, likes: 29, comments: 8, saves: 18, profileViews: 30 },
      { date: "2025-07-01", views: 312, likes: 22, comments: 6, saves: 13, profileViews: 22 },
    ];

    for (const m of tiktokMetrics) {
      await db.dailyMetric.create({ data: { platform: "tiktok", ...m } });
    }
    for (const m of igMetrics) {
      await db.dailyMetric.create({ data: { platform: "instagram", ...m } });
    }

    const kpis = [
      { name: "Views Totales TikTok", description: "Visualizaciones acumuladas TikTok pre-lanzamiento", platform: "tiktok", target: 10000, current: 3283, unit: "views", category: "alcance" },
      { name: "Views Totales Instagram", description: "Visualizaciones acumuladas Instagram pre-lanzamiento", platform: "instagram", target: 15000, current: 7587, unit: "views", category: "alcance" },
      { name: "Engagement Rate TikTok", description: "Tasa de engagement promedio TikTok", platform: "tiktok", target: 10, current: 8.16, unit: "%", category: "engagement" },
      { name: "Engagement Rate Instagram", description: "Tasa de engagement promedio Instagram", platform: "instagram", target: 25, current: 22.86, unit: "%", category: "engagement" },
      { name: "Shares TikTok", description: "Total de compartidos en TikTok", platform: "tiktok", target: 50, current: 3, unit: "shares", category: "engagement" },
      { name: "Clics en Bio Instagram", description: "Clics al enlace en bio de Instagram", platform: "instagram", target: 100, current: 2, unit: "clics", category: "conversion" },
      { name: "Seguidores Instagram", description: "Crecimiento de seguidores en Instagram", platform: "instagram", target: 1500, current: 860, unit: "seguidores", category: "conversion" },
      { name: "Pre-saves Spotify", description: "Pre-saves acumulados en Spotify", platform: null, target: 500, current: 0, unit: "pre-saves", category: "streaming" },
      { name: "Reproducciones Día 1", description: "Streams totales el primer día del lanzamiento", platform: null, target: 1000, current: 0, unit: "streams", category: "streaming" },
      { name: "Playlists Editoriales", description: "Inclusiones en playlists editoriales de Spotify", platform: null, target: 5, current: 0, unit: "playlists", category: "streaming" },
    ];
    for (const kpi of kpis) {
      await db.kPI.create({ data: kpi });
    }

    const contentPieces = [
      { title: "Teaser #1: Silueta en sombras", description: "Video corto con silueta bailando Bachata, audio del coro susurrado. Sin revelar nombre.", platform: "ambas", contentType: "teaser", status: "pendiente", scheduledDate: "2025-07-08" },
      { title: "Story: Detrás de la letra", description: "Serie de stories contando la historia detrás de Mal Deseo.", platform: "instagram", contentType: "story", status: "pendiente", scheduledDate: "2025-07-09" },
      { title: "Snippet #1: Coro a cappella", description: "Fragmento de 15s del coro cantado a cappella.", platform: "tiktok", contentType: "snippet", status: "pendiente", scheduledDate: "2025-07-10" },
      { title: "Reel: 3 datos sobre Bachata moderna", description: "Reel educativo sobre la evolución de la bachata.", platform: "instagram", contentType: "reel", status: "pendiente", scheduledDate: "2025-07-11" },
      { title: "TikTok: Ensayo detrás de escena", description: "Video vertical del proceso de ensayo.", platform: "tiktok", contentType: "behind_scenes", status: "pendiente", scheduledDate: "2025-07-12" },
      { title: "Teaser #2: Fragmento del verso", description: "Clip de 10s con el verso más fuerte.", platform: "ambas", contentType: "teaser", status: "pendiente", scheduledDate: "2025-07-15" },
      { title: "Lyric Video (Preview)", description: "Video con la letra animada del primer verso y coro.", platform: "ambas", contentType: "lyric_video", status: "pendiente", scheduledDate: "2025-07-16" },
      { title: "Story: Cuenta regresiva 2 semanas", description: "Story interactiva con encuesta.", platform: "instagram", contentType: "story", status: "pendiente", scheduledDate: "2025-07-17" },
      { title: "TikTok: Dueto/Tendencia Bachata", description: "Usar un sonido trending de bachata.", platform: "tiktok", contentType: "reel", status: "pendiente", scheduledDate: "2025-07-18" },
      { title: "Reel: La historia del deseo", description: "Reel narrativo con la temática de la canción.", platform: "instagram", contentType: "reel", status: "pendiente", scheduledDate: "2025-07-19" },
      { title: "Teaser #3: Coro completo", description: "El coro entero con visual impactante.", platform: "ambas", contentType: "teaser", status: "pendiente", scheduledDate: "2025-07-22" },
      { title: "Lyric Video Oficial", description: "Video lyric completo con animación profesional.", platform: "ambas", contentType: "lyric_video", status: "pendiente", scheduledDate: "2025-07-23" },
      { title: "Story: Cover art reveal", description: "Revelación de la portada del single.", platform: "instagram", contentType: "story", status: "pendiente", scheduledDate: "2025-07-24" },
      { title: "TikTok: Reto #MalDeseo", description: "Crear un reto de baile con un fragmento de la canción.", platform: "tiktok", contentType: "snippet", status: "pendiente", scheduledDate: "2025-07-25" },
      { title: "Reel: Mensaje personal de Kevin", description: "Video hablado de Kevin contando por qué escribió Mal Deseo.", platform: "instagram", contentType: "reel", status: "pendiente", scheduledDate: "2025-07-26" },
      { title: "Teaser #4: Cuenta regresiva", description: "Video con cuenta regresiva visual.", platform: "ambas", contentType: "teaser", status: "pendiente", scheduledDate: "2025-07-29" },
      { title: "Story: Recordatorio pre-save", description: "Story directa: 'Faltan 5 días. Pre-save ahora.'", platform: "instagram", contentType: "story", status: "pendiente", scheduledDate: "2025-07-30" },
      { title: "TikTok: Último ensayo", description: "Behind the scenes del último día de producción.", platform: "tiktok", contentType: "behind_scenes", status: "pendiente", scheduledDate: "2025-07-31" },
      { title: "Reel: Todo lo que necesitas saber", description: "Resumen visual: nombre, fecha, plataformas.", platform: "ambas", contentType: "reel", status: "pendiente", scheduledDate: "2025-08-01" },
      { title: "Story: Mañana es el día", description: "Story de anticipación: 'Mañana Mal Deseo llega a todas las plataformas.'", platform: "instagram", contentType: "story", status: "pendiente", scheduledDate: "2025-08-03" },
    ];
    for (const cp of contentPieces) {
      await db.contentPiece.create({ data: cp });
    }

    const milestones = [
      { title: "Inicio pre-lanzamiento", description: "Comienza la campaña de contenido previo al lanzamiento", eventType: "prelanzamiento", eventDate: "2025-07-07" },
      { title: "Envío pitches a playlists", description: "Enviar propuesta a curadores de Spotify y playlists editoriales", eventType: "prelanzamiento", eventDate: "2025-07-14" },
      { title: "Revelación de cover art", description: "Publicar oficialmente la portada del single", eventType: "prelanzamiento", eventDate: "2025-07-24" },
      { title: "Activación reto #MalDeseo", description: "Lanzar el reto de baile en TikTok", eventType: "prelanzamiento", eventDate: "2025-07-25" },
      { title: "LANZAMIENTO: Mal Deseo", description: "Mal Deseo disponible en todas las plataformas de streaming", eventType: "lanzamiento", eventDate: "2025-08-04" },
      { title: "Spotify Release Radar", description: "Verificar inclusión en Release Radar", eventType: "lanzamiento", eventDate: "2025-08-04" },
      { title: "Push stories primer día", description: "Publicar 5-8 stories el día del lanzamiento", eventType: "lanzamiento", eventDate: "2025-08-04" },
      { title: "Reel semana 1 post-lanzamiento", description: "Contenido de celebración + thank you a la comunidad", eventType: "postlanzamiento", eventDate: "2025-08-08" },
      { title: "Check métricas semana 1", description: "Evaluar streams, saves, y playlist placements", eventType: "postlanzamiento", eventDate: "2025-08-11" },
      { title: "Segundo push de contenido", description: "Nueva ola de contenido si las métricas lo permiten", eventType: "postlanzamiento", eventDate: "2025-08-15" },
    ];
    for (const m of milestones) {
      await db.launchEvent.create({ data: m });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}