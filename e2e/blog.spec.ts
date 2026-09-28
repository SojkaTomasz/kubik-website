import { expect, test } from './fixtures'

/**
 * Warstwa treści na zbudowanej stronie: czy MDX się skompilował, czy szkic nie
 * wyciekł do produkcji i czy wpis niesie komplet danych strukturalnych — tych
 * ostatnich błąd jest dla człowieka niewidoczny.
 */

test.describe('lista wpisów', () => {
	test('pokazuje wpisy z tytułem i opisem', async ({ page }) => {
		await page.goto('/blog')

		await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()

		const first = page.getByRole('main').getByRole('link').first()
		await expect(first).toBeVisible()
	})

	test('wpis prowadzi do własnej strony', async ({ page }) => {
		await page.goto('/blog')

		await page
			.getByRole('link', { name: /Jak zacząć nowy projekt/ })
			.first()
			.click()

		await expect(page).toHaveURL(/\/blog\/pierwszy-wpis$/)
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Jak zacząć nowy projekt')
	})

	// Zachowanie WYŁĄCZNIE produkcyjne — na serwerze deweloperskim szkic jest
	// widoczny celowo. Bez pominięcia zadanie `e2e-dev` w CI było trwale czerwone,
	// a to uczy ignorować wszystkie pozostałe.
	test.describe(() => {
		test.skip(process.env.E2E_DEV === '1', 'Szkice są widoczne w trybie deweloperskim')

		test('szkic NIE trafia do produkcyjnego builda', async ({ page }) => {
			// Build produkcyjny ma NODE_ENV=production, więc `draft: true` musi
			// zniknąć zarówno z listy, jak i spod własnego adresu.
			await page.goto('/blog')

			await expect(page.getByText('Wpis w przygotowaniu')).toHaveCount(0)
		})

		test('adres szkicu zwraca 404', async ({ request }) => {
			const response = await request.get('/blog/szkic')

			expect(response.status()).toBe(404)
		})
	})

	test('nieistniejący wpis zwraca 404, nie pustą stronę', async ({ request }) => {
		const response = await request.get('/blog/nie-ma-takiego-wpisu')

		expect(response.status()).toBe(404)
	})
})

test.describe('strona wpisu', () => {
	test('renderuje treść MDX jako prawdziwe znaczniki', async ({ page }) => {
		await page.goto('/blog/pierwszy-wpis')

		const article = page.getByRole('article')

		// Gdyby MDX się nie skompilował, zobaczylibyśmy surowy Markdown
		// zamiast nagłówków, listy i tabeli.
		await expect(article.getByRole('heading', { level: 2 }).first()).toBeVisible()
		await expect(article.getByRole('list').first()).toBeVisible()
		await expect(article.getByRole('table')).toBeVisible()
		await expect(article.locator('pre code')).toBeVisible()
	})

	test('blok kodu przewija się we własnym pudełku', async ({ page }) => {
		// Bez tego długa linia kodu rozpycha całą stronę w poziomie.
		await page.goto('/blog/pierwszy-wpis')

		const overflow = await page
			.locator('pre')
			.first()
			.evaluate(element => getComputedStyle(element).overflowX)

		expect(overflow).toMatch(/auto|scroll/)
	})

	test('strona nie przewija się w poziomie', async ({ page }) => {
		await page.goto('/blog/pierwszy-wpis')

		const overflows = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
		)

		expect(overflows, 'treść wpisu rozpycha stronę w poziomie').toBe(false)
	})

	test('prowadzi z powrotem do listy', async ({ page }) => {
		await page.goto('/blog/pierwszy-wpis')

		await page.getByRole('link', { name: 'Wszystkie wpisy' }).click()

		await expect(page).toHaveURL(/\/blog$/)
	})

	test('data publikacji jest maszynowo czytelna', async ({ page }) => {
		// `<time>` bez atrybutu datetime to dla wyszukiwarki zwykły napis.
		await page.goto('/blog/pierwszy-wpis')

		await expect(page.locator('time').first()).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/)
	})
})

/**
 * Strona niesie KILKA bloków JSON-LD: layout dokłada opis firmy i serwisu,
 * strona wpisu swój własny graf. Dlatego encji szukamy we wszystkich blokach
 * naraz, a nie w pierwszym z brzegu — inaczej test zależałby od kolejności
 * renderowania, która nie jest niczym gwarantowana.
 */
