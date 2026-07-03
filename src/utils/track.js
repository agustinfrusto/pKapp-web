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

// Registra un pageview sintético por pantalla (para bounce real + embudo).
// La carga inicial ya la trackea Umami solo; esto cubre los cambios de pantalla.
export function trackPageview(screen) {
  if (typeof window === 'undefined') return;
  const umami = window.umami;
  if (!umami || typeof umami.track !== 'function') return;
  try {
    const url = '/' + String(screen).toLowerCase();
    umami.track((props) => ({ ...props, url, title: screen }));
  } catch {}
}
