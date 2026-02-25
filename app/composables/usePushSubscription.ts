
import { useRuntimeConfig } from '#imports'

export const usePushSubscription = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.api;
  const endpoint = `${apiBase}/push/push-subscription`;
  const endpointCheck = `${apiBase}/push/get-subscriptions`;

  const subscribe = async (token: string) => {
    if (!('serviceWorker' in navigator)) return { error: 'Service Worker no soportado' }
    if (!('PushManager' in window)) return { error: 'Push API no soportada' }

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
    const keys = subscription.toJSON().keys || {}
    try {
      const res = await fetch(endpoint, {
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
    } catch (e) {
      return { error: 'Error de conexión' }
    }
  }

  const unsubscribe = async (token: string) => {
    let subscriptionEndpoint = null
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        subscriptionEndpoint = subscription.endpoint
        await subscription.unsubscribe()
      }
    }
    
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ endpoint: subscriptionEndpoint })
      })
      if (!res.ok) return { error: 'Error eliminando suscripción en backend' }
      return { success: true }
    } catch (e) {
      return { error: 'Error de conexión' }
    }
  }

  const checkStatus = async (token: string) => {
    let subscriptionEndpoint = null
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        subscriptionEndpoint = subscription.endpoint
      }
    }

    // Si este navegador no tiene una suscripción, no puede estar registrado en el servidor.
    if (!subscriptionEndpoint) {
      return { hasSubscription: false }
    }

    try {
      // Usamos POST para enviar el endpoint en el body y comprobar una suscripción específica.
      // El backend puede diferenciar esta petición de una de creación
      // si solo recibe el 'endpoint' y no las 'keys'.
      const res = await fetch(endpointCheck, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ endpoint: subscriptionEndpoint })
      })
      if (res.ok) {
        const data = await res.json()
        return data // Espera una respuesta como { hasSubscription: true/false }
      }
      return { hasSubscription: false }
    } catch (e) {
      return { hasSubscription: false }
    }
  }

  return { subscribe, unsubscribe, checkStatus }
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
