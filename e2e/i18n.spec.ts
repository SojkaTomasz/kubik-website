import { expect, test } from './fixtures'

/**
 * Routing przy jednym języku (`locales = ['pl']`, AGENTS.md: „Strona
 * jednojęzyczna"), sprawdzany od strony użytkownika i robota.
 *
 * Kluczowa rzecz, której nie da się przetestować jednostkowo: czy `proxy.ts`
 * faktycznie działa. W Next.js 16 plik zmienił nazwę z `middleware.ts`, a stara
 * nazwa nie daje błędu przy budowaniu — plik po prostu nigdy się nie uruchamia.
 * Objawem jest błąd dopiero w czasie działania strony.
 */

/** Przeglądarka zapisuje status 404 w konsoli jako błąd — tu to oczekiwany wynik. */
const allow404 = {
	annotation: { type: 'allowed-console-errors', description: 'oczekiwany status 404' },
}

test.describe('routing językowy', () => {
	test('strona działa bez prefiksu języka', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('html')).toHaveAttribute('lang', 'pl')
	})

	test('wyłączony język zwraca 404, nie stronę bez tłumaczeń', allow404, async ({ page }) => {
		// Angielski jest w `supportedLocales`, ale nie w `locales` — jego adres
		// nie może wyrenderować strony.
		const response = await page.goto('/en')

		expect(response?.status()).toBe(404)
	})

	test('nieznany język zwraca 404, nie pustą stronę', allow404, async ({ page }) => {
		// Segment [locale] działa jak catch-all, więc bez kontroli w layoucie
		// /cokolwiek renderowałoby stronę z pustymi tłumaczeniami.
		const response = await page.goto('/xx')

		expect(response?.status()).toBe(404)
	})
})

test.describe('zasięg proxy', () => {
	// Pojedynczy ukośnik przed kropką w matcherze proxy zmienia wykluczenie
	// plików w wykluczenie wszystkiego. Objaw jest mylący: strona główna działa,
	// a każda podstrona zwraca 404.
	test('podstrony działają BEZ prefiksu', async ({ request }) => {
		for (const path of [
			'/polityka-prywatnosci',
			'/frezowanie-pod-ogrzewanie-podlogowe',
			'/frezowanie-pod-ogrzewanie-podlogowe/krakow',
			'/realizacje',
		]) {
			const response = await request.get(path)

			expect(response.status(), `${path}: proxy nie przepisuje ścieżek — sprawdź matcher`).toBe(
				200
			)
		}
	})

	test('jawny prefiks języka przekierowuje na adres bez prefiksu', async ({ request }) => {
		// /pl i / to ten sam dokument. Bez przekierowania byłby to duplikat
		// treści widziany przez Google.
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

test.describe('jeden język w interfejsie', () => {
	test('nie ma przełącznika języka', async ({ page }) => {
		await page.goto('/')

		await expect(page.getByRole('button', { name: /Zmień język/i })).toHaveCount(0)
	})

	test('linki wewnętrzne mają krótki adres, bez prefiksu', async ({ page }) => {
		await page.goto('/')

		await expect(page.getByRole('link', { name: 'Kontakt' }).first()).toHaveAttribute(
			'href',
			'/kontakt'
		)
		await expect(page.locator('a[href^="/pl/"]')).toHaveCount(0)
	})
})

test.describe('sygnały dla wyszukiwarki', () => {
	test('canonical bez prefiksu i bez hreflang', async ({ page, baseURL }) => {
		await page.goto('/')

		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', String(baseURL))
		// `hreflang` wskazujący wyłącznie samą stronę to dla Google szum.
		await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0)
	})

	test('og:locale używa formatu oczekiwanego przez Facebooka', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pl_PL')
	})
})
