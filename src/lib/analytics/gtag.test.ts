import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_CONSENT, FULL_CONSENT } from '@/lib/analytics/consent'
import { pushConsentUpdate, toGtagConsent } from '@/lib/analytics/gtag'

/**
 * Przekład kategorii banera na sygnały Google Consent Mode v2.
 *
 * To jedyne miejsce, w którym „marketing" staje się `ad_storage`,
 * `ad_user_data` i `ad_personalization`. Pomyłka w tym mapowaniu oznacza
 * wysłanie do Google zgody, której użytkownik nie udzielił — i nie widać jej
 * nigdzie w interfejsie, bo baner nadal wygląda poprawnie.
 */

const ALL_SIGNALS = [
	'ad_storage',
	'ad_user_data',
	'ad_personalization',
	'analytics_storage',
	'functionality_storage',
	'personalization_storage',
	'security_storage',
] as const

describe('toGtagConsent', () => {
	it('zwraca komplet siedmiu sygnałów Consent Mode v2', () => {
		// Brakujący sygnał Google interpretuje własnym domyślnym ustawieniem,
		// a nie jako odmowę.
		expect(Object.keys(toGtagConsent(DEFAULT_CONSENT)).sort()).toEqual([...ALL_SIGNALS].sort())
	})

	it('przy braku zgód odmawia wszystkiego poza bezpieczeństwem', () => {
		expect(toGtagConsent(DEFAULT_CONSENT)).toEqual({
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			analytics_storage: 'denied',
			functionality_storage: 'denied',
			personalization_storage: 'denied',
			// security_storage obejmuje ochronę przed nadużyciami i uwierzytelnianie
			// — mechanizmy działające w interesie użytkownika, które RODO
			// klasyfikuje jako niezbędne.
			security_storage: 'granted',
		})
	})

	it('przy pełnej zgodzie przyznaje wszystko', () => {
		const consent = toGtagConsent(FULL_CONSENT)

		for (const signal of ALL_SIGNALS) {
			expect(consent[signal]).toBe('granted')
		}
	})

	it('kategoria marketing steruje wyłącznie trzema sygnałami reklamowymi', () => {
		const consent = toGtagConsent({ ...DEFAULT_CONSENT, marketing: true })

		expect(consent).toMatchObject({
			ad_storage: 'granted',
			ad_user_data: 'granted',
			ad_personalization: 'granted',
			analytics_storage: 'denied',
			functionality_storage: 'denied',
			personalization_storage: 'denied',
		})
	})

	it('kategoria analytics nie odblokowuje sygnałów reklamowych', () => {
		// Najgroźniejsza pomyłka w tej warstwie: użytkownik zgadza się na
		// statystyki, a dostaje śledzenie reklamowe.
		const consent = toGtagConsent({ ...DEFAULT_CONSENT, analytics: true })

		expect(consent.analytics_storage).toBe('granted')
		expect(consent.ad_storage).toBe('denied')
		expect(consent.ad_user_data).toBe('denied')
		expect(consent.ad_personalization).toBe('denied')
	})

	it('kategoria preferences steruje funkcjonalnością i personalizacją', () => {
		const consent = toGtagConsent({ ...DEFAULT_CONSENT, preferences: true })

		expect(consent).toMatchObject({
			functionality_storage: 'granted',
			personalization_storage: 'granted',
			analytics_storage: 'denied',
			ad_storage: 'denied',
		})
	})
})

describe('pushConsentUpdate', () => {
	it('nie wywraca się, gdy GTM nie jest skonfigurowany', () => {
		// Bez NEXT_PUBLIC_GTM_ID skrypt startowy się nie renderuje, więc
		// window.gtag nie istnieje. Baner musi wtedy działać normalnie.
		delete window.gtag
		delete window.dataLayer

		expect(() => pushConsentUpdate(FULL_CONSENT)).not.toThrow()
	})

	it('wysyła aktualizację przez shim gtag ze skryptu startowego', () => {
		const gtag = vi.fn()
		window.gtag = gtag
		window.dataLayer = []

		pushConsentUpdate({ ...DEFAULT_CONSENT, analytics: true })

		expect(gtag).toHaveBeenCalledWith('consent', 'update', {
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			analytics_storage: 'granted',
			functionality_storage: 'denied',
			personalization_storage: 'denied',
			security_storage: 'granted',
		})
	})

	it('dokłada zdarzenie do dataLayer, żeby dało się na nim oprzeć wyzwalacz', () => {
		window.gtag = vi.fn()
		window.dataLayer = []

		pushConsentUpdate(FULL_CONSENT)

		expect(window.dataLayer).toContainEqual({ event: 'consent_update' })
	})
})
