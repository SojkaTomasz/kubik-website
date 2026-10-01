/** Zgody na cookies. Celowo bez Reacta — ten sam kod czyta zgodę w komponencie,
 * w teście i w skrypcie startowym GTM-a. */

/** Podbij przy rozszerzeniu zakresu danych — starsze zgody przestaną obowiązywać. */
export const CONSENT_VERSION = 1

export const CONSENT_STORAGE_KEY = 'cookie-consent'

/**
 * „Decyzja jeszcze nie zapadła". Klasa jest w HTML-u z serwera OD RAZU, a skrypt
 * startowy ją ZDEJMUJE — odwrotnie niż podpowiada intuicja i o to chodzi: awaria
 * skryptu ma zostawić pytanie zadane, nie schowane. Reguły: `app/theme/consent.css`.
 */
export const CONSENT_PENDING_CLASS = 'consent-pending'

/**
 * Zdejmuje `consent-pending`, gdy zapisana zgoda jest ważna. Musi wykonać się
 * synchronicznie w `<head>`, inaczej baner mignie powracającemu użytkownikowi.
 *
 * Ta sama funkcja wykonuje się ponownie z `DocumentStateSync`, gdy React
 * zamontuje `<html>` od nowa (zmiana języka) — wtedy skrypt już nie ruszy.
 *
 * Warunki ważności są POWTÓRZONE z `readStoredConsent` — skrypt nie ma jak
 * zaimportować modułu. Rozjazd łamie się cicho, pilnuje go `consent.test.ts`.
 */
export function clearConsentPending(storageKey: string, version: number, className: string) {
	try {
		const raw = window.localStorage.getItem(storageKey)
		if (!raw) return

		const value: Record<string, unknown> = JSON.parse(raw)

		if (typeof value !== 'object' || value === null) return
		if (value.version !== version) return
		if (
			typeof value.analytics !== 'boolean' ||
			typeof value.marketing !== 'boolean' ||
			typeof value.preferences !== 'boolean'
		) {
			return
		}

		document.documentElement.classList.remove(className)
	} catch {
		// Klasa zostaje, więc baner się pokaże. Bezpieczny kierunek pomyłki.
	}
}

export const consentPendingScript = `(${clearConsentPending.toString()})(${JSON.stringify(
	CONSENT_STORAGE_KEY
)},${CONSENT_VERSION},${JSON.stringify(CONSENT_PENDING_CLASS)})`

/** Znosi `consent-pending` po decyzji — inaczej klasa wisi do przeładowania. */
export function markConsentDecided(): void {
	if (typeof document === 'undefined') return
	document.documentElement.classList.remove(CONSENT_PENDING_CLASS)
}

/** Zdarzenie DOM otwierające ustawienia — pozwala wywołać dialog ze stopki. */
export const CONSENT_OPEN_EVENT = 'cookie-consent:open'

/** Kategorie, którymi steruje użytkownik. `necessary` jest zawsze włączone. */
export interface ConsentCategories {
	/** Sesja, bezpieczeństwo, zapamiętanie samej zgody. Nie podlega wyłączeniu. */
	necessary: true
	analytics: boolean
	marketing: boolean
	preferences: boolean
}

export interface StoredConsent extends ConsentCategories {
	version: number
	/** ISO 8601 — dowód, kiedy zgoda została udzielona. */
	timestamp: string
}

/** Stan startowy: wszystko poza niezbędnym wyłączone. */
export const DEFAULT_CONSENT: ConsentCategories = {
	necessary: true,
	analytics: false,
	marketing: false,
	preferences: false,
}

export const FULL_CONSENT: ConsentCategories = {
	necessary: true,
	analytics: true,
	marketing: true,
	preferences: true,
}

function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

/** `null` także dla danych uszkodzonych i starszej wersji — brak wiarygodnej zgody to brak zgody. */
export function readStoredConsent(): StoredConsent | null {
	if (!isBrowser()) return null

	try {
		const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
		if (!raw) return null

		const parsed: unknown = JSON.parse(raw)
		if (typeof parsed !== 'object' || parsed === null) return null

		const value = parsed as Partial<StoredConsent>

		if (value.version !== CONSENT_VERSION) return null
		if (
			typeof value.analytics !== 'boolean' ||
			typeof value.marketing !== 'boolean' ||
			typeof value.preferences !== 'boolean'
		) {
			return null
		}

		return {
			version: CONSENT_VERSION,
			timestamp:
				typeof value.timestamp === 'string' ? value.timestamp : new Date().toISOString(),
			necessary: true,
			analytics: value.analytics,
			marketing: value.marketing,
			preferences: value.preferences,
		}
	} catch {
		return null
	}
}

/** Zapisuje zgodę i zwraca zapisany obiekt. Zapis może się nie udać — to nie błąd krytyczny. */
export function storeConsent(categories: ConsentCategories): StoredConsent {
	const record: StoredConsent = {
		...categories,
		necessary: true,
		version: CONSENT_VERSION,
		timestamp: new Date().toISOString(),
	}

	if (isBrowser()) {
		try {
			window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record))
		} catch {
			// Tryb prywatny lub wyczerpany limit — zgoda obowiązuje do końca sesji.
		}
	}

	return record
}

/** Kasuje zapisaną zgodę. Przydatne w testach i w przycisku „wycofaj zgodę". */
export function clearStoredConsent(): void {
	if (!isBrowser()) return

	try {
		window.localStorage.removeItem(CONSENT_STORAGE_KEY)
	} catch {
		// Brak dostępu do storage i tak oznacza brak zapisanej zgody.
	}

	// Klasa musi wrócić razem z brakiem zgody — inaczej CSS zostawi baner ukryty.
	document.documentElement.classList.add(CONSENT_PENDING_CLASS)
}

/** Otwiera dialog ustawień z dowolnego miejsca w aplikacji (np. z linku w stopce). */
export function openConsentSettings(): void {
	if (typeof window === 'undefined') return
	window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))
}
