import { expect, test } from './fixtures'

/**
 * Pliki metadanych (ikony, manifest, robots, sitemap) łamią się mylącym
 * sposobem: build wypisuje trasę jako ZBUDOWANĄ, odnośnik jest w HTML-u,
 * a pod adresem stoi 404 — bo proxy przepisało ją na wersję z prefiksem języka.
 *
 * Matcher wyklucza ścieżki z KROPKĄ, więc wyjątkiem jest `/apple-icon`, które
 * musi być w nim wymienione z nazwy.
 */

/** Sprawdza, że adres odpowiada zasobem oczekiwanego typu, a nie stroną 404. */
async function expectAsset(
	request: import('@playwright/test').APIRequestContext,
	path: string,
	contentType: string
) {
	const response = await request.get(path)

	expect(response.status(), `${path} nie odpowiada`).toBe(200)
	expect(
		response.headers()['content-type'],
		`${path} zwraca stronę zamiast zasobu — najpewniej przechwyciło je proxy`
	).toContain(contentType)

	return response
}

test.describe('ikony', () => {
	test('ikona iOS się serwuje', async ({ request }) => {
		// Bez niej iPhone wstawia ZRZUT strony zamiast ikony, bez ostrzeżenia.
		const response = await expectAsset(request, '/apple-icon', 'image/png')

		// Pusty obraz z Satori waży kilkaset bajtów.
		expect((await response.body()).byteLength).toBeGreaterThan(500)
	})

	test('strona wskazuje ikonę iOS w nagłówku dokumentu', async ({ page }) => {
		await page.goto('/')

		const link = page.locator('link[rel="apple-touch-icon"]')

		await expect(link).toHaveCount(1)
		await expect(link).toHaveAttribute('sizes', '180x180')
	})

	test('ikona iOS jest osiągalna także z wersji angielskiej', async ({ page, request }) => {
		// Odnośnik jest w root layoucie, więc jego adres nie może zależeć od
		// języka. Gdyby dostał prefiks, na `/en` prowadziłby do 404.
		await page.goto('/en')

		const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href')

		expect(href).not.toContain('/en/')
		await expectAsset(request, href ?? '', 'image/png')
	})

	test('favicon SVG się serwuje', async ({ request }) => {
		await expectAsset(request, '/icon.svg', 'image/svg+xml')
	})
})

test.describe('pozostałe pliki metadanych', () => {
	test('manifest aplikacji', async ({ request }) => {
		await expectAsset(request, '/manifest.webmanifest', 'application/manifest+json')
	})

	test('robots.txt', async ({ request }) => {
		await expectAsset(request, '/robots.txt', 'text/plain')
	})

	test('sitemap.xml', async ({ request }) => {
		await expectAsset(request, '/sitemap.xml', 'xml')
	})

	test('ikony z manifestu naprawdę istnieją', async ({ request }) => {
		// Adresów ikon z manifestu nikt nie weryfikuje — przeglądarka po prostu
		// nie pokazuje ikony przy instalacji.
		const manifest = await (await request.get('/manifest.webmanifest')).json()

		expect(Array.isArray(manifest.icons)).toBe(true)

		for (const icon of manifest.icons as { src: string }[]) {
			const response = await request.get(icon.src)

			expect(response.status(), `ikona z manifestu nie istnieje: ${icon.src}`).toBe(200)
		}
	})
})
