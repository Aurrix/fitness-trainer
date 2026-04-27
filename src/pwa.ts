const serviceWorkerUrl = `${import.meta.env.BASE_URL}sw.js`
const serviceWorkerScope = import.meta.env.BASE_URL
const updateCheckThrottleMs = 60_000

let registration: ServiceWorkerRegistration | undefined
let lastUpdateCheck = 0
let hadControllerOnLoad = false
let isReloading = false

async function checkForUpdates(force = false) {
  if (!registration || registration.installing) {
    return
  }

  if (!force && Date.now() - lastUpdateCheck < updateCheckThrottleMs) {
    return
  }

  if (!navigator.onLine) {
    return
  }

  lastUpdateCheck = Date.now()

  try {
    // Bypass the HTTP cache so opening the app checks the latest worker script.
    const response = await fetch(serviceWorkerUrl, {
      cache: 'no-store',
      headers: {
        cache: 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (response.ok) {
      await registration.update()
    }
  } catch {
    // Ignore transient network failures during background update checks.
  }
}

export async function registerPWA() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  hadControllerOnLoad = Boolean(navigator.serviceWorker.controller)

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadControllerOnLoad || isReloading) {
      hadControllerOnLoad = true
      return
    }

    isReloading = true
    window.location.reload()
  })

  try {
    registration = await navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: serviceWorkerScope,
    })

    await checkForUpdates(true)

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates()
      }
    })
  } catch (error) {
    console.error('Service worker registration failed.', error)
  }
}
