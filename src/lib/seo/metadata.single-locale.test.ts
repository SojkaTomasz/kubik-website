import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Zachowanie startera na stronie JEDNOJĘZYCZNEJ.
 *
 * Starter jest wysyłany z dwoma językami, więc pozostałe testy — i cały pakiet
 * end-to-end — sprawdzają wariant wielojęzyczny. Ten plik pilnuje drugiego
 * ustawienia, którego nie da się złapać inaczej niż podmianą konfiguracji:
 * `locales: ['pl']` w `site.config.ts`.
 *
 * Sprawdzamy to, bo przy jednym języku hreflang nie jest zbędnym dodatkiem,
 * tylko usterką: deklaruje wersję alternatywną wskazującą samą siebie, co
 * Google czyta jako niedokończoną konfigurację wielojęzyczną.
 */

vi.mock('@/site.config', async importOriginal => {
	const original = await importOriginal<typeof import('@/site.config')>()

	return {
		...original,
		isMultilingual: false,
		siteConfig: {
			...original.siteConfig,
			locales: ['pl'] as const,
			isMultilingual: false,
		},
	}
})

describe('strona jednojęzyczna', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('nie deklaruje żadnych hreflangów', async () => {
		const { buildLanguageAlternates } = await import('@/lib/seo/metadata')

		expect(buildLanguageAlternates('/kontakt')).toBeUndefined()
	})

	it('nie wstawia bloku languages do metadanych strony', async () => {
		const { buildPageMetadata } = await import('@/lib/seo/metadata')

		const metadata = buildPageMetadata({ title: 'Kontakt', path: '/kontakt' })

		expect(metadata.alternates?.languages).toBeUndefined()
	})

	it('nadal ustawia canonical — to on jest tu nośnikiem informacji', async () => {
		// Brak hreflangów nie zwalnia z canonical: bez niego Google traktuje
		// adresy z parametrami jako osobne strony.
		const { buildPageMetadata } = await import('@/lib/seo/metadata')

		const metadata = buildPageMetadata({ title: 'Kontakt', path: '/kontakt' })

		expect(metadata.alternates?.canonical).toBe('https://example.com/kontakt')
	})

	it('ścieżki nie dostają prefiksu języka', async () => {
		const { localizedPath } = await import('@/lib/seo/metadata')

		expect(localizedPath('/kontakt', 'pl')).toBe('/kontakt')
		expect(localizedPath('/', 'pl')).toBe('/')
	})

	it('sitemap nie zawiera bloku alternates', async () => {
		const { default: sitemap } = await import('@/app/sitemap')

		const entries = sitemap()

		expect(entries.length).toBeGreaterThan(0)
		for (const entry of entries) {
			expect(entry.alternates, `${entry.url} deklaruje wersje językowe`).toBeUndefined()
		}
	})

	it('sitemap ma jeden wpis na trasę, nie po jednym na język', async () => {
		const { default: sitemap } = await import('@/app/sitemap')
		const { staticRoutes } = await import('@/lib/routes')
		const { cities } = await import('@/data/cities')
		const { projects } = await import('@/data/projects')

		// Trasy statyczne PLUS miasta i realizacje. Przy dwóch językach
		// wszystko zdublowałoby się na język.
		const expected =
			staticRoutes.filter(route => route.inSitemap !== false).length +
			cities.length +
			projects.length

		expect(sitemap()).toHaveLength(expected)
	})
})
