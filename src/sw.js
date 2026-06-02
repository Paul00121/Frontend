// Service Worker para notificaciones Push.
// Se ejecuta en segundo plano incluso cuando la pestaña del navegador está cerrada.
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { titulo: 'StudySync', cuerpo: '' };

  event.waitUntil(
    self.registration.showNotification(data.titulo, {
      body: data.cuerpo,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    })
  );
});
