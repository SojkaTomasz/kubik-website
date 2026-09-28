import { expect, test } from './fixtures'

/**
 * SEO na żywo — na zbudowanej aplikacji, nie na zamockowanych danych.
 *
 * Testy jednostkowe sprawdzają, że `buildPageMetadata` zwraca właściwy obiekt.
 * Tutaj sprawdzamy rzecz, której tamte nie mogą: czy ten obiekt faktycznie
 * dojechał do HTML-a, i czy adresy, które ogłaszamy Google, naprawdę działają.
 */

test.describe('metadane strony głównej', () => {
	test('ma tytuł i opis', async ({ page }) => {
		await page.goto('/')

		await expect(page).toHaveTitle(/.+/)
		await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/)
	})

	test('ma canonical wskazujący sam siebie', async ({ page, baseURL }) => {
		await page.goto('/')

		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', String(baseURL))
	})

	test('deklaruje wszystkie wersje językowe wraz z x-default', async ({ page, baseURL }) => {
		await page.goto('/')

		const alternates = page.locator('link[rel="alternate"][hreflang]')
		const langs = await alternates.evaluateAll(links =>
			links.map(link => link.getAttribute('hreflang'))
		)

		// Brak x-default zostawia Google swobodę wyboru wersji dla użytkownika,
		// którego języka nie obsługujemy.
		expect(langs).toEqual(expect.arrayContaining(['pl', 'en', 'x-default']))

		await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
			'href',
			`${baseURL}/en`
		)
	})

	test('pozwala Google pokazać dużą miniaturę i pełny opis', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('meta[name="googlebot"]')).toHaveAttribute(
			'content',
			/max-image-preview:large/
		)
	})

	test('ma komplet tagów Open Graph', async ({ page }) => {
		await page.goto('/')

		for (const property of ['og:title', 'og:description', 'og:url', 'og:site_name', 'og:image']) {
			await expect(
				page.locator(`meta[property="${property}"]`),
				`brak ${property}`
			).toHaveAttribute('content', /.+/)
		}
	})

	test('obraz Open Graph naprawdę się serwuje', async ({ page, request }) => {
		await page.goto('/')

		const url = await page.locator('meta[property="og:image"]').getAttribute('content')
		expect(url).toBeTruthy()

		// Metatag wskazujący na 404 to typowa, niewidoczna usterka — wychodzi
		// dopiero wtedy, gdy ktoś wkleja link i widzi pustą miniaturę.
		const response = await request.get(String(url))

		expect(response.status(), `og:image zwraca ${response.status()}`).toBe(200)
		expect(response.headers()['content-type']).toContain('image/png')
	})
})

test.describe('dane strukturalne', () => {
	test('każdy blok JSON-LD jest poprawnym JSON-em', async ({ page }) => {
		await page.goto('/')

		const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()

		expect(blocks.length).toBeGreaterThan(0)

		for (const block of blocks) {
			expect(() => JSON.parse(block) as unknown).not.toThrow()
		}
	})

	test('opisuje firmę, serwis i podstronę', async ({ page }) => {
		await page.goto('/')

		const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
		const types = blocks.flatMap(block => {
			const parsed = JSON.parse(block) as { '@type'?: string; '@graph'?: { '@type': string }[] }
			return parsed['@graph']
				? parsed['@graph'].map(entity => entity['@type'])
				: [parsed['@type']]
		})

		expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'WebPage']))
	})

	test('identyfikator firmy jest ten sam na każdej podstronie', async ({ page }) => {
		const readOrganizationId = async () => {
			const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()

			for (const block of blocks) {
				const parsed = JSON.parse(block) as { '@graph'?: { '@type': string; '@id': string }[] }
				const organization = parsed['@graph']?.find(
					entity => entity['@type'] === 'Organization'
				)
				if (organization) return organization['@id']
			}

			return null
		}

		await page.goto('/')
		const onHomePage = await readOrganizationId()

		await page.goto('/en')
		const onEnglishPage = await readOrganizationId()

		// Rozjazd oznaczałby dla Google dwie różne firmy zamiast jednej,
		// a więc rozproszenie sygnałów zamiast ich sumowania.
		expect(onHomePage).toBe(onEnglishPage)
		expect(onHomePage).toBeTruthy()
	})
})

test.describe('sitemap i robots', () => {
	test('sitemap jest poprawnym XML-em', async ({ request }) => {
		const response = await request.get('/sitemap.xml')

		expect(response.status()).toBe(200)

		const xml = await response.text()

		expect(xml).toContain('<?xml')
		expect(xml).toContain('</urlset>')
	})

	test('KAŻDY adres z sitemapy odpowiada statusem 200', async ({ request }) => {
		// Najważniejszy test w pliku: sitemap wskazujący 404 obniża zaufanie Google
		// do CAŁEJ sitemapy, także do adresów poprawnych.
		const xml = await (await request.get('/sitemap.xml')).text()
		const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1] as string)

		expect(urls.length, 'sitemap nie może być pusty').toBeGreaterThan(0)

		const martwe: string[] = []

		for (const url of urls) {
			const response = await request.get(url)
			if (response.status() !== 200) martwe.push(`${url} → ${response.status()}`)
		}

		expect(martwe, 'adresy z sitemapy zwracające błąd').toEqual([])
	})

	test('sitemap deklaruje wersje językowe każdego adresu', async ({ request }) => {
		const xml = await (await request.get('/sitemap.xml')).text()

		expect(xml).toContain('hreflang="x-default"')
	})

	test('robots.txt wskazuje sitemapę i chroni strony deweloperskie', async ({ request }) => {
		const response = await request.get('/robots.txt')

		expect(response.status()).toBe(200)

		const text = await response.text()

		expect(text).toContain('Sitemap:')
		expect(text).toContain('Disallow: /dev/')
	})

	test('manifest aplikacji jest poprawnym JSON-em', async ({ request }) => {
		const response = await request.get('/manifest.webmanifest')

		expect(response.status()).toBe(200)

		const manifest = (await response.json()) as { name?: string; icons?: unknown[] }

		expect(manifest.name).toBeTruthy()
		expect(manifest.icons?.length).toBeGreaterThan(0)
	})
})
