import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
	defaultLocale,
	isMultilingual,
	locales,
	localeTags,
	siteConfig,
	supportedLocales,
} from '@/site.config'

/**
 * Spójność konfiguracji języków.
 *
 * `supportedLocales` (co kod zna) i `locales` (co jest włączone) to dwie różne
 * listy — i właśnie dlatego mogą się rozjechać. Rozjazd łamie się cicho albo
 * dopiero w czasie działania strony:
 *
 *   • język włączony bez pliku messages/<kod>.json → next-intl rzuca przy
 *     pierwszym żądaniu, a nie przy budowaniu
 *   • język bez wpisu w localeTags → `og:locale` z wartością `undefined`
 *   • defaultLocale spoza listy włączonych → strona główna zwraca 404
 *
 * Ten plik zamienia każdy z tych przypadków w czerwony test.
 */

describe('języki włączone i obsługiwane', () => {
	it('każdy włączony język jest wśród obsługiwanych', () => {
		for (const locale of locales) {
			expect(supportedLocales, `"${locale}" nie ma w supportedLocales`).toContain(locale)
		}
	})

	it('lista włączonych języków nie jest pusta', () => {
		expect(locales.length).toBeGreaterThan(0)
	})

	it('nie ma powtórzeń', () => {
		expect([...locales]).toEqual([...new Set(locales)])
	})

	it('język domyślny jest włączony', () => {
		// Inaczej strona główna trafia w segment [locale] jako nieznany język
		// i zwraca 404 — mimo poprawnie wyglądającej konfiguracji.
		expect(locales).toContain(defaultLocale)
	})

	it('język domyślny jest pierwszy na liście', () => {
		expect(locales[0]).toBe(defaultLocale)
	})
})

describe('isMultilingual', () => {
	it('odpowiada liczbie włączonych języków', () => {
		expect(isMultilingual).toBe(locales.length > 1)
	})

	it('jest tą samą wartością co w siteConfig', () => {
		expect(siteConfig.isMultilingual).toBe(isMultilingual)
	})
})

describe('kompletność danych języka', () => {
	it('każdy obsługiwany język ma tag og:locale', () => {
		// Mapa jest kluczowana po supportedLocales, więc musi je pokrywać
		// w całości — także języki chwilowo wyłączone.
		for (const locale of supportedLocales) {
			expect(localeTags[locale], `brak localeTags["${locale}"]`).toBeTruthy()
		}
	})

	it('każdy włączony język ma plik tłumaczeń', () => {
		for (const locale of locales) {
			const file = join(process.cwd(), 'messages', `${locale}.json`)

			expect(existsSync(file), `brak messages/${locale}.json`).toBe(true)
		}
	})
})
