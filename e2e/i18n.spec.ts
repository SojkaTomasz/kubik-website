import { expect, test } from './fixtures'

/**
 * Wielojęzyczność sprawdzana od strony użytkownika i robota.
 *
 * Kluczowa rzecz, której nie da się przetestować jednostkowo: czy `proxy.ts`
 * faktycznie działa. W Next.js 16 plik zmienił nazwę z `middleware.ts`, a stara
 * nazwa nie daje błędu przy budowaniu — plik po prostu nigdy się nie uruchamia.
 * Objawem jest błąd dopiero w czasie działania strony.
 */

test.describe('routing językowy', () => {
	test('język domyślny działa bez prefiksu', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('html')).toHaveAttribute('lang', 'pl')
	})

	test('drugi język działa pod swoim prefiksem', async ({ page }) => {
		await page.goto('/en')

		await expect(page.locator('html')).toHaveAttribute('lang', 'en')
	})

	test('treść faktycznie się tłumaczy', async ({ page }) => {
		await page.goto('/')
		const polish = await page.locator('h1, h2').first().textContent()

		await page.goto('/en')
		const english = await page.locator('h1, h2').first().textContent()

		expect(polish).toBeTruthy()
		expect(english).toBeTruthy()
		expect(polish).not.toBe(english)
	})

	test(
		'nieznany język zwraca 404, nie pustą stronę',
		{
			// Przeglądarka zapisuje status 404 w konsoli jako błąd. Tutaj to
			// oczekiwany wynik testu, a nie usterka.
			annotation: { type: 'allowed-console-errors', description: 'oczekiwany status 404' },
		},
		async ({ page }) => {
			// Segment [locale] działa jak catch-all, więc bez kontroli w layoucie
			// /cokolwiek renderowałoby stronę z pustymi tłumaczeniami.
			const response = await page.goto('/xx')

			expect(response?.status()).toBe(404)
		}
	)
})

test.describe('zasięg proxy', () => {
	// Pojedynczy ukośnik przed kropką w matcherze proxy zmienia wykluczenie
	// plików w wykluczenie wszystkiego. Objaw jest mylący: strona główna działa,
	// a każda podstrona zwraca 404.
	test('podstrona w języku domyślnym działa BEZ prefiksu', async ({ request }) => {
		const response = await request.get('/polityka-prywatnosci')

		expect(response.status(), 'proxy nie przepisuje ścieżek — sprawdź matcher').toBe(200)
	})

	test('jawny prefiks języka domyślnego przekierowuje na adres bez prefiksu', async ({
		request,
	}) => {
		// Przy localePrefix: 'as-needed' /pl i / to ten sam dokument. Bez
		// przekierowania byłby to duplikat treści widziany przez Google.
		const response = await request.get('/pl', { maxRedirects: 0 })

		expect(response.status()).toBe(307)
		// next-intl zwraca ścieżkę względną — przeglądarka rozwija ją sama.
		expect(response.headers()['location']).toBe('/')
	})

	test('proxy nie dotyka tras wykluczonych', async ({ request }) => {
		// Plik z kropką w nazwie i strony /dev muszą działać bez przepisania.
		for (const path of ['/sitemap.xml', '/robots.txt', '/favicon.ico', '/dev']) {
			const response = await request.get(path)

			expect(response.status(), `${path} nie odpowiada`).toBe(200)
		}
	})
})

test.describe('przełącznik języka', () => {
	test('przenosi na tę samą stronę w drugim języku', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('button', { name: /Zmień język/i }).click()
		await page.getByRole('menuitemradio', { name: 'Angielski' }).click()

		await expect(page).toHaveURL(/\/en$/)
		await expect(page.locator('html')).toHaveAttribute('lang', 'en')
	})

	test('działa też w drugą stronę', async ({ page }) => {
		await page.goto('/en')

		await page.getByRole('button', { name: /Change language|Zmień język/i }).click()
		await page.getByRole('menuitemradio', { name: /Polish|Polski/ }).click()

		await expect(page.locator('html')).toHaveAttribute('lang', 'pl')
	})
})

