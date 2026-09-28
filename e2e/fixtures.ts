import { expect, test as base } from '@playwright/test'

/**
 * Wspólne wyposażenie testów e2e.
 *
 * Najważniejsza jest automatyczna kontrola konsoli: oba błędy, które w tym
 * projekcie wyszły dopiero w przeglądarce, były widoczne WYŁĄCZNIE w konsoli —
 * nic się nie wywracało i nic nie wyglądało źle.
 */

/** Komunikaty spoza naszego kodu, na które nie mamy wpływu. */
const IGNORED_PATTERNS = [
	/chrome-extension:/,
	/Download the React DevTools/,
	/\[Fast Refresh\]/,
	/\[HMR\]/,

	// Ostrzeżenie React 19 tylko w trybie dev, o każdym <script> w drzewie.
	// Nasze trzy skrypty muszą tam być (motyw, zgoda, JSON-LD) i wykonały się
	// już z HTML-a serwera. Bez tego wpisu przebieg E2E_DEV=1 pada na nim
	// zamiast łapać wszystkie POZOSTAŁE ostrzeżenia deweloperskie.
	/Encountered a script tag while rendering React component/,

	// `motion` wypisuje to, gdy widzi ograniczenie ruchu — czyli w testach,
	// które to ustawienie EMULUJĄ. Komunikat jest pożądany, nie usterką.
	/You have Reduced Motion enabled on your device/,
]

function isRelevant(text: string): boolean {
	return !IGNORED_PATTERNS.some(pattern => pattern.test(text))
}

interface Fixtures {
	/** Komunikaty z konsoli. Sprawdzane automatycznie, rzadko trzeba po nie sięgać. */
	consoleMessages: string[]

	/**
	 * Zapisuje zgodę w localStorage, zanim strona się załaduje. Domyślnie WŁĄCZONE.
	 *
	 * Baner zgody jest modalem blokującym, więc test, który go nie odklika, nie
	 * doklika się do niczego innego. Testy oglądające baner wyłączają to u siebie:
	 * `test.use({ consentSeeded: false })`.
	 */
	consentSeeded: boolean
}

/** Kształt wpisu czytanego przez `readStoredConsent` i skrypt startowy. */
const STORED_CONSENT = {
	version: 1,
	necessary: true,
	analytics: false,
	marketing: false,
	preferences: false,
}

export const test = base.extend<Fixtures>({
	consoleMessages: [
		async ({ page }, use, testInfo) => {
			const messages: string[] = []

			// Tylko do diagnostyki, nie jako powód wywrotki: przeglądarka zgłasza
			// nieudane pobranie bez adresu, a część testów CELOWO otwiera 404.
			const failedResponses: string[] = []

			page.on('response', response => {
				if (response.status() >= 400)
					failedResponses.push(`${response.status()} ${response.url()}`)
			})

			page.on('console', message => {
				const type = message.type()
				const text = message.text()

				// Ostrzeżenia Reacta idą przez console.error, część bibliotek
				// używa console.warn — łapiemy oba.
				if (type !== 'error' && type !== 'warning') return
				if (!isRelevant(text)) return

				messages.push(`[${type}] ${text}`)
			})

			// Niezłapany wyjątek nie trafia do console — bez tego test przeszedłby
			// mimo wywrotki strony.
			page.on('pageerror', error => {
				messages.push(`[pageerror] ${error.message}`)
			})

			page.on('requestfailed', request => {
				const failure = (request.failure()?.errorText ?? '').toUpperCase()

				// ERR_BLOCKED_BY_CLIENT — nasza blokada GTM-a niżej.
				// ERR_ABORTED — żądanie przerwane końcem testu (akcje serwerowe).
				// Porównanie MUSI ignorować wielkość liter: Chromium zwraca
				// `net::ERR_ABORTED`, więc szukanie „aborted" nie trafiało nigdy.
				if (failure.includes('ERR_BLOCKED_BY_CLIENT') || failure.includes('ERR_ABORTED')) return

				messages.push(`[request] ${request.url()} — ${request.failure()?.errorText ?? ''}`)
			})

			await use(messages)

			// Test może świadomie dopuścić komunikaty:
			//   test.info().annotations.push({ type: 'allowed-console-errors' })
			const allowed = testInfo.annotations.some(a => a.type === 'allowed-console-errors')

			if (!allowed) {
				const diagnostics = failedResponses.length
					? `Konsola przeglądarki musi być czysta. Odpowiedzi 4xx/5xx w tym teście: ${failedResponses.join(', ')}`
					: 'Konsola przeglądarki musi być czysta'

				expect(messages, diagnostics).toEqual([])
			}
		},
		{ auto: true },
	],

	consentSeeded: [true, { option: true }],

	page: async ({ page, consentSeeded }, use) => {
		// Pusta odpowiedź zamiast kontenera GTM. `fulfill`, nie `abort` —
		// przerwane żądanie zostawia w konsoli błąd, który kontrola wyżej zgłosi.
		await page.route(/googletagmanager\.com/, route =>
			route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
		)

		// `addInitScript` wykonuje się przed jakimkolwiek skryptem autora, więc
		// startowy `consentPendingScript` zastaje gotowy wpis. Ustawienie tego po
		// `goto` dałoby test oglądający baner przez ułamek sekundy.
		if (consentSeeded) {
			await page.addInitScript(consent => {
				window.localStorage.setItem(
					'cookie-consent',
					JSON.stringify({ ...consent, timestamp: new Date().toISOString() })
				)
			}, STORED_CONSENT)
		}

		await use(page)
	},
})

export { expect } from '@playwright/test'
