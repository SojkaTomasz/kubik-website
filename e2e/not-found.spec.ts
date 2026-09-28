import { expect, test } from './fixtures'

/**
 * Strony 404. O tym, która granica się wyrenderuje, decyduje router, a nie kod
 * widoku — więc nie da się tego sprawdzić jednostkowo. Różnica wyszła dopiero
 * na buildzie produkcyjnym; ten plik pilnuje, żeby flaga
 * `experimental.globalNotFound` nie zniknęła po cichu.
 */

/** Przeglądarka zapisuje status 404 w konsoli jako błąd — tutaj oczekiwany. */
const allow404 = {
	annotation: { type: 'allowed-console-errors', description: 'oczekiwany status 404' },
}

test.describe('adres bez pasującej trasy', () => {
	for (const path of ['/nie-ma-takiej-strony', '/en/no-such-page', '/dev/nie-ma-takiej-strony']) {
		test(`${path} zwraca 404 z naszą stroną, nie wbudowaną`, allow404, async ({ page }) => {
			const response = await page.goto(path)

			expect(response?.status()).toBe(404)

			// Treść wbudowanej strony Next.js — jej obecność oznacza, że nasza
			// strona 404 nie została w ogóle wyrenderowana.
			await expect(page.getByText('This page could not be found')).toHaveCount(0)
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

			// Bez linku wyjściowego 404 jest ślepym zaułkiem: użytkownikowi zostaje
			// tylko przycisk „wstecz", a robot wyszukiwarki nie ma dokąd pójść.
			await expect(page.locator('main a[href="/"]').first()).toBeVisible()
		})
	}

	test('strona 404 nie trafia do indeksu', allow404, async ({ page }) => {
		await page.goto('/nie-ma-takiej-strony')

		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
	})

	test('strona 404 dostaje style i motyw', allow404, async ({ page }) => {
		await page.goto('/nie-ma-takiej-strony')

		// Brak tła z tokenu oznacza, że oglądamy wbudowaną stronę Next.js.
		// `global-not-found.tsx` omija root layout, więc importuje `globals.css`
		// ręcznie — bez tego strona jest poprawna, ale zupełnie bez stylów.
		const background = await page
			.locator('body')
			.evaluate(element => getComputedStyle(element).backgroundColor)

		expect(background).not.toBe('rgba(0, 0, 0, 0)')
	})
})

test.describe('notFound() z widoku', () => {
	test('nieistniejący wpis bloga pokazuje 404 w szacie strony', allow404, async ({ page }) => {
		const response = await page.goto('/blog/nie-ma-takiego-wpisu')

		expect(response?.status()).toBe(404)

		// Ta granica 404 renderuje się WEWNĄTRZ root layoutu, więc — inaczej niż
		// `global-not-found` — ma nagłówek i stopkę strony.
		await expect(page.locator('header')).toBeVisible()
		await expect(page.locator('footer')).toBeVisible()
	})

	test('404 wpisu bloga mówi w języku adresu', allow404, async ({ page }) => {
		await page.goto('/en/blog/no-such-post')

		await expect(page.locator('html')).toHaveAttribute('lang', 'en')
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(/not found/i)
	})
})
