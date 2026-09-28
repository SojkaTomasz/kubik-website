import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
	clearStoredConsent,
	CONSENT_PENDING_CLASS,
	CONSENT_STORAGE_KEY,
	CONSENT_VERSION,
	consentPendingScript,
	DEFAULT_CONSENT,
	FULL_CONSENT,
	markConsentDecided,
	readStoredConsent,
	storeConsent,
} from '@/lib/analytics/consent'

/**
 * Zgody na cookies — warstwa, w której błąd jest naruszeniem prawa, a nie
 * usterką wizualną.
 *
 * Reguła nadrzędna, którą sprawdza większość testów poniżej: **wszystko,
 * co nie jest jednoznaczną, aktualną zgodą, traktujemy jak jej brak.**
 * Uszkodzone dane, dane w starej wersji, dane w złym kształcie — wszystkie
 * te przypadki muszą prowadzić do ponownego zapytania użytkownika, nigdy
 * do domyślnego przyzwolenia.
 */

describe('wartości domyślne', () => {
	it('domyślnie zgadzamy się wyłącznie na kategorię niezbędną', () => {
		expect(DEFAULT_CONSENT).toEqual({
			necessary: true,
			analytics: false,
			marketing: false,
			preferences: false,
		})
	})

	it('pełna zgoda obejmuje wszystkie kategorie', () => {
		expect(FULL_CONSENT).toEqual({
			necessary: true,
			analytics: true,
			marketing: true,
			preferences: true,
		})
	})
})

describe('odczyt zapisanej zgody', () => {
	it('zwraca null, gdy użytkownik jeszcze nie decydował', () => {
		expect(readStoredConsent()).toBeNull()
	})

	it('odtwarza zapisaną decyzję', () => {
		storeConsent({ ...DEFAULT_CONSENT, analytics: true })

		expect(readStoredConsent()).toMatchObject({
			necessary: true,
			analytics: true,
			marketing: false,
			preferences: false,
			version: CONSENT_VERSION,
		})
	})

	it('odrzuca uszkodzony JSON', () => {
		window.localStorage.setItem(CONSENT_STORAGE_KEY, '{niepoprawny json')

		expect(readStoredConsent()).toBeNull()
	})

	it('odrzuca dane w starszej wersji zgody', () => {
		// Podbicie CONSENT_VERSION oznacza, że zmienił się zakres zbieranych
		// danych. Stara zgoda nie może po cichu objąć nowego zakresu.
		window.localStorage.setItem(
			CONSENT_STORAGE_KEY,
			JSON.stringify({
				version: CONSENT_VERSION - 1,
				analytics: true,
				marketing: true,
				preferences: true,
			})
		)

		expect(readStoredConsent()).toBeNull()
	})

	it('odrzuca dane o niepoprawnym kształcie', () => {
		window.localStorage.setItem(
			CONSENT_STORAGE_KEY,
			JSON.stringify({ version: CONSENT_VERSION, analytics: 'tak' })
		)

		expect(readStoredConsent()).toBeNull()
	})

	it('odrzuca wartość, która nie jest obiektem', () => {
		window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify('zgoda'))

		expect(readStoredConsent()).toBeNull()
	})

	it('kategoria niezbędna jest zawsze włączona, nawet gdy zapis mówi inaczej', () => {
		window.localStorage.setItem(
			CONSENT_STORAGE_KEY,
			JSON.stringify({
				version: CONSENT_VERSION,
				necessary: false,
				analytics: false,
				marketing: false,
				preferences: false,
			})
		)

		expect(readStoredConsent()?.necessary).toBe(true)
	})
})

describe('zapis zgody', () => {
	it('dopisuje wersję i znacznik czasu', () => {
		const stored = storeConsent(FULL_CONSENT)

		expect(stored.version).toBe(CONSENT_VERSION)
		// Znacznik czasu jest dowodem, kiedy zgoda została udzielona.
		expect(() => new Date(stored.timestamp).toISOString()).not.toThrow()
	})

	it('wymusza kategorię niezbędną niezależnie od wejścia', () => {
		const stored = storeConsent({ ...DEFAULT_CONSENT, necessary: false as unknown as true })

		expect(stored.necessary).toBe(true)
	})

	it('zapisuje w localStorage pod ustalonym kluczem', () => {
		storeConsent(FULL_CONSENT)

		expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBeTruthy()
	})
})

describe('kasowanie zgody', () => {
	it('przywraca stan sprzed decyzji', () => {
		storeConsent(FULL_CONSENT)
		clearStoredConsent()

		expect(readStoredConsent()).toBeNull()
	})
})

describe('tryb prywatny przeglądarki', () => {
	beforeEach(() => {
		// W trybie prywatnym Safari zapis do localStorage rzuca wyjątkiem.
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('QuotaExceededError')
		})
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('SecurityError')
		})
	})

	it('zapis nie wywraca aplikacji', () => {
		expect(() => storeConsent(FULL_CONSENT)).not.toThrow()
	})

	it('zapis zwraca decyzję obowiązującą do końca sesji', () => {
		expect(storeConsent(FULL_CONSENT)).toMatchObject({ analytics: true })
	})

	it('odczyt zwraca null zamiast rzucać', () => {
		expect(() => readStoredConsent()).not.toThrow()
		expect(readStoredConsent()).toBeNull()
	})

	it('kasowanie nie wywraca aplikacji', () => {
		expect(() => clearStoredConsent()).not.toThrow()
	})
})

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Skrypt startowy zdejmujący `consent-pending`.
 *
 * O tym, czy baner widać przy wejściu na stronę, decyduje klasa na `<html>`,
 * a nie stan Reacta — sam baner jest w HTML-u z serwera zawsze. Powód
 * i pomiary: `components/cookie/cookie-consent.tsx`.
 *
 * Skrypt POWTARZA warunki ważności zgody, bo wykonuje się w `<head>` i nie ma
 * jak zaimportować modułu. Ostatni blok w tym pliku pilnuje, żeby te dwie
 * kopie nie rozjechały się w czasie.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Wykonuje skrypt tak, jak zrobiłaby to przeglądarka przy parsowaniu `<head>`. */
