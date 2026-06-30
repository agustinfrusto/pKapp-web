// Helper de analítica de eventos (Umami).
// No-op en nativo o si el script de Umami todavía no cargó (o está bloqueado).
export function track(event, data) {
  if (typeof window === 'undefined') return;
  const umami = window.umami;
  if (!umami || typeof umami.track !== 'function') return;
  try {
    umami.track(event, data);
  } catch {}
}
