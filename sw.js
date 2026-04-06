// Service Worker cho Push Notification
const CACHE_NAME = 'ai-tech-hub-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Lắng nghe message từ main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon, data } = event.data.payload;
        self.registration.showNotification(title, {
            body: body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: data?.id || 'default',
            requireInteraction: true,
            data: data
        });
    }
});

// Xử lý khi user click vào notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const notificationData = event.notification.data;
    const urlToOpen = notificationData?.link || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Nếu đã có window mở, focus vào đó
            for (let client of windowClients) {
                if (client.url.includes(self.location.hostname) && 'focus' in client) {
                    client.postMessage({
                        type: 'NOTIFICATION_CLICKED',
                        data: notificationData
                    });
                    return client.focus();
                }
            }
            // Nếu chưa có window nào mở, mở mới
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
