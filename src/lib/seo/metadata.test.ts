import { describe, expect, it } from 'vitest'

import { buildLanguageAlternates, buildPageMetadata, localizedPath } from '@/lib/seo/metadata'
import { siteConfig } from '@/site.config'

/**
 * Metadane to warstwa, której błędy są niewidoczne w przeglądarce.
 *
 * Literówka w canonical albo brakujący hreflang nie psują strony — psują
 * indeksowanie, i wychodzi to na jaw tygodnie później, w Search Console.
 * Dlatego sprawdzamy tu dosłowne wartości, a nie samą obecność pól.
 */

describe('localizedPath', () => {
	it('nie dodaje prefiksu językowi domyślnemu', () => {
		expect(localizedPath('/kontakt', 'pl')).toBe('/kontakt')
	})

	it('dodaje prefiks pozostałym językom', () => {
		expect(localizedPath('/kontakt', 'en')).toBe('/en/kontakt')
	})

	it('zachowuje ukośnik dla strony głównej w języku domyślnym', () => {
		expect(localizedPath('/', 'pl')).toBe('/')
	})

	it('nie zostawia wiszącego ukośnika w stronie głównej innego języka', () => {
		// '/en/' i '/en' to dla Google dwa różne adresy — jeden z nich byłby
		// duplikatem drugiego.
		expect(localizedPath('/', 'en')).toBe('/en')
	})

	it('obcina końcowy ukośnik ze ścieżki', () => {
		expect(localizedPath('/kontakt/', 'pl')).toBe('/kontakt')
	})
})

/*
 * Asercje poniżej opisują stronę WIELOJĘZYCZNĄ, więc są uzależnione od
 * konfiguracji, a nie od wpisanych na sztywno dwóch języków.
 *
 * Po przełączeniu startera na jeden język (`locales: ['pl']`) hreflangi
 * przestają się generować celowo — te testy są wtedy pomijane, a wariant
 * jednojęzyczny pokrywa `metadata.single-locale.test.ts`. Dzięki temu zmiana
 * jednej linii w site.config.ts nie zostawia czerwonej bramki jakości.
 */
describe.skipIf(!siteConfig.isMultilingual)('buildLanguageAlternates', () => {
	it('zwraca wpis dla każdego języka oraz x-default', () => {
		const alternates = buildLanguageAlternates('/kontakt') ?? {}

		expect(alternates).toEqual({
			pl: 'https://example.com/kontakt',
			en: 'https://example.com/en/kontakt',
			'x-default': 'https://example.com/kontakt',
		})
	})

	it('x-default wskazuje wersję w języku domyślnym', () => {
		// Bez x-default Google sam wybiera wersję dla użytkownika, którego języka
		// nie obsługujemy — i bywa, że wybiera źle.
		const alternates = buildLanguageAlternates('/') ?? {}

		expect(alternates['x-default']).toBe(alternates[siteConfig.defaultLocale])
	})

	it('obejmuje wszystkie zadeklarowane języki', () => {
		const alternates = buildLanguageAlternates('/') ?? {}

		for (const locale of siteConfig.locales) {
			expect(alternates).toHaveProperty(locale)
		}
	})
})

describe('buildPageMetadata', () => {
	it('ustawia canonical na adres bezwzględny w danym języku', () => {
		expect(buildPageMetadata({ title: 'Kontakt', path: '/kontakt', locale: 'en' })).toMatchObject(
			{
				alternates: { canonical: 'https://example.com/en/kontakt' },
			}
		)
	})

	it('bierze opis z konfiguracji strony, gdy strona go nie podaje', () => {
		const metadata = buildPageMetadata({ title: 'Kontakt' })

		expect(metadata.description).toBe(siteConfig.description)
	})

	it('pozwala Google pokazać dużą miniaturę i pełny opis', () => {
		const metadata = buildPageMetadata({ title: 'Kontakt' })

		// Bez tych dwóch Google pokazuje miniaturę pocztówkową i ucina opis
		// do własnej, krótszej długości.
		expect(metadata.robots).toMatchObject({
			index: true,
			googleBot: { 'max-image-preview': 'large', 'max-snippet': -1 },
		})
	})

	it('blokuje indeksowanie przy noIndex', () => {
		const metadata = buildPageMetadata({ title: 'Podziękowanie', noIndex: true })

		expect(metadata.robots).toEqual({ index: false, follow: false })
	})

	it('podaje locale Open Graph w formacie oczekiwanym przez Facebooka', () => {
		const metadata = buildPageMetadata({ title: 'Start', locale: 'pl' })

		// Facebook wymaga formatu pl_PL, nie samego 'pl'.
		expect(metadata.openGraph).toMatchObject({ locale: 'pl_PL' })
	})

	it.skipIf(!siteConfig.isMultilingual)('wymienia pozostałe języki jako alternateLocale', () => {
		const metadata = buildPageMetadata({ title: 'Start', locale: 'pl' })

		expect(metadata.openGraph).toMatchObject({ alternateLocale: ['en_US'] })
	})

	it('NIE ustawia obrazu OG, gdy strona go nie podaje', () => {
		const metadata = buildPageMetadata({ title: 'Start' })

		// To celowe: puste pole zostawia miejsce dla obrazu z konwencji plikowej
		// (opengraph-image.tsx). Wpisanie tu czegokolwiek nadpisałoby tamten
		// wpis martwym linkiem — dokładnie ten błąd zdarzył się w tym projekcie.
		expect(metadata.openGraph).not.toHaveProperty('images')
		expect(metadata.twitter).not.toHaveProperty('images')
	})

	it('rozwija podany obraz OG do adresu bezwzględnego', () => {
		const metadata = buildPageMetadata({ title: 'Start', image: '/og/wpis.png' })

		expect(metadata.openGraph).toMatchObject({
			images: [
				{
					url: 'https://example.com/og/wpis.png',
					width: 1200,
					height: 630,
					alt: 'Start',
				},
			],
		})
	})

	it('używa karty summary_large_image', () => {
		expect(buildPageMetadata({ title: 'Start' }).twitter).toMatchObject({
			card: 'summary_large_image',
		})
	})

	it('pozwala nadpisać tytuł w social media', () => {
		const metadata = buildPageMetadata({ title: 'Cennik — 2026', ogTitle: 'Ile to kosztuje?' })

		expect(metadata.openGraph).toMatchObject({ title: 'Ile to kosztuje?' })
		expect(metadata.title).toBe('Cennik — 2026')
	})

	it('dokłada metadane artykułu tylko dla type="article"', () => {
		const article = { publishedTime: '2026-01-15T10:00:00Z', authors: ['Jan Kowalski'] }

		expect(
			buildPageMetadata({ title: 'Wpis', type: 'article', article }).openGraph
		).toMatchObject({
			type: 'article',
			publishedTime: '2026-01-15T10:00:00Z',
			authors: ['Jan Kowalski'],
		})

		expect(buildPageMetadata({ title: 'Wpis', article }).openGraph).not.toHaveProperty(
			'publishedTime'
		)
	})

	it('dołącza komplet hreflang do każdej strony', () => {
		const metadata = buildPageMetadata({ title: 'Kontakt', path: '/kontakt' })

		expect(metadata.alternates?.languages).toEqual(buildLanguageAlternates('/kontakt'))
	})
})