function runConsentPendingScript(): void {
	;(0, eval)(consentPendingScript)
}

describe('skrypt startowy zgód', () => {
	beforeEach(() => {
		document.documentElement.className = CONSENT_PENDING_CLASS
	})

	it('zdejmuje klasę, gdy zgoda jest zapisana', () => {
		storeConsent(DEFAULT_CONSENT)

		runConsentPendingScript()

		expect(document.documentElement.classList.contains(CONSENT_PENDING_CLASS)).toBe(false)
	})

	it('zostawia klasę przy braku decyzji', () => {
		runConsentPendingScript()

		expect(document.documentElement.classList.contains(CONSENT_PENDING_CLASS)).toBe(true)
	})

	it('nie wywraca się na uszkodzonym wpisie', () => {
		// Wyjątek w `<head>` zatrzymuje parsowanie dokumentu — strona nie
		// wyrenderowałaby się wcale.
		window.localStorage.setItem(CONSENT_STORAGE_KEY, '{niepoprawny json')

		expect(() => runConsentPendingScript()).not.toThrow()
		expect(document.documentElement.classList.contains(CONSENT_PENDING_CLASS)).toBe(true)
	})

	it('nie rusza pozostałych klas na <html>', () => {
		// `no-js` i klasa motywu siedzą na tym samym elemencie i mają własne
		// skrypty startowe. Zdjęcie cudzej klasy pokazałoby treść przed czasem
		// albo mignęło złym motywem.
		document.documentElement.className = `${CONSENT_PENDING_CLASS} no-js dark`
		storeConsent(FULL_CONSENT)

		runConsentPendingScript()

		expect(document.documentElement.className).toBe('no-js dark')
	})
})

describe('markConsentDecided', () => {
	it('zdejmuje klasę po decyzji podjętej w tej wizycie', () => {
		// Bez tego klasa wisiałaby do najbliższego przeładowania, a razem z nią
		// reguła CSS pokazująca baner.
		document.documentElement.className = CONSENT_PENDING_CLASS

		markConsentDecided()

		expect(document.documentElement.classList.contains(CONSENT_PENDING_CLASS)).toBe(false)
	})
})

describe('clearStoredConsent przywraca klasę', () => {
	it('po wycofaniu zgody baner ma prawo wrócić', () => {
		// Kasowanie wpisu bez przywrócenia klasy zostawiłoby użytkownika bez
		// możliwości odpowiedzi: zgody nie ma, a banera nie widać.
		storeConsent(FULL_CONSENT)
		markConsentDecided()

		clearStoredConsent()

		expect(document.documentElement.classList.contains(CONSENT_PENDING_CLASS)).toBe(true)
	})
})

/**
 * Tabela wejść wspólna dla skryptu i dla odczytu.
 *
 * Każdy wiersz musi dać ten sam werdykt po obu stronach. Skrypt ŁAGODNIEJSZY
 * od odczytu daje mignięcie banera przy wejściu; OSTRZEJSZY — baner, który
 * pojawia się i znika po hydracji. Oba objawy łamią się cicho: nie ma błędu
 * kompilacji, nie ma wpisu w konsoli, testy zachowania przechodzą.
 */
const AGREEMENT_CASES: { name: string; raw: string | null }[] = [
	{ name: 'brak wpisu', raw: null },
	{ name: 'pusty napis', raw: '' },
	{ name: 'uszkodzony JSON', raw: '{niepoprawny json' },
	{ name: 'null', raw: 'null' },
	{ name: 'napis zamiast obiektu', raw: '"zgoda"' },
	{ name: 'tablica', raw: '[]' },
	{ name: 'pusty obiekt', raw: '{}' },
	{ name: 'sama wersja', raw: JSON.stringify({ version: CONSENT_VERSION }) },
	{
		name: 'starsza wersja',
		raw: JSON.stringify({ ...FULL_CONSENT, version: CONSENT_VERSION - 1 }),
	},
	{
		name: 'nowsza wersja',
		raw: JSON.stringify({ ...FULL_CONSENT, version: CONSENT_VERSION + 1 }),
	},
	{
		name: 'brakująca kategoria',
		raw: JSON.stringify({ version: CONSENT_VERSION, analytics: true, marketing: true }),
	},
	{
		name: 'kategoria jako napis',
		raw: JSON.stringify({
			version: CONSENT_VERSION,
			analytics: 'tak',
			marketing: false,
			preferences: false,
		}),
	},
	{
		name: 'komplet — odmowa',
		raw: JSON.stringify({ ...DEFAULT_CONSENT, version: CONSENT_VERSION }),
	},
	{ name: 'komplet — zgoda', raw: JSON.stringify({ ...FULL_CONSENT, version: CONSENT_VERSION }) },
]

describe('skrypt startowy zgadza się z readStoredConsent', () => {
	it.each(AGREEMENT_CASES)('$name', ({ raw }) => {
		document.documentElement.className = CONSENT_PENDING_CLASS
		if (raw !== null) window.localStorage.setItem(CONSENT_STORAGE_KEY, raw)

		runConsentPendingScript()

		const scriptSaysDecided = !document.documentElement.classList.contains(CONSENT_PENDING_CLASS)
		const readerSaysDecided = readStoredConsent() !== null

		expect(scriptSaysDecided).toBe(readerSaysDecided)
	})
})
