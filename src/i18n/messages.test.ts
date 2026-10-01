import { describe, expect, it } from 'vitest'

import { locales } from '@/site.config'

import en from '../../messages/en.json'
import pl from '../../messages/pl.json'

/**
 * Spójność plików tłumaczeń.
 *
 * Brakujący klucz nie wywraca strony — next-intl wyświetla wtedy surowy
 * identyfikator, na przykład „quote.fields.area". Wygląda to jak literówka
 * w treści i potrafi przeżyć wdrożenie, bo nikt nie klika po całym serwisie
 * w drugim języku.
 *
 * Ten test porównuje strukturę obu plików i pilnuje, żeby ta sama zmienna
 * w komunikacie występowała w obu wersjach — bo brakujące `{seconds}` daje
 * zdanie urwane w połowie.
 */

type Node = Record<string, unknown>

/** Spłaszcza zagnieżdżony obiekt do listy ścieżek: `quote.fields.area`. */
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

/** Wyciąga nazwy zmiennych z komunikatu: `{seconds}`, `{current}`. */
function placeholders(text: string): string[] {
	return [...text.matchAll(/\{(\w+)[^}]*\}/g)].map(match => match[1] as string).sort()
}

const CATALOGS = { pl, en } as const satisfies Record<string, Node>

describe('katalogi tłumaczeń', () => {
	it('istnieje katalog dla każdego zadeklarowanego języka', () => {
		for (const locale of locales) {
			expect(CATALOGS, `brak pliku messages/${locale}.json`).toHaveProperty(locale)
		}
	})

	it('mają identyczny zestaw kluczy', () => {
		const inPl = paths(pl).sort()
		const inEn = paths(en).sort()

		expect(
			inPl.filter(key => !inEn.includes(key)),
			'brakuje w en.json'
		).toEqual([])
		expect(
			inEn.filter(key => !inPl.includes(key)),
			'brakuje w pl.json'
		).toEqual([])
	})

	it('żaden komunikat nie jest pusty', () => {
		const empty = paths(pl).flatMap(path =>
			Object.entries(CATALOGS)
				.filter(([, catalog]) => String(value(catalog, path) ?? '').trim() === '')
				.map(([locale]) => `${locale}: ${path}`)
		)

		expect(empty).toEqual([])
	})

	it('te same zmienne występują w obu wersjach komunikatu', () => {
		const mismatches = paths(pl)
			.map(path => ({
				path,
				pl: placeholders(String(value(pl, path) ?? '')),
				en: placeholders(String(value(en, path) ?? '')),
			}))
			.filter(({ pl: inPl, en: inEn }) => inPl.join() !== inEn.join())
			.map(({ path, pl: inPl, en: inEn }) => `${path}: pl=[${inPl}] en=[${inEn}]`)

		expect(mismatches, 'rozjazd zmiennych w komunikatach').toEqual([])
	})
})

describe('klucze wymagane przez kod', () => {
	it('każdy kod błędu wysyłki wyceny ma swój komunikat', () => {
		// Lista odpowiada typowi QuoteErrorCode. Rozjazd oznaczałby, że przy
		// jakimś rodzaju awarii użytkownik zobaczy surowy klucz.
		for (const code of ['validation', 'rateLimit', 'notConfigured', 'sendFailed', 'rejected']) {
			for (const [locale, catalog] of Object.entries(CATALOGS)) {
				expect(
					value(catalog, `quote.errors.${code}`),
					`${locale}: brak quote.errors.${code}`
				).toBeTruthy()
			}
		}
	})

	it('każdy klucz walidacji użyty w schematach ma swój komunikat', () => {
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
