import { describe, expect, it } from 'vitest'

import { locales } from '@/site.config'

import pl from '../../messages/pl.json'

/**
 * Spójność plików tłumaczeń.
 *
 * Brakujący key nie wywraca strony — next-intl wyświetla wtedy surowy
 * identyfikator, na przykład „contact.fields.name". Wygląda to jak literówka
 * w treści i potrafi przeżyć wdrożenie, bo nikt nie klika po całym serwisie
 * w drugim języku.
 *
 * Strona jest dziś jednojęzyczna, więc test pilnuje jednego katalogu: każdy
 * kod błędu i klucz walidacji używany w kodzie ma swój komunikat. Dokładając
 * język, dopisz jego plik do `CATALOGS` — test na komplet katalogów zgłosi
 * brak sam.
 */

type Node = Record<string, unknown>

/** Spłaszcza zagnieżdżony object do listy ścieżek: `contact.fields.name`. */
function paths(object: Node, prefix = ''): string[] {
	return Object.entries(object).flatMap(([key, value]) =>
		typeof value === 'object' && value !== null
			? paths(value as Node, `${prefix}${key}.`)
			: [`${prefix}${key}`]
	)
}

/** Odczytuje wartość spod spłaszczonej ścieżki. */
function value(object: Node, path: string): unknown {
	return path.split('.').reduce<unknown>((current, key) => {
		if (typeof current !== 'object' || current === null) return undefined
		return (current as Node)[key]
	}, object)
}

const CATALOGS = { pl } as const satisfies Record<string, Node>

describe('katalogi tłumaczeń', () => {
	it('istnieje catalog dla każdego zadeklarowanego języka', () => {
		for (const locale of locales) {
			expect(CATALOGS, `brak pliku messages/${locale}.json`).toHaveProperty(locale)
		}
	})

	it('żaden komunikat nie jest pusty', () => {
		const empty = paths(pl).flatMap(path =>
			Object.entries(CATALOGS)
				.filter(([, catalog]) => String(value(catalog, path) ?? '').trim() === '')
				.map(([locale]) => `${locale}: ${path}`)
		)

		expect(empty).toEqual([])
	})
})

describe('klucze wymagane przez code', () => {
	it('każdy code błędu wysyłki wyceny ma swój komunikat', () => {
		// Lista odpowiada typowi QuoteErrorCode. Rozjazd oznaczałby, że przy
		// jakimś rodzaju awarii użytkownik zobaczy surowy key.
		for (const code of ['validation', 'rateLimit', 'notConfigured', 'sendFailed', 'rejected']) {
			for (const [locale, catalog] of Object.entries(CATALOGS)) {
				expect(
					value(catalog, `quote.errors.${code}`),
					`${locale}: brak quote.errors.${code}`
				).toBeTruthy()
			}
		}
	})

	it('każdy key walidacji użyty w schematach ma swój komunikat', () => {
		// Klucze pochodzą z lib/validation/quote.ts.
		for (const key of ['required', 'phone', 'tooLong', 'area']) {
			for (const [locale, catalog] of Object.entries(CATALOGS)) {
				expect(
					value(catalog, `validation.${key}`),
					`${locale}: brak validation.${key}`
				).toBeTruthy()
			}
		}
	})
})
