// Universeller Service Worker für Web-Push-Benachrichtigungen
const DEFAULT_ICON = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%231a1a1a"/><text x="50" y="70" font-size="60" text-anchor="middle">⚽</text></svg>';

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
    let data = {
        title: '⚽ Fussball-Alarm',
        body: 'Es gibt ein neues Update!',
        icon: DEFAULT_ICON,
        tag: 'push-' + Date.now(),
        url: './'
    };

    if (event.data) {
        try {
            const parsed = event.data.json();
            data = { ...data, ...parsed };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const resolvedIcon = data.icon || DEFAULT_ICON;
    const resolvedBadge = data.badge || (resolvedIcon.startsWith('data:image/svg+xml') ? undefined : resolvedIcon);
    const resolvedTag = data.tag || ('push-' + Date.now());

    const options = {
        body: data.body,
        icon: resolvedIcon,
        tag: resolvedTag,
        vibrate: [200, 100, 200],
        data: {
            url: data.url || './'
        }
    };

    if (data.tag) {
        options.renotify = true;
    }

    if (resolvedBadge) {
        options.badge = resolvedBadge;
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || './';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
