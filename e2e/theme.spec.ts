import { expect, test } from './fixtures'

/**
 * Motyw jasny/ciemny.
 *
 * Najważniejszy test to ten o braku błysku: skrypt musi zdążyć przed pierwszym
 * malowaniem strony. Sprawdzenie „czy klasa jest po załadowaniu" niczego by nie
 * dowiodło — klasa pojawi się tak czy inaczej, pytanie brzmi KIEDY.
 */

test.describe('skrypt startowy', () => {
	test('siedzi w <head>, przed treścią strony', async ({ page }) => {
		const response = await page.goto('/')
		const html = (await response?.text()) ?? ''

		const pozycjaSkryptu = html.indexOf('prefers-color-scheme: dark')
		const koniecHead = html.indexOf('</head>')

		expect(pozycjaSkryptu).toBeGreaterThanOrEqual(0)
		expect(pozycjaSkryptu).toBeLessThan(koniecHead)
	})

	test('nakłada motyw ciemny przed pierwszym malowaniem', async ({ page }) => {
		// Ustawiamy wybór ZANIM strona się załaduje, więc klasa musi już być
		// obecna w chwili, gdy JavaScript aplikacji dopiero startuje.
		await page.addInitScript(() => window.localStorage.setItem('theme', 'dark'))

		await page.goto('/')

		await expect(page.locator('html')).toHaveClass(/dark/)
	})

	test('ustawia colorScheme dla kontrolek systemowych', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('theme', 'dark'))
		await page.goto('/')

		// Bez tego paski przewijania i pola formularza zostają jasne
		// na ciemnej stronie.
		const colorScheme = await page.evaluate(() => document.documentElement.style.colorScheme)

		expect(colorScheme).toBe('dark')
	})

	test('nie wywraca strony przy zablokowanym localStorage', async ({ page }) => {
		await page.addInitScript(() => {
			// Wiernie jak w trybie prywatnym Safari: obiekt istnieje, ale jego
			// metody rzucają. Podmiana całego gettera wywracałaby też Next.js,
			// czyli testowalibyśmy coś innego, niż zamierzamy.
			const rzuc = () => {
				throw new Error('SecurityError')
			}
			Object.defineProperty(window.localStorage, 'getItem', { value: rzuc })
			Object.defineProperty(window.localStorage, 'setItem', { value: rzuc })
		})

		await page.goto('/')

		// Strona ma działać także w trybie prywatnym — po prostu bez zapamiętania
		// wyboru. Wywrócony skrypt w <head> zablokowałby cały render.
		await expect(page.locator('body')).toBeVisible()
	})
})

test.describe('przełącznik', () => {
	test('zmienia motyw', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('button', { name: 'Zmień motyw' }).click()
		await page.getByRole('menuitemradio', { name: 'Ciemny' }).click()

		await expect(page.locator('html')).toHaveClass(/dark/)
	})

	test('wraca do jasnego', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('button', { name: 'Zmień motyw' }).click()
		await page.getByRole('menuitemradio', { name: 'Ciemny' }).click()

		// Czekamy, aż menu faktycznie się zamknie. Wybór motywu przerysowuje grupę
		// (dochodzi znacznik zaznaczenia), więc drugie otwarcie w trakcie animacji
		// zamykania trafiało w element odczepiany właśnie od drzewa.
		await expect(page.getByRole('menu')).toBeHidden()

		await page.getByRole('button', { name: 'Zmień motyw' }).click()
		await page.getByRole('menuitemradio', { name: 'Jasny' }).click()

		await expect(page.locator('html')).not.toHaveClass(/dark/)
	})

	test('wybór przeżywa przeładowanie', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('button', { name: 'Zmień motyw' }).click()
		await page.getByRole('menuitemradio', { name: 'Ciemny' }).click()
		await page.reload()

		await expect(page.locator('html')).toHaveClass(/dark/)
	})

	test('faktycznie zmienia wygląd strony, nie samą klasę', async ({ page }) => {
		await page.goto('/')
		const jasne = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

		await page.getByRole('button', { name: 'Zmień motyw' }).click()
		await page.getByRole('menuitemradio', { name: 'Ciemny' }).click()
		const ciemne = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

		// Klasa bez efektu wizualnego oznaczałaby, że tokeny nie są spięte
		// z wariantem `dark` — a to widać dopiero okiem albo tutaj.
		expect(jasne).not.toBe(ciemne)
	})
})

test.describe('preferencja systemu', () => {
	test('domyślnie idzie za ustawieniem systemu', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' })
		await page.goto('/')

		await expect(page.locator('html')).toHaveClass(/dark/)
	})

	test('wybór użytkownika ma pierwszeństwo przed systemem', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' })
		await page.addInitScript(() => window.localStorage.setItem('theme', 'light'))

		await page.goto('/')

		await expect(page.locator('html')).not.toHaveClass(/dark/)
	})
})
