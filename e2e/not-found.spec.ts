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
	// Miasto i realizacja spoza listy też tu trafiają: przy `dynamicParams = false`
	// router traktuje taki adres jak brak trasy, a nie jak `notFound()` z widoku.
	for (const path of [
		'/nie-ma-takiej-strony',
		'/en/no-such-page',
		'/dev/nie-ma-takiej-strony',
		'/frezowanie-pod-ogrzewanie-podlogowe/nie-ma-takiego-miasta',
		'/realizacje/nie-ma-takiej-realizacji',
	]) {
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
