'use client'

import { useCallback, useSyncExternalStore } from 'react'

import {
	type ConsentCategories,
	DEFAULT_CONSENT,
	readStoredConsent,
	storeConsent,
	type StoredConsent,
} from '@/lib/analytics/consent'
import { pushConsentUpdate } from '@/lib/analytics/gtag'

/**
 * Zgoda jako store poza Reactem. `useState + useEffect` dawałoby jedną klatkę
 * ze złym stanem — przełączniki otwierałyby się na wartościach domyślnych.
 *
 * Hook NIE decyduje o widoczności banera; to rozstrzyga CSS przed hydracją.
 */

type Listener = () => void

const listeners = new Set<Listener>()

/** `getSnapshot` musi zwracać tę samą referencję, inaczej React wpada w pętlę renderów. */
let snapshot: StoredConsent | null | undefined

function notifyAll(): void {
	for (const notify of listeners) notify()
}

function subscribe(listener: Listener): () => void {
	listeners.add(listener)

	// Zmiana w innej karcie tej samej domeny — zgoda ma obowiązywać wszędzie.
	const onStorage = () => {
		snapshot = readStoredConsent()
		notifyAll()
	}

	window.addEventListener('storage', onStorage)

	return () => {
		listeners.delete(listener)
		window.removeEventListener('storage', onStorage)
	}
}

function getSnapshot(): StoredConsent | null {
	if (snapshot === undefined) {
		snapshot = readStoredConsent()
	}
	return snapshot
}

/**
 * Serwer udaje „brak decyzji". Rozbieżność jest wbudowana w kontrakt
 * `useSyncExternalStore`, ale NIE MOŻE decydować o kształcie drzewa.
 */
function getServerSnapshot(): StoredConsent | null {
	return null
}

export interface UseCookieConsent {
	/** Zapisana decyzja albo `null`, gdy użytkownik jeszcze nie odpowiedział. */
	consent: StoredConsent | null
	/** Aktualne kategorie: zapisane albo domyślne (wszystko poza niezbędnym wyłączone). */
	categories: ConsentCategories
	/** Zapisuje decyzję i natychmiast informuje GTM. */
	save: (categories: ConsentCategories) => void
}

export function useCookieConsent(): UseCookieConsent {
	const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

	const save = useCallback((categories: ConsentCategories) => {
		snapshot = storeConsent(categories)
		pushConsentUpdate(categories)
		notifyAll()
	}, [])

	return {
		consent,
		categories: consent ?? DEFAULT_CONSENT,
		save,
	}
}
