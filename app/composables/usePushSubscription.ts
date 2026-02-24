
import { useRuntimeConfig } from '#imports'
export async function usePushSubscription(token: string) {
  if (!('serviceWorker' in navigator)) return { error: 'Service Worker no soportado' }
  if (!('PushManager' in window)) return { error: 'Push API no soportada' }

  const config = useRuntimeConfig();
  const VAPID_PUBLIC_KEY = config.public.vapidKey;
  if (!VAPID_PUBLIC_KEY) return { error: 'No se ha configurado la clave pública VAPID' };

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
    } catch (err) {
      return { error: 'No se pudo suscribir al push: ' + err }
    }
  }

  // Enviar la suscripción al backend
  const apiUrl = config.public.api + '/push/push-subscription'
  const keys = subscription.toJSON().keys || {}
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys_auth: keys.auth,
      keys_p256dh: keys.p256dh
    })
  })
  if (!res.ok) {
    return { error: 'Error enviando la suscripción al backend' }
  }
  return { subscription }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
