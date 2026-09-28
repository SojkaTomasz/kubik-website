import type { ConsentCategories } from '@/lib/analytics/consent'

/**
 * Most między kategoriami banera a sygnałami Consent Mode v2 — Google nie rozumie
 * „marketingu", tylko siedem konkretnych sygnałów. JEDYNE miejsce z tym przekładem.
 */

export type ConsentValue = 'granted' | 'denied'

/** Sygnały zgody rozpoznawane przez Consent Mode v2. */
export interface GtagConsentState {
	ad_storage: ConsentValue
	ad_user_data: ConsentValue
	ad_personalization: ConsentValue
	analytics_storage: ConsentValue
	functionality_storage: ConsentValue
	personalization_storage: ConsentValue
	security_storage: ConsentValue
}

declare global {
	interface Window {
		dataLayer?: unknown[]
		/** Shim `gtag` definiowany przez skrypt startowy w `gtm.tsx`. */
		gtag?: (...args: unknown[]) => void
	}
}

function toValue(granted: boolean): ConsentValue {
	return granted ? 'granted' : 'denied'
}

/** `security_storage` zawsze `granted` — RODO klasyfikuje te mechanizmy jako niezbędne. */
export function toGtagConsent(categories: ConsentCategories): GtagConsentState {
	return {
		ad_storage: toValue(categories.marketing),
		ad_user_data: toValue(categories.marketing),
		ad_personalization: toValue(categories.marketing),
		analytics_storage: toValue(categories.analytics),
		functionality_storage: toValue(categories.preferences),
		personalization_storage: toValue(categories.preferences),
		security_storage: 'granted',
	}
}

/**
 * Aktualizacja zgody dla GTM-a. Bez skonfigurowanego GTM-a `window.gtag` nie
 * istnieje i wywołanie jest bezpiecznym no-opem. O tagach decyduje kontener.
 */
export function pushConsentUpdate(categories: ConsentCategories): void {
	if (typeof window === 'undefined') return

	window.gtag?.('consent', 'update', toGtagConsent(categories))
	window.dataLayer?.push({ event: 'consent_update' })
}
