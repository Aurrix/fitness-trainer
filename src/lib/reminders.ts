import {
  evaluateSuggestionRules,
  loadSuggestionRuleset,
  type SuggestionEngineParams,
} from './suggestions'

async function showNotification(title: string, body: string, tag: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()

    if (registration) {
      await registration.showNotification(title, {
        body,
        badge: `${import.meta.env.BASE_URL}pwa-192x192.png`,
        icon: `${import.meta.env.BASE_URL}pwa-192x192.png`,
        tag,
      })
      return true
    }
  }

  new Notification(title, { body, tag })
  return true
}

export async function maybeSendReminder(params: SuggestionEngineParams) {
  const finding = evaluateSuggestionRules(loadSuggestionRuleset('reminders'), params)[0] ?? null

  if (!finding) {
    return { delivered: false, finding: null as typeof finding }
  }

  const delivered = await showNotification('Time for a body check-in', finding.summary, finding.id)

  return {
    delivered,
    finding,
  }
}
