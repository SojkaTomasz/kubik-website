import { Analytics } from '@vercel/analytics/next'

import { env } from '@/env'

/**
 * Analityka Vercela — montowana wyłącznie przy włączonej fladze.
 *
 * Warstwa osobna od GTM-a: nie zakłada cookies ani identyfikatorów
 * międzywitrynowych, więc nie przechodzi przez baner zgód — decyzją jest sama
 * flaga. Jeśli Twój projekt wymaga zgody także na nią, opakuj to
 * w `useCookieConsent`.
 */
export function VercelAnalytics() {
	if (!env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS) return null

	return <Analytics />
}