async function structuredEntities(page: import('@playwright/test').Page) {
	const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()

	return blocks.flatMap(block => {
		const parsed = JSON.parse(block) as Record<string, unknown>

		return (parsed['@graph'] as Record<string, unknown>[]) ?? [parsed]
	})
}

test.describe('dane strukturalne wpisu', () => {
	test('opisuje wpis jako Article z datą publikacji', async ({ page }) => {
		await page.goto('/blog/pierwszy-wpis')

		const article = (await structuredEntities(page)).find(entity => entity['@type'] === 'Article')

		expect(article, 'brak encji Article').toBeTruthy()
		expect(article?.headline).toContain('Jak zacząć nowy projekt')
		expect(article?.datePublished).toBe('2026-08-20')
	})

	test('zawiera ścieżkę okruszków prowadzącą do listy', async ({ page }) => {
		await page.goto('/blog/pierwszy-wpis')

		const breadcrumb = (await structuredEntities(page)).find(
			entity => entity['@type'] === 'BreadcrumbList'
		)

		expect(breadcrumb?.itemListElement).toHaveLength(2)
	})

	test('lista wpisów nie udaje artykułu', async ({ page }) => {
		// Encja Article na stronie listy jest dla Google błędem — opisuje treść,
		// której na tej stronie nie ma.
		await page.goto('/blog')

		const article = (await structuredEntities(page)).find(entity => entity['@type'] === 'Article')

		expect(article).toBeUndefined()
	})
})

test.describe('wersje językowe', () => {
	test('angielska lista pokazuje angielski wpis', async ({ page }) => {
		await page.goto('/en/blog')

		await expect(page.getByText('Starting a new project')).toBeVisible()
	})

	test('polski wpis nie jest osiągalny pod angielskim adresem', async ({ request }) => {
		// Slugi są różne dla każdego języka, więc adres z drugiego języka
		// nie może przypadkiem otworzyć wpisu w niewłaściwym.
		const response = await request.get('/en/blog/pierwszy-wpis')

		expect(response.status()).toBe(404)
	})
})

test.describe('sitemap', () => {
	test('wymienia opublikowane wpisy', async ({ request }) => {
		const body = await (await request.get('/sitemap.xml')).text()

		expect(body).toContain('/blog/pierwszy-wpis')
		expect(body).toContain('/en/blog/getting-started')
	})

	test('NIE wymienia szkiców', async ({ request }) => {
		// Adres szkicu zwraca 404, więc w sitemapie byłby zgłoszony Google
		// jako błąd i obniżał zaufanie do całej sitemapy.
		const body = await (await request.get('/sitemap.xml')).text()

		expect(body).not.toContain('/blog/szkic')
	})
})

test.describe('obraz Open Graph wpisu', () => {
	test('wpis ma WŁASNY obraz, nie ogólny obraz strony', async ({ page }) => {
		// Bez osobnego `opengraph-image.tsx` wpisy dziedziczą miniaturę strony
		// głównej. Widać to dopiero po wklejeniu linku na Facebooka.
		await page.goto('/blog/pierwszy-wpis')
		const postImage = await page
			.locator('meta[property="og:image"]')
			.first()
			.getAttribute('content')

		await page.goto('/')
		const homeImage = await page
			.locator('meta[property="og:image"]')
			.first()
			.getAttribute('content')

		expect(postImage).toBeTruthy()
		expect(postImage, 'wpis dziedziczy ogólny obraz strony').not.toBe(homeImage)
		expect(postImage).toContain('/blog/pierwszy-wpis/')
	})

	test('obraz wpisu naprawdę się serwuje', async ({ page, request }) => {
		// Adres w metadanych może istnieć, a plik nie — trasa generująca obraz
		// wywraca się przy błędzie w szablonie i wtedy link dostaje pustą
		// miniaturę zamiast obrazu.
		await page.goto('/blog/pierwszy-wpis')

		const url = await page.locator('meta[property="og:image"]').first().getAttribute('content')
		const path = new URL(url ?? '').pathname + new URL(url ?? '').search

		const response = await request.get(path)

		expect(response.status()).toBe(200)
		expect(response.headers()['content-type']).toContain('image/png')
		// Pusty obraz Satori waży kilkaset bajtów; prawdziwy — dziesiątki kilobajtów.
		expect((await response.body()).byteLength).toBeGreaterThan(10_000)
	})
})
