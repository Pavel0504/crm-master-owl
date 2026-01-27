const CACHE_NAME = 'master-owl-v1';
const RUNTIME_CACHE = 'master-owl-runtime';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({ error: 'Нет подключения к интернету' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'add-to-purchase') {
    event.waitUntil(
      handleAddToPurchase(data)
        .then(() => {
          return clients.matchAll({ type: 'window', includeUncontrolled: true });
        })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(self.registration.scope) && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/purchases');
          }
        })
    );
  } else if (action === 'archive-material') {
    event.waitUntil(
      handleArchiveMaterial(data)
        .then(() => {
          return self.registration.showNotification('Материал в архиве', {
            body: `${data.materialName} помещен в архив`,
            icon: '/icons/icon-192x192.svg',
            tag: 'archive-success',
          });
        })
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed', event.notification.tag);
});

async function handleAddToPurchase(data) {
  try {
    const supabaseUrl = await getSupabaseUrl();
    const supabaseKey = await getSupabaseAnonKey();

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not found');
      return;
    }

    const { materialId, materialName } = data;

    const materialResponse = await fetch(
      `${supabaseUrl}/rest/v1/materials?id=eq.${materialId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const materials = await materialResponse.json();
    if (!materials || materials.length === 0) {
      console.error('Material not found');
      return;
    }

    const material = materials[0];
    const quantityToBuy = material.initial_volume - material.remaining_volume;
    const pricePerUnit = material.purchase_price / material.initial_volume;
    const totalAmount = quantityToBuy * pricePerUnit;

    const existingPurchaseResponse = await fetch(
      `${supabaseUrl}/rest/v1/purchase_plans?material_id=eq.${materialId}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const existingPurchases = await existingPurchaseResponse.json();
    if (existingPurchases && existingPurchases.length > 0) {
      console.log('Purchase plan already exists for this material');
      return;
    }

    const createResponse = await fetch(`${supabaseUrl}/rest/v1/purchase_plans`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: material.user_id,
        name: materialName,
        quantity: quantityToBuy,
        amount: totalAmount,
        delivery_method: '',
        notes: 'Создано из уведомления о низком остатке',
        material_id: materialId,
      }),
    });

    if (createResponse.ok) {
      console.log('Purchase plan created successfully');
    } else {
      console.error('Failed to create purchase plan');
    }
  } catch (error) {
    console.error('Error in handleAddToPurchase:', error);
  }
}

async function handleArchiveMaterial(data) {
  try {
    const supabaseUrl = await getSupabaseUrl();
    const supabaseKey = await getSupabaseAnonKey();

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not found');
      return;
    }

    const { materialId } = data;

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/materials?id=eq.${materialId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archived: true,
        }),
      }
    );

    if (updateResponse.ok) {
      console.log('Material archived successfully');
    } else {
      console.error('Failed to archive material');
    }
  } catch (error) {
    console.error('Error in handleArchiveMaterial:', error);
  }
}

async function getSupabaseUrl() {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length > 0) {
    const messageChannel = new MessageChannel();
    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      clients[0].postMessage({ type: 'GET_SUPABASE_URL' }, [messageChannel.port2]);
    });
  }
  return null;
}

async function getSupabaseAnonKey() {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length > 0) {
    const messageChannel = new MessageChannel();
    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      clients[0].postMessage({ type: 'GET_SUPABASE_ANON_KEY' }, [messageChannel.port2]);
    });
  }
  return null;
}
