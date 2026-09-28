import { expect, test } from './fixtures'

/**
 * Kanał RSS. Nikt go nie ogląda w przeglądarce, więc błędy żyją długo — widzi je
 * dopiero subskrybent, jako pustą listę. XML nie ma trybu odzyskiwania: jeden
 * niezaekranowany ampersand wywraca CAŁY dokument.
 */

/** Pobiera kanał i sprawdza, że w ogóle jest kanałem. */
async function fetchFeed(request: import('@playwright/test').APIRequestContext, path: string) {
	const response = await request.get(path)

	expect(response.status(), `${path} nie odpowiada`).toBe(200)
	expect(response.headers()['content-type']).toContain('application/rss+xml')

	return response.text()
}

test.describe('kanał RSS', () => {
	test('odpowiada pod kanonicznym adresem', async ({ request }) => {
		// `/feed.xml` to adres, którego szukają czytniki i który zgadują ludzie.
		const body = await fetchFeed(request, '/feed.xml')

		expect(body).toContain('<rss version="2.0"')
		expect(body).toContain('<channel>')
	})

	test('jest poprawnym XML-em', async ({ page, request }) => {
		// PARSEREM, nie dopasowaniem tekstu: niezaekranowany `&` daje dokument
		// poprawny dla człowieka i odrzucany przez każdy czytnik.
		const body = await fetchFeed(request, '/feed.xml')

		const error = await page.evaluate(xml => {
			const parsed = new DOMParser().parseFromString(xml, 'application/xml')
			return parsed.querySelector('parsererror')?.textContent ?? null
		}, body)

		expect(error, 'kanał nie jest poprawnym XML-em').toBeNull()
	})

	test('wymienia opublikowane wpisy z pełnymi adresami', async ({ request }) => {
		// Adres względny w `<link>` nie prowadzi donikąd — czytnik nie zna
		// pochodzenia kanału inaczej niż z tego pola.
		const body = await fetchFeed(request, '/feed.xml')

		expect(body).toContain('<title>Jak zacząć nowy projekt na tym starterze</title>')
		expect(body).toMatch(/<link>https?:\/\/[^<]+\/blog\/pierwszy-wpis<\/link>/)
	})

	// Zachowanie WYŁĄCZNIE produkcyjne: na serwerze deweloperskim szkice są
	// widoczne celowo.
	test.describe(() => {
		test.skip(process.env.E2E_DEV === '1', 'Szkice są widoczne w trybie deweloperskim')

		test('NIE wymienia szkiców', async ({ request }) => {
			// Szkice odsiewa `postsFor` — filtrowanie po swojemu opublikowałoby
			// nieskończony tekst od razu subskrybentom.
			const body = await fetchFeed(request, '/feed.xml')

			expect(body).not.toContain('Wpis w przygotowaniu')
			expect(body).not.toContain('/blog/szkic')
		})
	})

	test('daty są w formacie wymaganym przez RSS', async ({ request }) => {
		// `YYYY-MM-DD` z frontmattera nie jest dla czytnika RSS datą. Objaw
		// zależy od czytnika, więc łatwo go przeoczyć, sprawdzając w jednym.
		const body = await fetchFeed(request, '/feed.xml')

		expect(body).toMatch(/<pubDate>\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT<\/pubDate>/)
		expect(body, 'data została w formacie z frontmatteru').not.toMatch(
			/<pubDate>\d{4}-\d{2}-\d{2}<\/pubDate>/
		)
	})

	test('deklaruje własny adres', async ({ request }) => {
		// `atom:link rel="self"` mówi agregatorom, skąd kanał pochodzi. Bez tego
		// część z nich odmawia subskrypcji, a walidatory zgłaszają ostrzeżenie.
		const body = await fetchFeed(request, '/feed.xml')

		expect(body).toMatch(/<atom:link href="https?:\/\/[^"]+\/feed\.xml" rel="self"/)
	})
})

test.describe('kanał a języki', () => {
	test('drugi język ma własny kanał', async ({ request }) => {
		// Wersje językowe wpisów mają WŁASNE slugi, więc jeden wspólny kanał
		// mieszałby dwa języki w jednej liście.
		const body = await fetchFeed(request, '/en/feed.xml')

		expect(body).toContain('<language>en-US</language>')
		expect(body).toContain('/en/blog/getting-started')
	})

	test('kanały nie mieszają języków', async ({ request }) => {
		const polish = await fetchFeed(request, '/feed.xml')
		const english = await fetchFeed(request, '/en/feed.xml')

		expect(polish).not.toContain('getting-started')
		expect(english).not.toContain('pierwszy-wpis')
	})

	test('język domyślny NIE ma drugiego adresu z prefiksem', async ({ request }) => {
		// Bez `dynamicParams = false` w trasie `[locale]` ten sam kanał wisiałby
		// pod dwoma adresami.
		const response = await request.get('/pl/feed.xml')

		expect(response.status()).toBe(404)
	})
})

test.describe('wykrywalność kanału', () => {
	test('strona wskazuje kanał w nagłówku dokumentu', async ({ page }) => {
		/*
		 * JEDYNY sposób, w jaki czytniki znajdują kanał. Odnośnik siedzi wprost
		 * w `<head>` layoutu, nie w `alternates.types`: podstrony nadpisują
		 * `alternates` w całości, więc kanał zniknąłby z niemal całej witryny.
		 */
		await page.goto('/')

		const link = page.locator('link[rel="alternate"][type="application/rss+xml"]')

		await expect(link).toHaveCount(1)
		await expect(link).toHaveAttribute('href', '/feed.xml')
	})

	test('odnośnik jest też na podstronie, nie tylko na głównej', async ({ page }) => {
		// Podstrony ustawiają własne metadane — to tam odnośnik znikał, gdyby
		// szedł przez `alternates`.
		await page.goto('/blog/pierwszy-wpis')

		await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveCount(1)
	})

	test('wersja angielska wskazuje angielski kanał', async ({ page }) => {
		await page.goto('/en')

		await expect(
			page.locator('link[rel="alternate"][type="application/rss+xml"]')
		).toHaveAttribute('href', '/en/feed.xml')
	})
})