/**
 * Linki wewnętrzne muszą zostawać w bieżącym języku. Usterka jest cicha: adres
 * istnieje i strona się otwiera, tylko język podmienia się pod użytkownikiem.
 */
test.describe('linki świadome języka', () => {
	test('przycisk z href zostaje w wersji angielskiej', async ({ page }) => {
		await page.goto('/en')

		const contact = page.getByRole('link', { name: 'Contact' }).first()
		await expect(contact).toHaveAttribute('href', '/en/kontakt')

		await contact.click()

		await expect(page).toHaveURL(/\/en\/kontakt$/)
		await expect(page.locator('html')).toHaveAttribute('lang', 'en')
	})

	test('ten sam zapis w języku domyślnym zostaje bez prefiksu', async ({ page }) => {
		await page.goto('/')

		// localePrefix: 'as-needed' — wersja polska ma zachować krótki adres.
		await expect(page.getByRole('link', { name: 'Kontakt' }).first()).toHaveAttribute(
			'href',
			'/kontakt'
		)
	})

	test('trasy spoza routingu językowego NIE dostają prefiksu', async ({ page }) => {
		await page.goto('/en')

		// /dev leży poza segmentem [locale]; /en/dev nie istnieje.
		const devLink = page.locator('a[href="/dev"]').first()
		await expect(devLink).toBeVisible()
		await expect(page.locator('a[href="/en/dev"]')).toHaveCount(0)
	})
})

/**
 * Interfejs poza treścią też musi się tłumaczyć. Łatwe do przeoczenia, bo
 * nagłówek i lead są przetłumaczone — polskie zostają przełącznik i baner.
 */
test.describe('interfejs poza treścią jest przetłumaczony', () => {
	/*
	 * Baner jest modalem blokującym, więc fixtures domyślnie zaziarnia zapisaną
	 * zgodę — inaczej modal przykryłby stronę i testy niżej niczego by nie kliknęły.
	 * Tutaj zaziarnienie wyłączamy, bo to właśnie baner oglądamy.
	 */
	test.describe('warstwa zgód', () => {
		test.use({ consentSeeded: false })

		test('baner zgody mówi po angielsku', async ({ page }) => {
			await page.goto('/en')

			const banner = page.getByRole('dialog', { name: 'Cookie consent' })

			await expect(banner).toBeVisible()
			await expect(banner.getByRole('button', { name: 'Accept' })).toBeVisible()
			await expect(banner.getByRole('button', { name: 'Settings' })).toBeVisible()
		})

		test('kategorie zgód mówią po angielsku', async ({ page }) => {
			await page.goto('/en')

			// `exact: true` — stopka niesie „Cookie settings", a domyślne dopasowanie
			// Playwrighta szuka podciągu, więc bez tego locator trafia w oba przyciski.
			await page.getByRole('button', { name: 'Settings', exact: true }).click()

			for (const label of ['Necessary', 'Analytics', 'Marketing', 'Preferences']) {
				await expect(page.getByText(label, { exact: true })).toBeVisible()
			}
		})
	})
})

test.describe('sygnały dla wyszukiwarki', () => {
	test('każda wersja językowa wskazuje pozostałe', async ({ page, baseURL }) => {
		for (const [path, expectedCanonical] of [
			['/', String(baseURL)],
			['/en', `${baseURL}/en`],
		]) {
			await page.goto(String(path))

			await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
				'href',
				String(expectedCanonical)
			)
			await expect(page.locator('link[rel="alternate"][hreflang="pl"]')).toHaveCount(1)
			await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1)
		}
	})

	test('każda wersja ma własny obraz Open Graph', async ({ page }) => {
		await page.goto('/')
		const polski = await page.locator('meta[property="og:image"]').getAttribute('content')

		await page.goto('/en')
		const angielski = await page.locator('meta[property="og:image"]').getAttribute('content')

		expect(polski).not.toBe(angielski)
	})

	test('og:locale używa formatu oczekiwanego przez Facebooka', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pl_PL')
	})
})
